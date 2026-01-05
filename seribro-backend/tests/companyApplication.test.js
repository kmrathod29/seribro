const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const CompanyProfile = require('../backend/models/companyProfile');
const StudentProfile = require('../backend/models/StudentProfile');
const User = require('../backend/models/User');
const Project = require('../backend/models/Project');
const Application = require('../backend/models/Application');
const { approveStudentForProject, acceptApplication } = require('../backend/controllers/companyApplicationController');
const { getProjectApplications, getAllCompanyApplications } = require('../backend/controllers/companyApplicationController');
const { getProjectDetails } = require('../backend/controllers/studentProjectController');

let replSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

afterEach(async () => {
  await Promise.all(Object.keys(mongoose.connection.collections).map(key => mongoose.connection.collections[key].deleteMany({})));
});

test('approveStudentForProject transitions application and project states correctly', async () => {
  // Create user documents
  const companyUser = await User.create({ email: 'comp@test.com', password: 'CompanyPass1!', role: 'company' });
  const studentUser1 = await User.create({ email: 's1@test.com', password: 'StudentPass1!', role: 'student' });
  const studentUser2 = await User.create({ email: 's2@test.com', password: 'StudentPass2!', role: 'student' });

  const companyProfile = await CompanyProfile.create({ user: companyUser._id, companyName: 'C1' });
  const studentModel1 = await (require('../backend/models/Student')).create({ user: studentUser1._id, fullName: 'S1', college: 'C1' });
  const studentModel2 = await (require('../backend/models/Student')).create({ user: studentUser2._id, fullName: 'S2', college: 'C1' });
  const studentProfile1 = await StudentProfile.create({ student: studentModel1._id, user: studentUser1._id, basicInfo: { fullName: 'S1' } });
  const studentProfile2 = await StudentProfile.create({ student: studentModel2._id, user: studentUser2._id, basicInfo: { fullName: 'S2' } });

  const project = await Project.create({
    company: companyUser._id,
    companyId: companyProfile._id,
    title: 'P1',
    description: 'desc',
    category: 'Web Development',
    requiredSkills: ['JS'],
    budgetMin: 10,
    budgetMax: 100,
    projectDuration: '1 week',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    createdBy: companyUser._id,
  });

  const app1 = await Application.create({ project: project._id, projectId: project._id, student: studentProfile1._id, studentId: studentProfile1._id, company: companyProfile._id, companyId: companyProfile._id, coverLetter: 'a'.repeat(60), proposedPrice: 100, estimatedTime: '1-2 months' });
  const app2 = await Application.create({ project: project._id, projectId: project._id, student: studentProfile2._id, studentId: studentProfile2._id, company: companyProfile._id, companyId: companyProfile._id, coverLetter: 'b'.repeat(60), proposedPrice: 90, estimatedTime: '1-2 months' });

  // Mock req/res
  const req = { params: { applicationId: app1._id.toString() }, user: { _id: companyUser._id } };
  const res = {
    status: function() { return this; },
    json: function() { return this; }
  };

  // small wait to ensure oplog snapshot availability on in-memory replSet
  await new Promise((r) => setTimeout(r, 100));

  await approveStudentForProject(req, res);

  // Reload from DB
  const updatedApp1 = await Application.findById(app1._id);
  const updatedApp2 = await Application.findById(app2._id);
  const updatedProject = await Project.findById(project._id);

  expect(updatedApp1.status).toBe('accepted');
  expect(updatedApp1.acceptedAt).toBeTruthy();
  expect(updatedApp2.status).toBe('rejected');
  expect(updatedProject.status).toBe('assigned');
  expect(updatedProject.assignedStudent.toString()).toBe(studentProfile1._id.toString());
});

test('prevent double assignment when a project already assigned', async () => {
  const companyUser = await User.create({ email: 'comp2@test.com', password: 'CompanyPass1!', role: 'company' });
  const studentUser1 = await User.create({ email: 's3@test.com', password: 'StudentPass1!', role: 'student' });
  const studentUser2 = await User.create({ email: 's4@test.com', password: 'StudentPass2!', role: 'student' });

  const companyProfile = await CompanyProfile.create({ user: companyUser._id, companyName: 'C2' });
  const studentModel1 = await (require('../backend/models/Student')).create({ user: studentUser1._id, fullName: 'S3', college: 'C1' });
  const studentModel2 = await (require('../backend/models/Student')).create({ user: studentUser2._id, fullName: 'S4', college: 'C1' });
  const studentProfile1 = await StudentProfile.create({ student: studentModel1._id, user: studentUser1._id, basicInfo: { fullName: 'S3' } });
  const studentProfile2 = await StudentProfile.create({ student: studentModel2._id, user: studentUser2._id, basicInfo: { fullName: 'S4' } });

  const project = await Project.create({
    company: companyUser._id,
    companyId: companyProfile._id,
    title: 'P2',
    description: 'desc',
    category: 'Web Development',
    requiredSkills: ['JS'],
    budgetMin: 10,
    budgetMax: 100,
    projectDuration: '1 week',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    createdBy: companyUser._id,
  });

  const app1 = await Application.create({ project: project._id, projectId: project._id, student: studentProfile1._id, studentId: studentProfile1._id, company: companyProfile._id, companyId: companyProfile._id, coverLetter: 'c'.repeat(60), proposedPrice: 100, estimatedTime: '1-2 months' });
  const app2 = await Application.create({ project: project._id, projectId: project._id, student: studentProfile2._id, studentId: studentProfile2._id, company: companyProfile._id, companyId: companyProfile._id, coverLetter: 'd'.repeat(60), proposedPrice: 90, estimatedTime: '1-2 months' });

  const req1 = { params: { applicationId: app1._id.toString() }, user: { _id: companyUser._id } };
  const res = { status: function() { return this; }, json: function() { return this; } };
  await approveStudentForProject(req1, res);

  // Attempt to approve second
  const req2 = { params: { applicationId: app2._id.toString() }, user: { _id: companyUser._id } };
  await approveStudentForProject(req2, res);

  const finalApp2 = await Application.findById(app2._id);
  const finalProject = await Project.findById(project._id);

  expect(finalApp2.status).not.toBe('accepted');
  expect(finalProject.assignedStudent.toString()).toBe(studentProfile1._id.toString());
});

test('legacy acceptApplication works similarly and rejects others', async () => {
  const companyUser = await User.create({ email: 'comp3@test.com', password: 'CompanyPass1!', role: 'company' });
  const studentUser1 = await User.create({ email: 's5@test.com', password: 'StudentPass1!', role: 'student' });
  const studentUser2 = await User.create({ email: 's6@test.com', password: 'StudentPass2!', role: 'student' });

  const companyProfile = await CompanyProfile.create({ user: companyUser._id, companyName: 'C3' });
  const studentModel1 = await (require('../backend/models/Student')).create({ user: studentUser1._id, fullName: 'S5', college: 'C1' });
  const studentModel2 = await (require('../backend/models/Student')).create({ user: studentUser2._id, fullName: 'S6', college: 'C1' });
  const studentProfile1 = await StudentProfile.create({ student: studentModel1._id, user: studentUser1._id, basicInfo: { fullName: 'S5' } });
  const studentProfile2 = await StudentProfile.create({ student: studentModel2._id, user: studentUser2._id, basicInfo: { fullName: 'S6' } });

  const project = await Project.create({
    company: companyUser._id,
    companyId: companyProfile._id,
    title: 'P3',
    description: 'desc',
    category: 'Web Development',
    requiredSkills: ['JS'],
    budgetMin: 10,
    budgetMax: 100,
    projectDuration: '1 week',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    createdBy: companyUser._id,
  });

  const app1 = await Application.create({ project: project._id, projectId: project._id, student: studentProfile1._id, studentId: studentProfile1._id, company: companyProfile._id, companyId: companyProfile._id, coverLetter: 'e'.repeat(60), proposedPrice: 100, estimatedTime: '1-2 months' });
  const app2 = await Application.create({ project: project._id, projectId: project._id, student: studentProfile2._id, studentId: studentProfile2._id, company: companyProfile._id, companyId: companyProfile._id, coverLetter: 'f'.repeat(60), proposedPrice: 90, estimatedTime: '1-2 months' });

  const req = { params: { applicationId: app1._id.toString() }, user: { _id: companyUser._id } };
  const res = { status: function() { return this; }, json: function() { return this; } };

  await acceptApplication(req, res);

  const updatedApp1 = await Application.findById(app1._id);
  const updatedApp2 = await Application.findById(app2._id);
  const updatedProject = await Project.findById(project._id);

  expect(updatedApp1.status).toBe('accepted');
  expect(updatedApp2.status).toBe('rejected');
  expect(updatedProject.status).toBe('assigned');
});

test('project/application listing filters reflect status changes after accept', async () => {
  const companyUser = await User.create({ email: 'comp4@test.com', password: 'CompanyPass1!', role: 'company' });
  const studentUser1 = await User.create({ email: 's7@test.com', password: 'StudentPass1!', role: 'student' });
  const studentUser2 = await User.create({ email: 's8@test.com', password: 'StudentPass2!', role: 'student' });

  const companyProfile = await CompanyProfile.create({ user: companyUser._id, companyName: 'C4' });
  const studentModel1 = await (require('../backend/models/Student')).create({ user: studentUser1._id, fullName: 'S7', college: 'C1' });
  const studentModel2 = await (require('../backend/models/Student')).create({ user: studentUser2._id, fullName: 'S8', college: 'C1' });
  const studentProfile1 = await StudentProfile.create({ student: studentModel1._id, user: studentUser1._id, basicInfo: { fullName: 'S7' } });
  const studentProfile2 = await StudentProfile.create({ student: studentModel2._id, user: studentUser2._id, basicInfo: { fullName: 'S8' } });

  const project = await Project.create({
    company: companyUser._id,
    companyId: companyProfile._id,
    title: 'P4',
    description: 'desc',
    category: 'Web Development',
    requiredSkills: ['JS'],
    budgetMin: 10,
    budgetMax: 100,
    projectDuration: '1 week',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    createdBy: companyUser._id,
  });

  const app1 = await Application.create({ project: project._id, projectId: project._id, student: studentProfile1._id, studentId: studentProfile1._id, company: companyProfile._id, companyId: companyProfile._id, coverLetter: 'g'.repeat(60), proposedPrice: 100, estimatedTime: '1-2 months' });
  const app2 = await Application.create({ project: project._id, projectId: project._id, student: studentProfile2._id, studentId: studentProfile2._id, company: companyProfile._id, companyId: companyProfile._id, coverLetter: 'h'.repeat(60), proposedPrice: 90, estimatedTime: '1-2 months' });

  // Approve first
  const reqApprove = { params: { applicationId: app1._id.toString() }, user: { _id: companyUser._id } };
  const res = { status: function(code) { this._status = code; return this; }, json: function(obj) { this._body = obj; return this; } };
  await approveStudentForProject(reqApprove, res);

  // Now fetch project applications with status=accepted
  const reqListAccepted = { params: { projectId: project._id.toString() }, query: { status: 'accepted' }, user: { _id: companyUser._id } };
  const resAccepted = { status: function(code) { this._status = code; return this; }, json: function(obj) { this._body = obj; return this; } };
  await getProjectApplications(reqListAccepted, resAccepted);
  expect(resAccepted._body.data.applications.length).toBe(1);
  expect(resAccepted._body.data.applications[0].status).toBe('accepted');

  // Fetch all and ensure count matches (accepted + rejected)
  const reqListAll = { params: { projectId: project._id.toString() }, query: { status: 'all' }, user: { _id: companyUser._id } };
  const resAll = { status: function(code) { this._status = code; return this; }, json: function(obj) { this._body = obj; return this; } };
  await getProjectApplications(reqListAll, resAll);
  const statuses = resAll._body.data.applications.map(a => a.status);
  expect(statuses).toContain('accepted');
  expect(statuses).toContain('rejected');
});

// New test: getProjectDetails should return hasApplied when a student has applied
test('getProjectDetails returns hasApplied true for student who applied', async () => {
  const companyUser = await User.create({ email: 'comp5a@test.com', password: 'CompanyPass1!', role: 'company' });
  const studentUser = await User.create({ email: 's9a@test.com', password: 'StudentPass1!', role: 'student' });

  const companyProfile = await CompanyProfile.create({ user: companyUser._id, companyName: 'C5a' });
  const studentModel = await (require('../backend/models/Student')).create({ user: studentUser._id, fullName: 'S9a', college: 'C1' });
  const studentProfile = await StudentProfile.create({ student: studentModel._id, user: studentUser._id, basicInfo: { fullName: 'S9a' } });

  const project = await Project.create({
    company: companyUser._id,
    companyId: companyProfile._id,
    title: 'P5a',
    description: 'desc',
    category: 'Web Development',
    requiredSkills: ['JS'],
    budgetMin: 10,
    budgetMax: 100,
    projectDuration: '1 week',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    createdBy: companyUser._id,
  });

  const application = await Application.create({ project: project._id, projectId: project._id, student: studentProfile._id, studentId: studentProfile._id, company: companyProfile._id, companyId: companyProfile._id, coverLetter: 'z'.repeat(60), proposedPrice: 50, estimatedTime: '1-2 months' });

  const req = { params: { id: project._id.toString() }, user: { id: studentUser._id } };
  const res = { status: function(code) { this._status = code; return this; }, json: function(obj) { this._body = obj; return this; } };

  await getProjectDetails(req, res);

  expect(res._body.success).toBe(true);
  expect(res._body.data).toBeTruthy();
  expect(res._body.data.project).toBeTruthy();
  expect(res._body.data.project.hasApplied).toBe(true);
  expect(res._body.data.project.applicationStatus).toBe('pending');
});

test('cannot accept non-pending/shortlisted application', async () => {
  const companyUser = await User.create({ email: 'comp5@test.com', password: 'CompanyPass1!', role: 'company' });
  const studentUser1 = await User.create({ email: 's9@test.com', password: 'StudentPass1!', role: 'student' });

  const companyProfile = await CompanyProfile.create({ user: companyUser._id, companyName: 'C5' });
  const studentModel1 = await (require('../backend/models/Student')).create({ user: studentUser1._id, fullName: 'S9', college: 'C1' });
  const studentProfile1 = await StudentProfile.create({ student: studentModel1._id, user: studentUser1._id, basicInfo: { fullName: 'S9' } });

  const project = await Project.create({
    company: companyUser._id,
    companyId: companyProfile._id,
    title: 'P5',
    description: 'desc',
    category: 'Web Development',
    requiredSkills: ['JS'],
    budgetMin: 10,
    budgetMax: 100,
    projectDuration: '1 week',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    createdBy: companyUser._id,
  });

  const app = await Application.create({ project: project._id, projectId: project._id, student: studentProfile1._id, studentId: studentProfile1._id, company: companyProfile._id, companyId: companyProfile._id, coverLetter: 'i'.repeat(60), proposedPrice: 100, estimatedTime: '1-2 months', status: 'rejected' });

  const req = { params: { applicationId: app._id.toString() }, user: { _id: companyUser._id } };
  const res = { status: function(code) { this._status = code; return this; }, json: function(obj) { this._body = obj; return this; } };

  await approveStudentForProject(req, res);

  expect(res._status).toBe(400);
  expect(res._body.success).toBe(false);
  expect(res._body.message).toMatch(/already rejected/i);
});
