// src/pages/PaymentVerificationPage.jsx
// Payment Verification and Razorpay Integration Page

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, DollarSign } from 'lucide-react';
import { verifyPayment } from '@/apis/paymentApi';
import Navbar from '@/components/Navbar';

const PaymentVerificationPage = () => {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [formData, setFormData] = useState({
    razorpayOrderId: '',
    razorpayPaymentId: '',
    razorpaySignature: ''
  });

  // Simulate payment verification from Razorpay response
  const handleVerifyPayment = async () => {
    if (!formData.razorpayOrderId || !formData.razorpayPaymentId || !formData.razorpaySignature) {
      alert('Please fill all payment details');
      return;
    }

    try {
      setVerifying(true);
      const res = await verifyPayment(formData);

      if (res.success) {
        setVerified(true);
        setPaymentDetails(res.data);
        alert('Payment verified successfully!');
      } else {
        setVerified(false);
        alert(String(res?.message || 'Payment verification failed'));
      }
    } catch (error) {
      setVerified(false);
      alert('Error verifying payment');
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy/90 to-navy/70">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-2">Verify Payment</h1>
            <p className="text-gray-400">Enter your Razorpay payment details to verify</p>
          </div>

          {/* Payment Form */}
          {!verified && (
            <div className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-lg p-8 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Razorpay Order ID
                  </label>
                  <input
                    type="text"
                    value={formData.razorpayOrderId}
                    onChange={(e) => setFormData({ ...formData, razorpayOrderId: e.target.value })}
                    placeholder="order_123456789"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Razorpay Payment ID
                  </label>
                  <input
                    type="text"
                    value={formData.razorpayPaymentId}
                    onChange={(e) => setFormData({ ...formData, razorpayPaymentId: e.target.value })}
                    placeholder="pay_123456789"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Razorpay Signature
                  </label>
                  <input
                    type="text"
                    value={formData.razorpaySignature}
                    onChange={(e) => setFormData({ ...formData, razorpaySignature: e.target.value })}
                    placeholder="signature_hash"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>

                <button
                  onClick={handleVerifyPayment}
                  disabled={verifying}
                  className="w-full py-3 bg-gold hover:bg-gold/90 text-navy font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      Verify Payment
                    </>
                  )}
                </button>
              </div>

              {/* Demo Data */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-3">Demo Test Data (for testing):</p>
                <button
                  onClick={() => setFormData({
                    razorpayOrderId: 'order_demo_12345',
                    razorpayPaymentId: 'pay_demo_67890',
                    razorpaySignature: 'demo_signature_test'
                  })}
                  className="text-xs text-gold hover:text-gold/80 underline"
                >
                  Load Test Data
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {verified === true && paymentDetails && (
            <div className="bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 rounded-lg p-8">
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Payment Verified!</h2>
                <p className="text-gray-400">Your payment has been successfully verified</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-green-500/20">
                  <span className="text-gray-400">Payment ID:</span>
                  <span className="text-white font-semibold">{paymentDetails.paymentId}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-green-500/20">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-semibold">₹{paymentDetails.amount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-300 font-semibold">Completed</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setVerified(null);
                  setPaymentDetails(null);
                  setFormData({ razorpayOrderId: '', razorpayPaymentId: '', razorpaySignature: '' });
                }}
                className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold rounded-lg transition-all border border-green-500/30"
              >
                Verify Another Payment
              </button>
            </div>
          )}

          {/* Error State */}
          {verified === false && (
            <div className="bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/30 rounded-lg p-8">
              <div className="text-center mb-8">
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                <p className="text-gray-400">Unable to verify your payment. Please check the details.</p>
              </div>

              <button
                onClick={() => {
                  setVerified(null);
                  setPaymentDetails(null);
                }}
                className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold rounded-lg transition-all border border-red-500/30"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">How Payment Verification Works</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex gap-3">
                <span className="text-gold">1.</span>
                <span>Company creates a payment order through Razorpay</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold">2.</span>
                <span>Payment details are sent back from Razorpay</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold">3.</span>
                <span>Enter the Order ID, Payment ID, and Signature above</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold">4.</span>
                <span>Click "Verify Payment" to confirm the transaction</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold">5.</span>
                <span>Payment becomes ready for admin release to student</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationPage;
