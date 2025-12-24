import React, { useEffect, useState } from 'react';
import paymentApi from '../../apis/paymentApi';
import { toast } from 'react-toastify';

const AdminPaymentReleases = () => {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);

  const load = async (p = 1) => {
    const res = await paymentApi.getPendingReleases(p);
    if (res.success) setPayments(res.data.payments || []);
    else toast.error(res.message || 'Failed to load payments');
  };

  useEffect(() => { load(1); }, []);

  const handleRelease = async (paymentId) => {
    if (!window.confirm('Release this payment to the student?')) return;
    const res = await paymentApi.releasePayment(paymentId, { method: 'manual_transfer' });
    if (res.success) {
      toast.success('Payment released');
      load(page);
    } else {
      toast.error(res.message || 'Failed to release');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Pending Payment Releases</h2>
      <div className="space-y-4">
        {payments.length === 0 && <div>No pending releases</div>}
        {payments.map((p) => (
          <div key={p._id} className="bg-slate-800/60 border border-white/10 rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{p.project?.title} - ₹{p.amount}</div>
              <div className="text-sm text-gray-300">Company: {p.company?.companyName || '—'} • Student: {p.student?.name || '—'}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleRelease(p._id)} className="px-3 py-1 bg-green-500 rounded text-white">Release Payment</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPaymentReleases;