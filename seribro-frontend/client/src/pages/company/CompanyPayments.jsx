import React, { useEffect, useState, useRef } from 'react';
import paymentApi from '../../apis/paymentApi';
import { Loader2 as Loader, CreditCard, TrendingUp, CheckCircle2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../../apis/config';

const CompanyPayments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);

  const socketRef = useRef(null);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_BASE_URL);
    socketRef.current.on('connect', () => console.log('[Socket] connected', socketRef.current.id));
    const handler = (data) => {
      console.log('[Socket] payment captured', data);
      loadPayments();
    };
    socketRef.current.on('payment:captured', handler);
    socketRef.current.on('paymentcaptured', handler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('payment:captured', handler);
        socketRef.current.off('paymentcaptured', handler);
        socketRef.current.disconnect();
      }
    };
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentApi.getCompanyPayments();
      if (!res.success) {
        setError(res.message || 'Failed to fetch payments');
      } else {
        setSummary(res.data.summary || {});
        setPayments(res.data.recentPayments || []);
      }
    } catch (err) {
      setError(err.message || 'Error');
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="p-8 text-center">
      <Loader className="w-8 h-8 animate-spin mx-auto text-amber-400" />
      <p className="mt-4 text-gray-300">Loading payments...</p>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="text-red-300 font-semibold">Error</div>
      <div className="text-gray-300 mt-2">{error}</div>
    </div>
  );

  return (
    <div className="bg-[linear-gradient(180deg,#0f1724,#0b1220)] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/70 to-slate-900/80 rounded-2xl p-6 mb-6 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Payment History</h1>
              <p className="text-slate-300 mt-1">Overview of recent payments, releases and project spend.</p>
            </div>
            <div className="flex gap-3 items-center">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-slate-900 font-semibold shadow-sm hover:opacity-95">
                <CreditCard size={16} /> New Payment
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/40 text-slate-300 border border-slate-700 hover:bg-slate-800">
                <TrendingUp size={16} onClick={() => alert("This feature is currently under development and will be available soon.")} /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-xl bg-gradient-to-r from-amber-600/5 to-amber-500/4 border border-amber-500/10 shadow-md flex items-start gap-4">
            <div className="bg-amber-500/10 p-3 rounded-lg">
              <CreditCard className="text-amber-300" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Spent</p>
              <div className="mt-1 text-white font-bold text-xl">₹{(summary.totalSpent || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-700/5 to-emerald-600/4 border border-emerald-500/10 shadow-md flex items-start gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg">
              <CheckCircle2 className="text-emerald-300" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed Projects</p>
              <div className="mt-1 text-white font-bold text-xl">{summary.completedProjects || 0}</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-r from-slate-700/5 to-slate-600/4 border border-slate-500/10 shadow-md flex items-start gap-4">
            <div className="bg-slate-700/10 p-3 rounded-lg">
              <TrendingUp className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Projects</p>
              <div className="mt-1 text-white font-bold text-xl">{summary.activeProjects || 0}</div>
            </div>
          </div>
        </div>

        {/* Table and controls */}
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-4 shadow-inner">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input placeholder="Search projects or student" className="bg-slate-900/40 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 w-full md:w-80" />
              <select className="bg-slate-900/40 border border-slate-700 text-slate-300 rounded-lg px-3 py-2">
                <option value="all">All status</option>
                <option value="released">Released</option>
                <option value="captured">Captured</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="text-sm text-slate-400">Showing last {payments.length} payments</div>
          </div>

          <div className="overflow-x-auto rounded-lg">
            {payments.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No payments found.</div>
            ) : (
              <table className="min-w-full table-auto text-left text-sm">
                <thead className="bg-slate-900/70 text-gray-400 rounded-t-lg">
                  <tr>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Date</th>
                    <th className="p-3 text-left">Student</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {payments.map((p) => {
                    const status = (p.status || '').toLowerCase();
                    const badgeClass = status === 'released' ? 'bg-green-500/10 text-green-300' : status === 'captured' ? 'bg-emerald-500/10 text-emerald-300' : status === 'pending' ? 'bg-amber-500/10 text-amber-300' : status === 'failed' ? 'bg-red-500/10 text-red-300' : 'bg-slate-700/20 text-gray-300';
                    const displayAmount = p.totalAmount ?? p.amount ?? 0;

                    return (
                      <tr key={p._id} className="hover:bg-slate-900/30">
                        <td className="p-3 max-w-xs  text-gray-400 " title={p.projectName}>{p.projectName}</td>
                        <td className="p-3 text-right font-semibold text-gray-400 ">₹{displayAmount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-center text-gray-400 ">
                          <span className={`${badgeClass} inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right text-gray-400 text-xs">{new Date(p.createdAt).toLocaleString()}</td>
                        <td className="p-3 max-w-[150px] truncate text-gray-400 " title={p.studentName}>{p.studentName}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPayments;
