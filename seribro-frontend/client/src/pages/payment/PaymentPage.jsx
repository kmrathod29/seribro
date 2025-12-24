import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentApi from '../../apis/paymentApi';
import workspaceApi from '../../apis/workspaceApi';

const PaymentPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await workspaceApi.getWorkspaceOverview(projectId);
      if (res.success) setProject(res.data.project);
      else toast.error(res.message || 'Failed to load project');
      setLoading(false);
    })();
  }, [projectId]);

  const handlePayment = async () => {
    if (!project) return;
    const payload = { projectId, studentId: project.assignedStudent || null };
    const orderRes = await paymentApi.createOrder(payload);
    if (!orderRes.success) return toast.error(orderRes.message || 'Failed to create order');

    const { orderId, amount, currency, keyId } = orderRes.data || orderRes;
    if (!orderId) {
      // Backend created a pending payment (no Razorpay) - instruct company to contact admin
      toast.info('Payment record created. Configure Razorpay to proceed with online payments.');
      navigate(`/workspace/projects/${projectId}`);
      return;
    }

    const options = {
      key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: currency || 'INR',
      name: 'Seribro',
      description: `Payment for ${project.title}`,
      order_id: orderId,
      handler: async function (response) {
        const verifyRes = await paymentApi.verifyPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          projectId,
        });
        if (verifyRes.success) {
          toast.success('Payment successful');
          navigate(`/workspace/projects/${projectId}`);
        } else {
          toast.error(verifyRes.message || 'Payment verification failed');
        }
      },
      prefill: {
        name: '',
        email: '',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Complete Payment for Project</h2>
      <div className="bg-slate-800/60 border border-white/10 rounded p-6 mb-4">
        <h3 className="text-lg font-semibold">{project?.title}</h3>
        <p className="text-sm text-gray-300">Budget: ₹{project?.budgetMax?.toLocaleString('en-IN')}</p>
        <p className="text-sm text-gray-300 mt-2">Pay now to confirm assignment and start work.</p>
      </div>
      <button onClick={handlePayment} className="px-4 py-2 bg-amber-400 text-navy rounded font-semibold">Pay ₹{project?.budgetMax}</button>
    </div>
  );
};

export default PaymentPage;