// src/pages/admin/AdminVerification.jsx
// Complete Admin Verification Panel with tabs, lists, modals - Phase 3
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Eye,
  RefreshCw,
  Clock,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import AdminProfilePreview from '../../components/admin/AdminProfilePreview';
import {
  getPendingStudents,
  getPendingCompanies,
  getStudentDetails,
  getCompanyDetails,
  approveStudent,
  rejectStudent,
  approveCompany,
  rejectCompany,
  formatApiError,
} from '../../apis/adminVerificationApi';

// Hinglish: Main Admin Verification Panel Component
export default function AdminVerification() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'companies'
  const [studentsList, setStudentsList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  // Hinglish: Preview modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewType, setPreviewType] = useState(null); // 'student' or 'company'

  // Hinglish: Approve/Reject modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'approve' or 'reject'
  const [modalProfileId, setModalProfileId] = useState(null);
  const [modalProfileType, setModalProfileType] = useState(null); // 'student' or 'company'
  const [rejectionReason, setRejectionReason] = useState('');

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStudents(), loadCompanies()]);
    } catch (error) {
      console.error('Load error:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await getPendingStudents();
      setStudentsList(res.data || []);
    } catch (error) {
      console.error('Load students error:', error);
      alert(String(error?.message || 'Failed to load pending students'));
    }
  };

  const loadCompanies = async () => {
    try {
      const res = await getPendingCompanies();
      setCompaniesList(res.data || []);
    } catch (error) {
      console.error('Load companies error:', error);
      alert(String(error?.message || 'Failed to load pending companies'));
    }
  };

  // Hinglish: Preview karne ke liye data fetch karo
  const handleViewProfile = async (profileId, type) => {
    try {
      setPreviewLoading(true);
      const res =
        type === 'student'
          ? await getStudentDetails(profileId)
          : await getCompanyDetails(profileId);
      setPreviewData(res.data);
      setPreviewType(type);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Preview error:', error);
      alert(String(error?.message || 'Failed to load profile'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setTimeout(() => {
      setPreviewData(null);
      setPreviewType(null);
    }, 300);
  };

  // Hinglish: Modal open karne ka function
  const openApprovalModal = (profileId, type, action) => {
    setModalProfileId(profileId);
    setModalProfileType(type);
    setModalAction(action);
    setRejectionReason('');
    setModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      setActionId(modalProfileId);

      if (modalProfileType === 'student') {
        await approveStudent(modalProfileId);
      } else {
        await approveCompany(modalProfileId);
      }

      alert(`${modalProfileType.capitalize()} approved successfully! ✅`);
      setModalOpen(false);
      
      // Reload appropriate list
      if (modalProfileType === 'student') {
        await loadStudents();
      } else {
        await loadCompanies();
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert(String(error?.message || 'Failed to approve'));
    } finally {
      setActionLoading(false);
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      setActionId(modalProfileId);

      if (modalProfileType === 'student') {
        await rejectStudent(modalProfileId, rejectionReason);
      } else {
        await rejectCompany(modalProfileId, rejectionReason);
      }

      alert(`${modalProfileType.capitalize()} rejected. Notification sent! ❌`);
      setModalOpen(false);
      setRejectionReason('');

      // Reload appropriate list
      if (modalProfileType === 'student') {
        await loadStudents();
      } else {
        await loadCompanies();
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert(String(error?.message || 'Failed to reject'));
    } finally {
      setActionLoading(false);
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="animate-spin text-gold mx-auto mb-4" size={40} />
            <p className="text-gray-600">Loading verification data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-navy mb-2">
          Profile <span className="text-primary">Verification</span>
        </h1>
        <p className="text-gray-600">Review and verify pending student and company profiles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm mb-1 font-semibold">Pending Students</p>
              <p className="text-4xl font-black text-blue-600">{studentsList.length}</p>
              <p className="text-gray-600 text-xs mt-1">Awaiting review</p>
            </div>
            <Users className="text-blue-300 opacity-50" size={56} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm mb-1 font-semibold">Pending Companies</p>
              <p className="text-4xl font-black text-purple-600">{companiesList.length}</p>
              <p className="text-gray-600 text-xs mt-1">Awaiting review</p>
            </div>
            <Building2 className="text-purple-300 opacity-50" size={56} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-4 px-6 font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'students'
                ? 'bg-primary text-white border-b-4 border-primary'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={20} />
            Students ({studentsList.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`flex-1 py-4 px-6 font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'companies'
                ? 'bg-primary text-white border-b-4 border-primary'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building2 size={20} />
            Companies ({companiesList.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-x-auto">
          {activeTab === 'students' ? (
            <StudentsList
              students={studentsList}
              onView={handleViewProfile}
              onApprove={(id) => openApprovalModal(id, 'student', 'approve')}
              onReject={(id) => openApprovalModal(id, 'student', 'reject')}
              actionLoading={actionLoading}
              actionId={actionId}
            />
          ) : (
            <CompaniesList
              companies={companiesList}
              onView={handleViewProfile}
              onApprove={(id) => openApprovalModal(id, 'company', 'approve')}
              onReject={(id) => openApprovalModal(id, 'company', 'reject')}
              actionLoading={actionLoading}
              actionId={actionId}
            />
          )}
        </div>
      </div>

      {/* Profile Preview Modal */}
      <AdminProfilePreview
        isOpen={previewOpen && !previewLoading}
        profileData={previewData}
        profileType={previewType}
        onClose={handleClosePreview}
      />

      {/* Approve/Reject Modal */}
      <ApprovalModal
        isOpen={modalOpen}
        action={modalAction}
        profileType={modalProfileType}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={() => setModalOpen(false)}
        loading={actionLoading}
      />
      </div>
    </div>
  );
}

/**
 * Hinglish: Students ki list table component
 */
function StudentsList({
  students,
  onView,
  onApprove,
  onReject,
  actionLoading,
  actionId,
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gradient-to-r from-navy/5 to-primary/5 border-b-2 border-gray-200">
          <th className="px-6 py-4 text-left text-sm font-bold text-navy">Name</th>
          <th className="px-6 py-4 text-left text-sm font-bold text-navy">Email</th>
          <th className="px-6 py-4 text-left text-sm font-bold text-navy">College</th>
          <th className="px-6 py-4 text-center text-sm font-bold text-navy">Profile %</th>
          <th className="px-6 py-4 text-left text-sm font-bold text-navy">Submitted</th>
          <th className="px-6 py-4 text-center text-sm font-bold text-navy">Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.length === 0 ? (
          <tr>
            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p>No pending student profiles</p>
            </td>
          </tr>
        ) : (
          students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-6 py-4 text-sm font-semibold text-navy">{student.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{student.college || 'N/A'}</td>
              <td className="px-6 py-4 text-center">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                  {student.profileCompletion}%
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(student.submittedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onView(student.id, 'student')}
                    className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors duration-300"
                    title="View profile"
                    disabled={actionLoading && actionId === student.id}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onApprove(student.id)}
                    className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors duration-300 disabled:opacity-50"
                    title="Approve"
                    disabled={actionLoading && actionId === student.id}
                  >
                    {actionLoading && actionId === student.id ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => onReject(student.id)}
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors duration-300 disabled:opacity-50"
                    title="Reject"
                    disabled={actionLoading && actionId === student.id}
                  >
                    {actionLoading && actionId === student.id ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <XCircle size={18} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

/**
 * Hinglish: Companies ki list table component
 */
function CompaniesList({
  companies,
  onView,
  onApprove,
  onReject,
  actionLoading,
  actionId,
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gradient-to-r from-navy/5 to-primary/5 border-b-2 border-gray-200">
          <th className="px-6 py-4 text-left text-sm font-bold text-navy">Company Name</th>
          <th className="px-6 py-4 text-left text-sm font-bold text-navy">Email</th>
          <th className="px-6 py-4 text-left text-sm font-bold text-navy">Industry</th>
          <th className="px-6 py-4 text-center text-sm font-bold text-navy">Profile %</th>
          <th className="px-6 py-4 text-left text-sm font-bold text-navy">Submitted</th>
          <th className="px-6 py-4 text-center text-sm font-bold text-navy">Actions</th>
        </tr>
      </thead>
      <tbody>
        {companies.length === 0 ? (
          <tr>
            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p>No pending company profiles</p>
            </td>
          </tr>
        ) : (
          companies.map((company) => (
            <tr
              key={company.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-6 py-4 text-sm font-semibold text-navy">{company.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{company.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{company.industryType || 'N/A'}</td>
              <td className="px-6 py-4 text-center">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  {company.profileCompletionPercentage}%
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(company.submittedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onView(company.id, 'company')}
                    className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors duration-300"
                    title="View profile"
                    disabled={actionLoading && actionId === company.id}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onApprove(company.id)}
                    className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors duration-300 disabled:opacity-50"
                    title="Approve"
                    disabled={actionLoading && actionId === company.id}
                  >
                    {actionLoading && actionId === company.id ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => onReject(company.id)}
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors duration-300 disabled:opacity-50"
                    title="Reject"
                    disabled={actionLoading && actionId === company.id}
                  >
                    {actionLoading && actionId === company.id ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <XCircle size={18} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

/**
 * Hinglish: Approve/Reject ka modal component
 */
function ApprovalModal({
  isOpen,
  action,
  profileType,
  rejectionReason,
  onReasonChange,
  onApprove,
  onReject,
  onClose,
  loading,
}) {
  if (!isOpen) return null;

  const isApprove = action === 'approve';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Hinglish: Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-11/12 overflow-hidden">
        {/* Header */}
        <div
          className={`p-6 text-white font-bold text-lg flex items-center gap-3 ${
            isApprove
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}
        >
          {isApprove ? <CheckCircle size={24} /> : <XCircle size={24} />}
          {isApprove ? 'Approve Profile?' : 'Reject Profile?'}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Message */}
          <p className="text-gray-700">
            {isApprove
              ? `Are you sure you want to approve this ${profileType} profile? They will be notified immediately.`
              : `Are you sure you want to reject this ${profileType} profile? Please provide a reason.`}
          </p>

          {/* Rejection Reason Input */}
          {!isApprove && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Explain why the profile is being rejected..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {rejectionReason.length}/500 characters
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={isApprove ? onApprove : onReject}
              disabled={loading || (!isApprove && !rejectionReason.trim())}
              className={`flex-1 px-4 py-3 rounded-lg text-white font-bold transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2 ${
                isApprove
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              }`}
            >
              {loading ? (
                <Loader className="animate-spin" size={18} />
              ) : isApprove ? (
                <>
                  <CheckCircle size={18} />
                  Approve
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  Reject
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
