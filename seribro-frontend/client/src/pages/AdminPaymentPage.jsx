// src/pages/AdminPaymentPage.jsx
// Admin Payment Management Dashboard

import React, { useState, useEffect, useCallback } from 'react';
import { releasePayment, getAdminPayments } from '@/apis/paymentApi';
import { Search, RefreshCw, DollarSign, Clock, AlertCircle } from 'lucide-react';
import PaymentReleaseCard from '@/components/admin/PaymentReleaseCard';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

const AdminPaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [summary, setSummary] = useState({});

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminPayments({ page: currentPage, limit: 20 });

      if (res.success) {
        setPayments(res.data.payments || []);
        const pag = res.data.pagination || {};
        setPagination({
          total: pag.total || 0,
          pages: pag.pages || 1,
          current: pag.page || currentPage,
        });
        const stats = res.data.stats || {};
        setSummary({ platformRevenue: stats.platformRevenue || 0, released: stats.released || 0, pending: stats.pending || 0 });
      } else {
        toast.error(String(res?.message || 'Failed to load payments'));
      }
    } catch (error) {
      toast.error('Error loading payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const [confirmReleaseId, setConfirmReleaseId] = useState(null);

  const handleRelease = async (payment) => {
    // show inline confirm row instead
    setConfirmReleaseId(payment._id);
  };

  const confirmRelease = async (payment) => {
    try {
      const res = await releasePayment(payment._id, {
        notes: `Released on ${new Date().toLocaleDateString('en-IN')} by admin`,
      });

      if (res.success) {
        toast.success('Payment released successfully');
        setPayments(payments.filter((p) => p._id !== payment._id));
        setConfirmReleaseId(null);
      } else {
        toast.error(String(res?.message || 'Failed to release payment'));
      }
    } catch (error) {
      toast.error('Error releasing payment');
      console.error(error);
    }
  };

  const cancelReleaseConfirm = () => setConfirmReleaseId(null);

  const handleViewProject = ({ projectId }) => {
    window.open(`/admin/projects/${projectId}`, '_blank');
  };

  const filteredPayments = payments.filter(p => {
    const query = search.toLowerCase();
    return (
      p.projectTitle?.toLowerCase().includes(query) ||
      p.studentName?.toLowerCase().includes(query) ||
      p.companyName?.toLowerCase().includes(query)
    );
  });


  const urgentCount = filteredPayments.filter(p => {
    const days = Math.floor((Date.now() - new Date(p.releaseReadySince)) / (24 * 60 * 60 * 1000));
    return days >= 3;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy/90 to-navy/70">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payment Release Dashboard</h1>
          <p className="text-gray-400">Manage and release pending student payments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Ready for Release</p>
            <p className="text-2xl font-bold text-green-300">{filteredPayments.length}</p>
            <p className="text-xs text-gray-400 mt-1">Released: {summary?.released ?? 0}</p>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Platform Revenue</p>
            <p className="text-2xl font-bold text-blue-300">₹{(summary?.platformRevenue || 0).toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Pending Count</p>
            <p className="text-2xl font-bold text-yellow-300">{summary?.pending ?? filteredPayments.length}</p>
          </div>

          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Urgent (3+ days)</p>
            <p className="text-2xl font-bold text-red-300">{urgentCount}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search project, student, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
            />
          </div>
          <button
            onClick={loadPayments}
            className="px-4 py-2 bg-gold hover:bg-gold/90 text-navy font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-gray-400">
            <p>Loading payments...</p>
          </div>
        )}

        {/* Payment Cards */}
        {!loading && filteredPayments.length > 0 ? (
          <div className="space-y-4 mb-8">
            {filteredPayments.map((payment) => (
              <div key={payment._id}>
                <PaymentReleaseCard
                  payment={payment}
                  onRelease={() => handleRelease(payment)}
                  onViewProject={handleViewProject}
                />
                {confirmReleaseId === payment._id && (
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => cancelReleaseConfirm()} className="px-3 py-2 bg-gray-700 text-white rounded">Cancel</button>
                    <button onClick={() => confirmRelease(payment)} className="px-3 py-2 bg-gold text-navy rounded">Confirm Release</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No pending payments found</p>
            <p className="text-sm text-gray-500 mt-2">Payments will appear here when they are ready for release.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-400">
              Page {pagination.current} of {pagination.pages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentPage;
