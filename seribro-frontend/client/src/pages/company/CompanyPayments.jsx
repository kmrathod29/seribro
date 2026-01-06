import React, { useEffect, useState } from 'react';
import paymentApi from '../../apis/paymentApi';
import { Loader2 as Loader } from 'lucide-react';

const CompanyPayments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadPayments();
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Company Payments</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-slate-800/50 rounded border border-slate-700">
          <p className="text-gray-400 text-sm">Total Spent</p>
          <p className="text-white font-semibold">₹{(summary.totalSpent || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded border border-slate-700">
          <p className="text-gray-400 text-sm">Completed Projects</p>
          <p className="text-white font-semibold">{summary.completedProjects || 0}</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded border border-slate-700">
          <p className="text-gray-400 text-sm">Active Projects</p>
          <p className="text-white font-semibold">{summary.activeProjects || 0}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded border border-slate-700 overflow-auto">
        {payments.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No payments found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 text-gray-400">
              <tr>
                <th className="p-3">Project</th>
                <th className="p-3">Student</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-900/30">
                  <td className="p-3">{p.projectName}</td>
                  <td className="p-3">{p.studentName}</td>
                  <td className="p-3">₹{(p.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CompanyPayments;
