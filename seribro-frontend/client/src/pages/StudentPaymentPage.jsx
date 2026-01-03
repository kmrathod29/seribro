// src/pages/StudentPaymentPage.jsx
// Student Payment History and Earnings Page

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import PaymentSummary from '@/components/payment/PaymentSummary';
import { getStudentEarnings } from '@/apis/paymentApi';
import Navbar from '@/components/Navbar';

const StudentPaymentPage = () => {
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const res = await getStudentEarnings();
      
      if (res.success) {
        setEarnings(res.data);
        setTransactions(res.data.transactions || []);
      } else {
        alert(String(res?.message || 'Failed to load earnings'));
      }
    } catch (error) {
      alert('Error loading earnings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy/90 to-navy/70">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-gray-300">Loading earnings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy/90 to-navy/70">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payment & Earnings</h1>
          <p className="text-gray-400">Track your project earnings and payment history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              ₹{earnings?.totalEarnings?.toLocaleString('en-IN') || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Projects</span>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {transactions.length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Pending Release</span>
              <Clock className="w-5 h-5 text-gold" />
            </div>
            <p className="text-3xl font-bold text-white">
              {transactions.filter(t => t.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'completed', 'released'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === status
                  ? 'bg-gold text-navy'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Transactions */}
        {filteredTransactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTransactions.map((txn) => (
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
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <CheckCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPaymentPage;
