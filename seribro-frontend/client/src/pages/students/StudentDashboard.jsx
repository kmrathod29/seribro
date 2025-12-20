// frontend/src/pages/students/StudentDashboard.jsx
// Student Dashboard Page - Phase 3
// Hinglish: Student ka main dashboard page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader,
  FileText,
  Award,
  Download,
  RefreshCw,
  TrendingUp,
  Pencil,
  XCircle,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  fetchStudentDashboard,
  submitStudentForVerification,
  resubmitStudentForVerification,
  formatApiError,
} from '../../apis/studentDashboardApi';

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const navigate = useNavigate();

  // Hinglish: Component load hone par dashboard data fetch karna
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudentDashboard();
      setDashboard(data);
    } catch (err) {
      const apiError = formatApiError(err);
      setError(apiError.message);
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVerification = async () => {
    try {
      setSubmitLoading(true);
      setSubmitMessage(null);

      let response;
      if (dashboard?.verification?.status === 'rejected') {
        // Hinglish: Rejected profile ko resubmit karna
        response = await resubmitStudentForVerification();
      } else {
        // Hinglish: Naya profile submit karna
        response = await submitStudentForVerification();
      }

      setSubmitMessage({
        type: 'success',
        text: response.message,
      });

      // Hinglish: 2 seconds baad dashboard reload karna
      setTimeout(() => {
        loadDashboard();
      }, 2000);
    } catch (err) {
      const apiError = formatApiError(err);
      setSubmitMessage({
        type: 'error',
        text: apiError.message,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f172a' }}>
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back,
            <span className="text-[#fb923c] ml-2">{dashboard?.basicInfo?.fullName || dashboard?.student?.email || 'Student'}</span>
          </h1>
          <p className="text-[#94a3b8] mt-2">Manage your profile and track verification status</p>
        </div>

        {/* Hinglish: Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hinglish: Submit message */}
        {submitMessage && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              submitMessage.type === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start">
              {submitMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              )}
              <div>
                <p
                  className={
                    submitMessage.type === 'success'
                      ? 'text-green-700'
                      : 'text-red-700'
                  }
                >
                  {submitMessage.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {dashboard && (
          <>
            {/* Top Hero Cards (Profile Completion, Verification, Action) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Profile Completion Card */}
              <div className="p-6 rounded-xl" style={{ background: '#0f172a' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium">Profile Completion</h3>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-[#334155] flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-[#fb923c]" />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">{dashboard.profileCompletion.percentage}%</div>
                        <p className="text-sm text-[#94a3b8]">{dashboard.profileCompletion.percentage === 100 ? 'Profile Complete' : 'Incomplete'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3 flex items-center">
                    <div className="w-full bg-[#334155] rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 rounded-full"
                        style={{
                          width: `${dashboard.profileCompletion.percentage}%`,
                          background: 'linear-gradient(90deg, #fb923c, #f97316)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Status Card */}
              <div className="p-6 rounded-xl" style={{ background: '#0f172a' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium">Verification Status</h3>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-[#334155] flex items-center justify-center">
                          {dashboard.verification.status === 'approved' ? (
                            <CheckCircle className="w-6 h-6 text-[#10b981]" />
                          ) : dashboard.verification.status === 'rejected' ? (
                            <XCircle className="w-6 h-6 text-[#ef4444]" />
                          ) : (
                            <Clock className="w-6 h-6 text-[#fbbf24]" />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white capitalize">{dashboard.verification.status}</div>
                        <p className="text-sm text-[#94a3b8] mt-1">{dashboard.verification.statusMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit / Action Card */}
              <div className="p-6 rounded-xl flex items-center justify-between" style={{ background: '#0f172a' }}>
                <div>
                  <h3 className="text-white font-medium">Profile Actions</h3>
                  <p className="text-sm text-[#94a3b8] mt-2">Complete or edit your profile to improve placement chances</p>
                </div>
                <div>
                  <button
                    onClick={() => navigate('/student/profile')}
                    className="inline-flex items-center gap-3 px-4 py-3 rounded-lg font-semibold"
                    style={{ background: '#f59e0b', color: '#0f172a' }}
                  >
                    <Pencil className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Redesigned: Information / Photo and Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Student Information Card */}
              <div className="p-6 rounded-xl" style={{ background: '#334155' }}>
                <h3 className="text-white text-lg font-semibold mb-4">Student Information</h3>
                <div className="grid grid-cols-1 gap-4 text-[#94a3b8]">
                  <div>
                    <p className="text-sm">Full Name</p>
                    <p className="text-white font-medium">{dashboard.basicInfo.fullName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm">Email</p>
                    <p className="text-white font-medium">{dashboard.student.email}</p>
                  </div>
                  <div>
                    <p className="text-sm">Mobile</p>
                    <p className="text-white font-medium">{dashboard.basicInfo.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm">City</p>
                    <p className="text-white font-medium">{dashboard.basicInfo.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm">College</p>
                    <p className="text-white font-medium">{dashboard.basicInfo.collegeName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm">Degree</p>
                    <p className="text-white font-medium">{dashboard.basicInfo.degree || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Profile Photo / College ID */}
              <div className="p-6 rounded-xl flex items-center justify-center" style={{ background: '#475569' }}>
                <div className="text-center">
                  <p className="text-sm text-[#94a3b8] mb-3">Your Profile Photo</p>
                  {(
                    dashboard.student.profilePhotoUrl || dashboard.documents.collegeId?.url
                  ) ? (
                    <img
                      src={dashboard.student.profilePhotoUrl || dashboard.documents.collegeId?.url}
                      alt="profile"
                      className="w-40 h-40 object-cover rounded-lg mx-auto border-2 border-[#0f172a]"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-lg mx-auto bg-[#0f172a] flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {((dashboard.basicInfo.fullName || dashboard.student.email) || 'S')
                          .split(' ')
                          .map(n => n[0])
                          .slice(0,2)
                          .join('')
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-[#94a3b8] mt-3">Your College ID</p>
                </div>
              </div>
            </div>

            {/* Action Items or Application Stats */}
            {dashboard.profileCompletion.percentage < 100 ? (
              <div className="p-6 rounded-xl mb-8" style={{ background: '#334155' }}>
                <h3 className="text-white text-lg font-semibold mb-4">Action Items</h3>
                <div className="space-y-3 text-[#94a3b8]">
                  {/* derive missing items */}
                  {(() => {
                    const items = [];
                    try {
                      if ((dashboard.analytics?.skillsCount?.technical || 0) < 1) items.push('Add technical skills');
                      if ((dashboard.projectsCount || 0) < 3) items.push('Upload at least 3 projects');
                      if (!dashboard.documents?.resume?.uploaded) items.push('Upload resume (PDF)');
                      if (!dashboard.documents?.collegeId?.uploaded) items.push('Upload college ID for verification');
                    } catch {
                      // ignore
                    }
                    if (items.length === 0) return <p className="text-[#94a3b8]">Complete the remaining items to reach 100%.</p>;
                    return (
                      <ul className="space-y-2">
                        {items.map((it, idx) => (
                          <li key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
                              <span className="text-white">{it}</span>
                            </div>
                            <button onClick={() => navigate('/student/profile')} className="text-sm font-semibold px-3 py-1 rounded bg-[#f59e0b] text-[#0f172a]">Go to Profile</button>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-xl" style={{ background: '#334155' }}>
                  <h4 className="text-white font-semibold">Applied Projects</h4>
                  <div className="text-3xl font-bold text-white mt-4">{dashboard.applicationStats?.applied || dashboard.appliedCount || 0}</div>
                </div>
                <div className="p-6 rounded-xl" style={{ background: '#334155' }}>
                  <h4 className="text-white font-semibold">Active Projects</h4>
                  <div className="text-3xl font-bold text-white mt-4">{dashboard.applicationStats?.active || 0}</div>
                </div>
                <div className="p-6 rounded-xl flex items-center justify-between" style={{ background: '#334155' }}>
                  <div>
                    <h4 className="text-white font-semibold">Verification</h4>
                    <p className="text-[#94a3b8] mt-2">{dashboard.verification.status}</p>
                  </div>
                  {dashboard.verification.status !== 'approved' && dashboard.verification.status !== 'pending' && (
                    <button onClick={handleSubmitVerification} disabled={submitLoading} className="px-4 py-2 rounded-lg font-semibold" style={{ background: '#f59e0b', color: '#0f172a' }}>
                      {submitLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Submit for Verification'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Profile Analytics Section (kept for quick stats) */}
            <div className="p-6 rounded-xl mb-8" style={{ background: '#334155' }}>
              <h3 className="text-white text-lg font-semibold mb-4">Profile Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[#94a3b8]">
                <div>
                  <p className="text-sm">Technical Skills</p>
                  <p className="text-2xl font-bold text-white">{dashboard.analytics.skillsCount.technical}</p>
                </div>
                <div>
                  <p className="text-sm">Soft Skills</p>
                  <p className="text-2xl font-bold text-white">{dashboard.analytics.skillsCount.soft}</p>
                </div>
                <div>
                  <p className="text-sm">Languages</p>
                  <p className="text-2xl font-bold text-white">{dashboard.analytics.skillsCount.languages}</p>
                </div>
                <div>
                  <p className="text-sm">Projects</p>
                  <p className="text-2xl font-bold text-white">{dashboard.projectsCount}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
