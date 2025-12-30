// src/components/studentComponent/StudentEarnings.jsx
// Student Earnings Dashboard - Phase 5.5

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Calendar,
  Eye,
  AlertCircle,
  BarChart3,
  LineChart as LineChartIcon,
  Download,
  ChevronRight,
  Award,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getStudentEarnings, getPaymentDetails } from '@/apis/paymentApi';
import PaymentDetailsModal from './PaymentDetailsModal';
import EarningsChart from './EarningsChart';

const StudentEarnings = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch earnings data on mount
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const response = await getStudentEarnings();
        
        if (response.success) {
          setData(response.data);
        } else {
          toast.error(response.message || 'Failed to fetch earnings');
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
        toast.error('Error loading earnings data');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  // Handle opening payment details modal
  const handleViewDetails = async (paymentId) => {
    try {
      setModalLoading(true);
      const response = await getPaymentDetails(paymentId);
      
      if (response.success) {
        setSelectedPayment(response.data);
        setShowModal(true);
      } else {
        toast.error(response.message || 'Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Error loading payment details');
    } finally {
      setModalLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  // Format date to relative format (e.g., "2 days ago")
  const formatRelativeDate = (date) => {
    if (!date) return 'N/A';
    
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return Math.floor(seconds) + 's ago';
  };

  // Format full date
  const formatFullDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge styles
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      captured: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      ready_for_release: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      released: 'bg-green-500/20 text-green-300 border-green-500/30',
      refunded: 'bg-red-500/20 text-red-300 border-red-500/30',
      failed: 'bg-red-500/20 text-red-300 border-red-500/30'
    };

    return styles[status] || styles.pending;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="h-96 bg-white/5 border border-white/10 rounded-lg animate-pulse" />

        {/* Table Skeleton */}
        <div className="h-80 bg-white/5 border border-white/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  // No earnings state
  if (!data || data.summary.totalEarned === 0 && !data.recentPayments.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Award className="w-10 h-10 text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No earnings yet</h3>
          <p className="text-gray-400 mb-6">
            Complete your first project to start earning! Each completed project will be listed here with payment details.
          </p>
          <a
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300"
          >
            Browse Projects
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const { summary, recentPayments, monthlyEarnings } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned Card */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/30 rounded-lg p-6 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Total Earned</p>
              <p className="text-3xl font-bold text-emerald-300 mb-2">
                {formatCurrency(summary.totalEarned)}
              </p>
              <p className="text-xs text-gray-500">From {summary.completedProjects} projects</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Pending Payments</p>
              <p className="text-3xl font-bold text-yellow-300 mb-2">
                {formatCurrency(summary.pendingPayments)}
              </p>
              <p className="text-xs text-gray-500">Awaiting admin approval</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Completed Projects Card */}
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-6 hover:border-blue-500/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Completed Projects</p>
              <p className="text-3xl font-bold text-blue-300 mb-2">
                {summary.completedProjects}
              </p>
              <p className="text-xs text-gray-500">Successfully completed</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Last Payment Date Card */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Last Payment</p>
              <p className="text-2xl font-bold text-purple-300 mb-2">
                {summary.lastPaymentDate ? formatRelativeDate(summary.lastPaymentDate) : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">{formatFullDate(summary.lastPaymentDate)}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Earnings Chart */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Monthly Earnings</h3>
            <p className="text-sm text-gray-400 mt-1">Last 12 months earnings breakdown</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'bar'
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
              title="Line Chart"
            >
              <LineChartIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {monthlyEarnings && monthlyEarnings.length > 0 ? (
          <EarningsChart data={monthlyEarnings} type={chartType} />
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">
            <p>No earnings data available yet</p>
          </div>
        )}
      </div>

      {/* Recent Payments Section */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Payments</h3>

        {recentPayments && recentPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Project Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Company</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date Received</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-start">
                        <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                          <DollarSign className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{payment.projectName || 'Unknown Project'}</p>
                          <p className="text-xs text-gray-500 mt-1">{payment.projectId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-300">{payment.companyName || 'Unknown Company'}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-white">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-500 mt-1">Net: {formatCurrency(payment.netAmount)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-300">{formatFullDate(payment.createdAt)}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatRelativeDate(payment.createdAt)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(payment.status)}`}>
                        {payment.status.replace(/_/g, ' ').charAt(0).toUpperCase() + payment.status.replace(/_/g, ' ').slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleViewDetails(payment._id)}
                        disabled={modalLoading}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs hidden sm:inline">Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No recent payments yet</p>
          </div>
        )}
      </div>

      {/* Withdrawal Section */}
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-lg flex-shrink-0">
            <Download className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">Payment Withdrawal</h4>
            <p className="text-gray-300 mb-4">
              Payments are released directly to your account after admin approval. Ensure your bank details are up to date to receive payments smoothly.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400 mb-2">Available for Withdrawal</p>
              <p className="text-2xl font-bold text-indigo-300">{formatCurrency(summary.availableForWithdrawal)}</p>
            </div>
            <button
              className="px-6 py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 rounded-lg hover:bg-indigo-500/30 transition-colors disabled:opacity-50 cursor-not-allowed"
              disabled
              title="Feature coming soon"
            >
              Add Bank Details
            </button>
            <p className="text-xs text-gray-500 mt-2">Coming in next phase</p>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};

export default StudentEarnings;
