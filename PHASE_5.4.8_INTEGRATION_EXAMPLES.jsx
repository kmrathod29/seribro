/**
 * Phase 5.4.8 Integration Examples
 * Reference examples showing how to use PaymentSummary and PaymentReleaseCard
 * 
 * IMPORTANT: This file contains reference code snippets.
 * Copy and adapt the code examples below to your own components.
 */

// ============================================
// EXAMPLE 1: Student Payment History Page
// ============================================

import React, { useState, useEffect } from 'react';
import PaymentSummary from '@/components/payment/PaymentSummary';
import { getStudentEarnings } from '@/apis/paymentApi';
import { toast } from 'react-toastify';

export const StudentPaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await getStudentEarnings();
      
      if (res.success) {
        setTransactions(res.data.transactions || []);
        setTotalEarnings(res.data.totalEarnings || 0);
      } else {
        toast.error(res.message || 'Failed to load transactions');
      }
    } catch (error) {
      toast.error('Error loading payment history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Total */}
      <div className="bg-gradient-to-r from-navy/50 to-navy/30 border border-gold/20 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Payment History</h1>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Total Earnings:</span>
          <span className="text-3xl font-bold text-gold">₹{totalEarnings.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Transactions Grid */}
      {transactions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map((txn) => (
            <PaymentSummary 
              key={txn._id} 
              payment={{
                projectName: txn.projectTitle,
                studentName: txn.studentName,
                baseAmount: txn.baseAmount,
                platformFeePercentage: txn.platformFeePercentage || 5,
                status: txn.status,
                timestamp: txn.createdAt,
                paymentId: txn.razorpayOrderId
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No transactions found
        </div>
      )}
    </div>
  );
};

// ============================================
// EXAMPLE 2: Admin Payment Release Dashboard
// ============================================

import React, { useState, useEffect } from 'react';
import PaymentReleaseCard from '@/components/admin/PaymentReleaseCard';
import { getPendingReleases, releasePayment } from '@/apis/paymentApi';
import { toast } from 'react-toastify';
import { Search, Filter } from 'lucide-react';

export const AdminPaymentDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPayments();
  }, [currentPage]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await getPendingReleases(currentPage);
      
      if (res.success) {
        setPayments(res.data.payments || []);
      } else {
        toast.error(res.message || 'Failed to load payments');
      }
    } catch (error) {
      toast.error('Error loading payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (payment) => {
    if (!confirm(`Release ₹${payment.amount.toLocaleString('en-IN')} to ${payment.studentName}?`)) {
      return;
    }

    try {
      const res = await releasePayment(payment._id, {
        releaseNotes: `Released on ${new Date().toLocaleDateString('en-IN')}`
      });

      if (res.success) {
        toast.success('Payment released successfully');
        setPayments(payments.filter(p => p._id !== payment._id));
      } else {
        toast.error(res.message || 'Failed to release payment');
      }
    } catch (error) {
      toast.error('Error releasing payment');
      console.error(error);
    }
  };

  const handleViewProject = ({ projectId, studentId }) => {
    window.open(`/admin/projects/${projectId}?student=${studentId}`, '_blank');
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.projectTitle?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.studentName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.companyName?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return <div className="text-center py-8">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Payment Release Management</h1>
        
        {/* Search and Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search project, student, or company..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Ready for Release</p>
            <p className="text-2xl font-bold text-green-300">{payments.length}</p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-blue-300">
              ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Urgent (3+ days)</p>
            <p className="text-2xl font-bold text-orange-300">
              {payments.filter(p => {
                const days = Math.floor((Date.now() - new Date(p.releaseReadySince)) / (24 * 60 * 60 * 1000));
                return days >= 3;
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Cards */}
      {filteredPayments.length > 0 ? (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <PaymentReleaseCard
              key={payment._id}
              payment={payment}
              onRelease={handleRelease}
              onViewProject={handleViewProject}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No pending payments</p>
          <p className="text-sm">All payments have been processed</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// EXAMPLE 3: Company Transaction Summary
// ============================================

import React, { useState, useEffect } from 'react';
import PaymentSummary from '@/components/payment/PaymentSummary';
import { companyDashboardApi } from '@/apis/companyDashboardApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const CompanyTransactionSummary = () => {
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      // Assuming there's an endpoint to get company transactions
      const res = await companyDashboardApi.getTransactions();
      
      if (res.success) {
        setTransactions(res.data.transactions);
        prepareChartData(res.data.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const prepareChartData = (txns) => {
    // Group by month
    const grouped = {};
    txns.forEach(txn => {
      const month = new Date(txn.createdAt).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      grouped[month] = (grouped[month] || 0) + txn.baseAmount;
    });

    setChartData(Object.entries(grouped).map(([month, amount]) => ({
      month,
      amount
    })));
  };

  return (
    <div className="space-y-8">
      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Payment Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,215,0,0.1)" />
              <XAxis dataKey="month" stroke="rgb(156, 163, 175)" />
              <YAxis stroke="rgb(156, 163, 175)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10,20,40,0.9)', border: '1px solid rgb(255,215,0)' }}
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Bar dataKey="amount" fill="rgb(255,215,0)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Recent Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.slice(0, 6).map((txn) => (
            <PaymentSummary 
              key={txn._id}
              payment={{
                projectName: txn.projectTitle,
                studentName: txn.studentName,
                baseAmount: txn.baseAmount,
                platformFeePercentage: txn.platformFeePercentage || 5,
                status: txn.status,
                timestamp: txn.createdAt,
                paymentId: txn.razorpayOrderId
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
