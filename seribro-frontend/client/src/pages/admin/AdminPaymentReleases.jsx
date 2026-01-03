// src/pages/admin/AdminPaymentReleases.jsx
// Admin Payment Releases - Full Implementation with Filters, Pagination, and Bulk Actions

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import paymentApi from '../../apis/paymentApi';
import { toast } from 'react-toastify';
import { getMessage } from '../../utils/toastUtils';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  X,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import PaymentReleaseCard from '../../components/admin/PaymentReleaseCard';
import ReleaseConfirmationModal from '../../components/admin/ReleaseConfirmationModal';
import BulkReleaseModal from '../../components/admin/BulkReleaseModal';

const AdminPaymentReleases = () => {
  // State Management
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    dateRange: 'all', // today, 7days, 30days, all
    searchQuery: '', // project name or company name
    sortBy: 'oldest' // oldest, newest, highest_amount
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Selection & Bulk Actions
  const [selectedPaymentIds, setSelectedPaymentIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Modals
  const [releaseModal, setReleaseModal] = useState({
    isOpen: false,
    payment: null
  });

  const [bulkReleaseModal, setBulkReleaseModal] = useState({
    isOpen: false,
    paymentIds: []
  });

  /**
   * Load pending payment releases from API
   */
  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await paymentApi.getPendingReleases({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      if (response.success) {
        setPayments(response.data.payments || []);
        setPagination(response.data.pagination || {
          page: pagination.page,
          limit: pagination.limit,
          total: response.data.payments?.length || 0,
          pages: 1
        });
        setSelectedPaymentIds(new Set());
        setSelectAll(false);
      } else {
        toast.error(getMessage(response, 'Failed to load payments'));
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error(getMessage(error, 'Failed to load payment releases'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  /**
   * Load payments on component mount and when filters change
   */
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  /**
   * Calculate statistics
   */
  const stats = useMemo(() => {
    return {
      totalReleases: pagination.total,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      oldestAge: payments.length > 0 
        ? Math.ceil((Date.now() - new Date(payments[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0
    };
  }, [payments, pagination]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  /**
   * Handle search input
   */
  const handleSearch = (e) => {
    const value = e.target.value;
    handleFilterChange('searchQuery', value);
  };

  /**
   * Handle checkbox selection
   */
  const handleSelectPayment = (paymentId) => {
    const newSelected = new Set(selectedPaymentIds);
    if (newSelected.has(paymentId)) {
      newSelected.delete(paymentId);
    } else {
      newSelected.add(paymentId);
    }
    setSelectedPaymentIds(newSelected);
    setSelectAll(false);
  };

  /**
   * Handle select all
   */
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPaymentIds(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(payments.map(p => p._id));
      setSelectedPaymentIds(allIds);
      setSelectAll(true);
    }
  };

  /**
   * Open release confirmation modal
   */
  const handleReleaseClick = (payment) => {
    setReleaseModal({
      isOpen: true,
      payment
    });
  };

  /**
   * Close release modal
   */
  const handleCloseReleaseModal = () => {
    setReleaseModal({
      isOpen: false,
      payment: null
    });
  };

  /**
   * Confirm single payment release
   */
  const handleConfirmRelease = async (paymentId, releaseData) => {
    try {
      setReleasing(paymentId);
      const response = await paymentApi.releasePayment(paymentId, releaseData);

      if (response.success) {
        toast.success('Payment released successfully!');
        handleCloseReleaseModal();
        // Remove the released payment from the list
        setPayments(prev => prev.filter(p => p._id !== paymentId));
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } else {
        toast.error(getMessage(response, 'Failed to release payment'));
      }
    } catch (error) {
      console.error('Error releasing payment:', error);
      toast.error(getMessage(error, 'Failed to release payment'));
    } finally {
      setReleasing(null);
    }
  };

  /**
   * Open bulk release modal
   */
  const handleBulkReleaseClick = () => {
    if (selectedPaymentIds.size === 0) {
      toast.error('Please select at least one payment');
      return;
    }
    setBulkReleaseModal({
      isOpen: true,
      paymentIds: Array.from(selectedPaymentIds)
    });
  };

  /**
   * Close bulk release modal
   */
  const handleCloseBulkReleaseModal = () => {
    setBulkReleaseModal({
      isOpen: false,
      paymentIds: []
    });
  };

  /**
   * Confirm bulk payment release
   */
  const handleConfirmBulkRelease = async (releaseData) => {
    try {
      setReleasing('bulk');
      const response = await paymentApi.bulkReleasePayments(
        Array.from(selectedPaymentIds),
        releaseData
      );

      if (response.success) {
        const released = response.data?.released || selectedPaymentIds.size;
        const failed = response.data?.failed || 0;
        
        toast.success(`Released ${released} payments${failed > 0 ? `, ${failed} failed` : ''}!`);
        handleCloseBulkReleaseModal();
        
        // Remove released payments from the list
        setPayments(prev => prev.filter(p => !selectedPaymentIds.has(p._id)));
        setPagination(prev => ({
          ...prev,
          total: Math.max(0, prev.total - released)
        }));
        setSelectedPaymentIds(new Set());
        setSelectAll(false);
      } else {
        toast.error(response.message || 'Failed to release payments');
      }
    } catch (error) {
      console.error('Error releasing payments:', error);
      toast.error(error.message || 'Failed to release payments');
    } finally {
      setReleasing(null);
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => `₹${parseInt(amount).toLocaleString('en-IN')}`;

  /**
   * Format date
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (direction) => {
    const newPage = direction === 'next' ? pagination.page + 1 : pagination.page - 1;
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Pending Payment Releases
          </h1>
          <p className="text-gray-400">
            Manage and release payments to students
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium mb-1">
                  Total Pending Releases
                </p>
                <p className="text-3xl font-bold text-blue-100">
                  {stats.totalReleases}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-400 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium mb-1">
                  Total Pending Amount
                </p>
                <p className="text-3xl font-bold text-green-100">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium mb-1">
                  Oldest Pending Age
                </p>
                <p className="text-3xl font-bold text-orange-100">
                  {stats.oldestAge}
                </p>
                <p className="text-orange-300 text-xs mt-1">days</p>
              </div>
              <Clock className="w-12 h-12 text-orange-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-slate-800/60 border border-white/10 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full bg-slate-700 border border-white/10 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full bg-slate-700 border border-white/10 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="oldest">Oldest First</option>
                <option value="newest">Newest First</option>
                <option value="highest_amount">Highest Amount First</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Project or company name..."
                  value={filters.searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-slate-700 border border-white/10 text-white rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedPaymentIds.size > 0 && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-8 flex items-center justify-between">
            <div>
              <p className="text-blue-100 font-medium">
                {selectedPaymentIds.size} payment{selectedPaymentIds.size !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={handleBulkReleaseClick}
              disabled={releasing === 'bulk'}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded font-medium transition-colors"
            >
              {releasing === 'bulk' ? 'Processing...' : `Release ${selectedPaymentIds.size} Selected`}
            </button>
          </div>
        )}

        {/* Payments List */}
        <div className="space-y-4 mb-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/60 border border-white/10 rounded-lg">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg">No pending payment releases</p>
              <p className="text-gray-500 text-sm mt-2">All payments are up to date</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment._id}
                className="flex gap-4 items-start bg-slate-800/60 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
              >
                {/* Checkbox */}
                <div className="mt-2">
                  <input
                    type="checkbox"
                    checked={selectedPaymentIds.has(payment._id)}
                    onChange={() => handleSelectPayment(payment._id)}
                    className="w-5 h-5 rounded border-gray-500 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Payment Card */}
                <div className="flex-1">
                  <PaymentReleaseCard
                    payment={{
                      _id: payment._id,
                      companyLogo: payment.company?.logo || '',
                      companyName: payment.company?.companyName || 'Unknown',
                      projectTitle: payment.project?.title || 'Untitled',
                      projectId: payment.project?._id,
                      studentName: payment.student?.name || 'Unknown',
                      studentId: payment.student?._id,
                      amount: payment.amount,
                      releaseReadySince: payment.capturedAt || payment.createdAt,
                      paymentHistory: payment.transactionHistory || []
                    }}
                    onRelease={() => handleReleaseClick(payment)}
                    onViewProject={(data) => {
                      // Navigate to project details if needed
                      console.log('View project:', data);
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between bg-slate-800/60 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.pages} • {pagination.total} total payments
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={pagination.page === 1}
                className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => handlePageChange('next')}
                disabled={pagination.page === pagination.pages}
                className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Release Confirmation Modal */}
      {releaseModal.isOpen && releaseModal.payment && (
        <ReleaseConfirmationModal
          payment={releaseModal.payment}
          isLoading={releasing === releaseModal.payment._id}
          onConfirm={handleConfirmRelease}
          onClose={handleCloseReleaseModal}
        />
      )}

      {/* Bulk Release Modal */}
      {bulkReleaseModal.isOpen && (
        <BulkReleaseModal
          paymentCount={bulkReleaseModal.paymentIds.length}
          totalAmount={payments
            .filter(p => bulkReleaseModal.paymentIds.includes(p._id))
            .reduce((sum, p) => sum + (p.amount || 0), 0)}
          isLoading={releasing === 'bulk'}
          onConfirm={handleConfirmBulkRelease}
          onClose={handleCloseBulkReleaseModal}
        />
      )}
    </div>
  );
};

export default AdminPaymentReleases;