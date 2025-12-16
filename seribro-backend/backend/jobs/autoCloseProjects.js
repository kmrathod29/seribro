// backend/jobs/autoCloseProjects.js
// Hinglish: Auto-close expired projects job

const Project = require('../models/Project');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Hinglish: Expired projects ko automatically close karo
 * - Sab projects jinke deadline pass ho gayi aur assigned nahi hue
 * - In sab ko close kar do
 * - Applications ko reject karo
 * - Notifications create karo
 */
async function closeExpiredProjects() {
  try {
    console.log('\n📅 Starting auto-close job for expired projects...');

    const now = new Date();

    // Hinglish: Sab expired projects nikalo jo still open hain
    const expiredProjects = await Project.find({
      status: 'open',
      deadline: { $lt: now },
      assignedStudent: { $exists: false }
    });

    if (expiredProjects.length === 0) {
      console.log('✅ No expired projects to close');
      return;
    }

    console.log(`\n🔍 Found ${expiredProjects.length} expired projects to close`);

    // Hinglish: Har project ko handle karo
    for (const project of expiredProjects) {
      try {
        console.log(`\n⏳ Processing project: ${project.title}`);

        // Hinglish: Project ko close mark karo
        project.status = 'closed';
        project.closedAt = now;
        project.closedReason = 'Deadline passed without assignment';
        await project.save();

        console.log(`   ✅ Project closed: ${project.title}`);

        // Hinglish: Company ko notification bhejo
        const companyUser = await User.findById(project.createdBy);
        if (companyUser) {
          try {
            await Notification.create({
              userId: companyUser._id,
              userRole: 'company',
              message: `Your project "${project.title}" has been auto-closed because the deadline passed without any student being assigned.`,
              type: 'info',
              relatedProfileId: project._id
            });
            console.log(`   📬 Notification sent to company`);
          } catch (notifErr) {
            console.log(`   ⚠️  Could not send company notification: ${notifErr.message}`);
          }
        }

        // Hinglish: Pending aur shortlisted applications nikalo
        const pendingApplications = await Application.find({
          projectId: project._id,
          status: { $in: ['pending', 'shortlisted'] }
        });

        console.log(`   🔍 Found ${pendingApplications.length} pending/shortlisted applications`);

        // Hinglish: Sab ko reject karo
        if (pendingApplications.length > 0) {
          await Application.updateMany(
            {
              projectId: project._id,
              status: { $in: ['pending', 'shortlisted'] }
            },
            {
              $set: {
                status: 'rejected',
                rejectionReason: 'Project closed - deadline expired',
                rejectedAt: now
              }
            }
          );

          console.log(`   ✅ ${pendingApplications.length} applications rejected`);

          // Hinglish: Har student ko notification bhejo
          for (const app of pendingApplications) {
            try {
              const studentUser = await User.findById(app.student);
              if (studentUser) {
                await Notification.create({
                  userId: studentUser._id,
                  userRole: 'student',
                  message: `The project "${project.title}" you applied for has been closed because the deadline expired.`,
                  type: 'info',
                  relatedProfileId: app._id
                });
              }
            } catch (studentNotifErr) {
              console.log(`   ⚠️  Could not send student notification for app ${app._id}`);
            }
          }

          console.log(`   📬 Notifications sent to ${pendingApplications.length} students`);
        }
      } catch (projectError) {
        console.error(`\n❌ Error processing project ${project._id}:`, projectError.message);
        // Continue with next project
      }
    }

    console.log(`\n✅ Auto-close job completed successfully!`);
    console.log(`   Closed ${expiredProjects.length} projects\n`);
  } catch (error) {
    console.error('\n❌ Fatal error in auto-close job:', error);
  }
}

module.exports = { closeExpiredProjects };
