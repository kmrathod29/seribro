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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hinglish: Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Manage your profile and track verification status</p>
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
            {/* Hinglish: Verification Alert Banner */}
            <div className="mb-6">
              <div
                className={`p-4 rounded-lg border-l-4 ${
                  dashboard.verification.status === 'approved'
                    ? 'bg-green-50 border-l-green-600'
                    : dashboard.verification.status === 'rejected'
                    ? 'bg-red-50 border-l-red-600'
                    : 'bg-yellow-50 border-l-yellow-600'
                }`}
              >
                <div className="flex items-start">
                  {dashboard.verification.status === 'approved' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                  ) : dashboard.verification.status === 'rejected' ? (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  )}
                  <div>
                    <h3
                      className={`font-semibold ${
                        dashboard.verification.status === 'approved'
                          ? 'text-green-800'
                          : dashboard.verification.status === 'rejected'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}
                    >
                      {dashboard.verification.statusMessage}
                    </h3>
                    {dashboard.verification.rejectionReason && (
                      <p className="text-sm text-red-700 mt-1">
                        Reason: {dashboard.verification.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hinglish: Profile Completion Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Hinglish: Profile Completion Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      strokeDasharray={`${(dashboard.profileCompletion.percentage / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {dashboard.profileCompletion.percentage}%
                    </span>
                  </div>
                </div>
                <p className="text-center text-gray-600">
                  {dashboard.profileCompletion.percentage === 100
                    ? 'Profile Complete'
                    : `${100 - dashboard.profileCompletion.percentage}% remaining`}
                </p>
              </div>

              {/* Hinglish: Account Overview Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900 truncate">
                      {dashboard.student.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {dashboard.student.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Verification Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        dashboard.verification.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : dashboard.verification.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {dashboard.verification.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hinglish: Documents Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Resume</span>
                    {dashboard.documents.resume.uploaded ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">College ID</span>
                    {dashboard.documents.collegeId.uploaded ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Certificates</span>
                    <span className="text-gray-900 font-medium">
                      {dashboard.documents.certificates.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hinglish: Basic Info Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {dashboard.basicInfo.fullName || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">
                    {dashboard.basicInfo.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">College Name</p>
                  <p className="font-medium text-gray-900">
                    {dashboard.basicInfo.collegeName || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Degree</p>
                  <p className="font-medium text-gray-900">
                    {dashboard.basicInfo.degree || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Branch</p>
                  <p className="font-medium text-gray-900">
                    {dashboard.basicInfo.branch || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Graduation Year</p>
                  <p className="font-medium text-gray-900">
                    {dashboard.basicInfo.graduationYear || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Hinglish: Profile Analytics Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Technical Skills</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboard.analytics.skillsCount.technical}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Soft Skills</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboard.analytics.skillsCount.soft}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Languages</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboard.analytics.skillsCount.languages}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Projects</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboard.projectsCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Hinglish: Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => navigate('/student/profile')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FileText className="w-4 h-4" />
                Edit Profile
              </button>

              {dashboard.verification.status === 'rejected' ? (
                <button
                  onClick={handleSubmitVerification}
                  disabled={submitLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                >
                  {submitLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Re-Submit for Verification
                </button>
              ) : dashboard.verification.status !== 'approved' && dashboard.profileCompletion.percentage >= 50 ? (
                <button
                  onClick={handleSubmitVerification}
                  disabled={submitLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {submitLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Submit for Verification
                </button>
              ) : null}
            </div>

            {/* Hinglish: Notifications Section */}
            {dashboard.notifications && dashboard.notifications.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
                <div className="space-y-3">
                  {dashboard.notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-900">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-semibold capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {notif.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
