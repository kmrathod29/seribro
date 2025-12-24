import React, { useEffect, useState } from 'react';
import paymentApi from '../../apis/paymentApi';
import { toast } from 'react-toastify';

const StudentEarnings = () => {
  const [data, setData] = useState(null);

  const load = async () => {
    const res = await paymentApi.getStudentEarnings();
    if (res.success) setData(res.data);
    else toast.error(res.message || 'Failed to load earnings');
  };

  useEffect(() => { load(); }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Earnings</h2>
      <div className="bg-slate-800/60 border border-white/10 rounded p-6">
        <div className="text-lg font-semibold">Total Earned: ₹{data.totalEarned}</div>
        <div className="text-sm text-gray-300">Pending: ₹{data.pendingPayments}</div>
        <div className="text-sm text-gray-300">Completed Projects: {data.completedProjects}</div>
        <div className="mt-4">
          <h4 className="font-semibold">Recent Payments</h4>
          <div className="mt-2 space-y-2">
            {data.recentPayments.map((p) => (
              <div key={p._id} className="text-sm text-gray-200">{new Date(p.createdAt).toLocaleString()} — ₹{p.amount} — {p.status}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEarnings;