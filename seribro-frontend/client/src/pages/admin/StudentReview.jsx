import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminAPI from '../../apis/adminApi';
import AdminLayout from '../../components/AdminLayout';
import { ArrowLeft, CheckCircle, XCircle, FileText, Award, Briefcase, Mail, GraduationCap } from 'lucide-react';

export default function StudentReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await AdminAPI.get(`/student/${id}`);
      setData(res.data.data);
    } catch (err) {
      toast.error(String(err?.response?.data?.message || 'Details load nahi hue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const approve = async () => {
    if (!window.confirm('Kya aap sure ho? Student approve karna hai?')) return;
    try {
      setActionLoading(true);
      await AdminAPI.post(`/student/${id}/approve`);
      toast.success('Student approved ✔️');
      navigate('/admin/students/pending');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approve fail ho gaya');
    } finally { setActionLoading(false); }
  };

  const reject = async () => {
    const reason = window.prompt('Reject reason likho (required):');
    if (!reason) { alert('Reason required hai'); return; }
    try {
      setActionLoading(true);
      await AdminAPI.post(`/student/${id}/reject`, { reason });
      alert('Student rejected ❌');
      navigate('/admin/students/pending');
    } catch (err) {
      alert(err.response?.data?.message || 'Reject fail ho gaya');
    } finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-primary border-t-gold rounded-full"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-red-600 font-medium">Record nahi mila</p>
        </div>
      </AdminLayout>
    );
  }

  const docs = data?.documents || {};
  const resumeUrl = docs?.resume?.path;
  const collegeIdUrl = docs?.collegeId?.path;
  const profileCompletion = data?.profileStats?.profileCompletion || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-navy transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-black text-navy">Student Review</h1>
              <p className="text-gray-600 mt-1">Detailed profile review and verification</p>
            </div>
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap size={32} />
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Student Name</p>
                <p className="text-2xl font-bold text-navy">{data?.basicInfo?.fullName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-green-600 flex items-center justify-center text-white">
                <Mail size={32} />
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Email Address</p>
                <p className="text-lg font-bold text-navy">{data?.basicInfo?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-navy">Profile Completion</h3>
            <span className="text-3xl font-black text-primary">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-primary to-primary-dark h-4 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* College Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="text-primary" size={24} />
              <h3 className="text-lg font-bold text-navy">College Information</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">College Name</p>
                <p className="font-semibold text-navy">{data?.basicInfo?.collegeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Year/Branch</p>
                <p className="font-semibold text-navy">{data?.basicInfo?.yearOfStudy || 'N/A'} / {data?.basicInfo?.branch || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-primary" size={24} />
              <h3 className="text-lg font-bold text-navy">Documents</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-2">Resume</p>
                {resumeUrl ? (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200 transition-colors"
                  >
                    <FileText size={16} className="mr-2" />
                    View Resume
                  </a>
                ) : (
                  <span className="text-gray-400">Not uploaded</span>
                )}
              </div>
              <div>
                <p className="text-gray-500 mb-2">College ID</p>
                {collegeIdUrl ? (
                  <a
                    href={collegeIdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-green-100 text-green-600 font-semibold hover:bg-green-200 transition-colors"
                  >
                    <FileText size={16} className="mr-2" />
                    View College ID
                  </a>
                ) : (
                  <span className="text-gray-400">Not uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        {(data?.projects || []).length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="text-primary" size={24} />
              <h3 className="text-xl font-bold text-navy">Projects ({data?.projects?.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projects.map((p) => (
                <div key={p._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary transition-colors">
                  <p className="font-semibold text-navy mb-2">{p.title}</p>
                  <p className="text-xs text-gray-600 mb-3">{p.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-1">
                    {(p.technologies || []).map((tech, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {(data?.skills || []).length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-primary" size={24} />
              <h3 className="text-xl font-bold text-navy">Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <button
            onClick={approve}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <CheckCircle size={20} />
            Approve Student
          </button>
          <button
            onClick={reject}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <XCircle size={20} />
            Reject Student
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
