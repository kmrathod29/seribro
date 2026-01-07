// src/pages/payment/PaymentPage.jsx
// Payment Page with Full Razorpay Integration - Phase 5.4.9
// Test URL: http://localhost:5173/workspace/projects/[projectId]/payment

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import paymentApi from '../../apis/paymentApi';
import workspaceApi from '../../apis/workspaceApi';
import { RAZORPAY_KEY_ID } from '../../apis/config';
import PaymentSummary from '../../components/payment/PaymentSummary';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Loader,
  ShieldAlert,
  Zap,
} from 'lucide-react';

const PaymentPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // States
  const [project, setProject] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [razorpayBlocked, setRazorpayBlocked] = useState(false);

  // ===== PRICE DISPLAY (SOURCE OF TRUTH: server-provided order values) =====
  // Do NOT recalculate fees on the client. Use values returned from backend order API (baseAmount, platformFee, totalAmount).
  const baseAmount = orderData?.baseAmount ?? 0; // rupees
  const platformFee = orderData?.platformFee ?? 0; // rupees
  const totalAmount = orderData?.totalAmount ?? 0; // rupees


  // Create payment order
  const createPaymentOrder = React.useCallback(async (proj) => {
    try {
      setOrderLoading(true);

      if (!proj || !proj._id) {
        setError('Project data is invalid');
        setOrderLoading(false);
        return;
      }

      const orderRes = await paymentApi.createOrder({
        projectId: proj._id || projectId,
        studentId: proj.assignedStudent || null,
      });

      if (!orderRes.success) {
        setError(orderRes.message || 'Failed to create payment order');
        setOrderLoading(false);
        return;
      }

      const orderInfo = orderRes.data || orderRes;
      if (!orderInfo) {
        setError('Invalid order response from server');
        setOrderLoading(false);
        return;
      }

      // Accept server response as authoritative. We expect these fields:
      // { orderId, amount (paise), totalAmount (rupees), baseAmount (rupees), platformFee (rupees), currency, keyId }
      setOrderData(orderInfo);

      // If backend reported a Razorpay account limit, surface a clear error and block checkout
      if (orderInfo.razorpayError && orderInfo.razorpayError.type === 'RAZORPAY_LIMIT') {
        setError(orderRes.message || orderInfo.razorpayError.message || 'Payment blocked by Razorpay account limits');
        setRazorpayBlocked(true);
      }

      // Check if Razorpay key is in test mode
      const keyToUse = orderInfo.keyId || RAZORPAY_KEY_ID || '';
      setRazorpayKey(keyToUse);
      setIsTestMode(keyToUse.startsWith('rzp_test'));

      // Use server-provided payment breakdown and amount. Do NOT recalculate fees on the client.
      // orderInfo.amount is returned in paise and will be used directly for Razorpay checkout.
      // Populate display variables from server response (baseAmount/platformFee/totalAmount)
      // No client-side mismatch assertion — we rely on server values to be authoritative.

      setOrderLoading(false);
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create payment order');
      setOrderLoading(false);
    }
  }, [projectId]);

  // Load project and order data
  const loadProjectData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get project details
      const projectRes = await workspaceApi.getWorkspaceOverview(projectId);
      if (!projectRes.success) {
        setError(projectRes.message || 'Failed to load project');
        setLoading(false);
        return;
      }

      if (!projectRes.data || !projectRes.data.project) {
        setError('Invalid project data received');
        setLoading(false);
        return;
      }

      setProject(projectRes.data.project);
      setCompanyProfile(projectRes.data.company);

      // Determine if a student/application has been selected for payment
      const hasSelectedApp = !!(projectRes.data.project && projectRes.data.project.selectedApplication && projectRes.data.project.selectedApplication.proposedPrice > 0);

      if (!hasSelectedApp) {
        // Don't create an order automatically; disable Pay and show instruction
        setInfo('Student not selected yet');
        setLoading(false);
        return;
      }

      // Create order using server API
      await createPaymentOrder(projectRes.data.project);
      setLoading(false);
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err.message || 'An error occurred while loading project details');
      setLoading(false);
    }
  }, [projectId, createPaymentOrder]);

  useEffect(() => {
    loadProjectData();
    loadRazorpayScript();
  }, [projectId, loadProjectData]);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    if (window.Razorpay) return;

    try {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = function() {
        console.log('Razorpay script loaded successfully');
      };
      script.onerror = function() {
        console.error('Failed to load Razorpay script');
        toast.error('Payment service unavailable');
      };
      document.head.appendChild(script);
    } catch (err) {
      console.error('Error injecting Razorpay script', err);
      toast.error('Payment service unavailable');
    }
  };



  // Handle payment
  const handlePayment = async () => {
    if (!project || !orderData) {
      toast.error('Missing payment details');
      return;
    }

    if (!window.Razorpay) {
      toast.error('Payment service not loaded. Please refresh and try again.');
      return;
    }

    try {
      setPaymentProcessing(true);

      // Prevent checkout if Razorpay is blocked by account limits
      if (razorpayBlocked) {
        toast.error(error || 'Payment cannot be completed because your Razorpay account has limits. Contact support.');
        setPaymentProcessing(false);
        return;
      }

      // Get the amount from orderData or calculate from project
      // NOTE: Do NOT use orderData.amount or project budget/payout fields here. The single source of truth for payment base is project.finalPrice.

      if (!orderData || !orderData.amount) {
        toast.error('Invalid payment details from server');
        setPaymentProcessing(false);
        return;
      }

      // Razorpay options
      const options = {
        key: razorpayKey || RAZORPAY_KEY_ID,
        amount: orderData.amount, // amount from server (in paise)
        currency: orderData.currency || 'INR',
        name: 'Seribro',
        description: `Payment for ${project.title}`,
        order_id: orderData.orderId || orderData.id,
        prefill: {
          name: companyProfile?.companyName || '',
          email: companyProfile?.email || '',
        },
        theme: {
          color: '#fbbf24', // Amber color for brand consistency
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            toast('Payment cancelled');
          },
        },
        handler: async (response) => {
          await handlePaymentSuccess(response);
        },
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (error) => {
        handlePaymentFailure(error);
      });
      rzp.open();
    } catch (err) {
      console.error('Error initiating payment:', err);
      toast.error('Failed to initiate payment');
      setPaymentProcessing(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (response) => {
    try {
      setPaymentProcessing(true);
      setPaymentStatus('verifying');

      // Verify payment on backend
      const verifyRes = await paymentApi.verifyPayment({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
        projectId,
      });

      if (verifyRes.success) {
        setPaymentStatus('success');
        toast.success('Payment verified successfully');

        // If backend indicates hidePayNow, rely on it
        if (verifyRes.data?.flags?.hidePayNow) {
          // redirect to company payments
          setTimeout(() => {
            navigate('/company/dashboard/payments', { replace: true });
          }, 1200);
        } else {
          setTimeout(() => {
            navigate('/company/dashboard/payments', { replace: true });
          }, 1200);
        }
      } else {
        setPaymentStatus('verification_failed');
        setError(
          verifyRes.message ||
          'Payment verification failed. Payment may have been captured but not verified. Please contact support.'
        );
        toast.error('Payment verification failed. Please contact support with your transaction ID: ' + response.razorpay_payment_id);
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setPaymentStatus('verification_failed');
      setError('An error occurred during payment verification');
      toast.error('Payment verification error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Handle payment failure
  const handlePaymentFailure = (error) => {
    setPaymentStatus('failed');
    const desc = error?.description || error?.error?.description || error?.message || 'Payment failed. Please try again or use a different payment method.';

    // Detect Razorpay limit errors and block future attempts
    const isLimit = /limit|exceed|quota|payout|daily|monthly/i.test(String(desc));
    if (isLimit) {
      setError('Payment failed due to Razorpay account limits. Please contact support@seribro.com.');
      setRazorpayBlocked(true);
      toast.error('Payment cannot be processed: Razorpay account limits. Contact support.');
    } else {
      setError(desc);
      toast.error(String(desc));
    }
    setPaymentProcessing(false);
  };

  // Retry payment
  const handleRetry = () => {
    setError(null);
    setPaymentStatus(null);
    if (!orderData) {
      createPaymentOrder(project);
    }
  };

  // Success screen
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle2 size={80} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-300 mb-4">Your payment has been verified successfully.</p>
          <p className="text-gray-400 text-sm">Redirecting to project...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || orderLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        {/* Test Mode Banner */}
        {isTestMode && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6 flex gap-3">
            <Zap size={24} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 font-semibold">Test Mode Active</p>
              <p className="text-blue-200 text-sm mt-1">
                Use test card: <span className="font-mono">5267 3181 8797 5449</span>
              </p>
              <p className="text-blue-200 text-sm">
                CVV: Any 3 digits | Expiry: Any future date
              </p>
            </div>
          </div>
        )}

        {/* Info: show if no student selected */}
        {info && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 flex gap-3">
            <Zap size={24} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 font-semibold">Payment info</p>
              <p className="text-blue-200 text-sm mt-1">{info}</p>
            </div>
          </div>
        )}

        {/* Razorpay Account Limit Blocker */}
        {razorpayBlocked && (
          <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold">Payment temporarily unavailable</p>
              <p className="text-red-200 text-sm mt-1">{error || 'This payment cannot be processed because your Razorpay account has reached a limit. Please contact support@seribro.com for assistance or use an alternate payment method.'}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold">Payment Error</p>
              <p className="text-red-200 text-sm mt-1">{error}</p>

              {/* Retry Button */}
              {paymentStatus === 'verification_failed' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 text-red-300 rounded transition-colors text-sm font-medium"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate(`/workspace/projects/${projectId}`)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm font-medium"
                  >
                    Go to Project
                  </button>
                </div>
              )}

              {/* Support Contact */}
              {paymentStatus === 'verification_failed' && (
                <p className="text-gray-400 text-xs mt-4">
                  Need help? Contact support@seribro.com with your transaction ID
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main Payment Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold text-white mb-2">Complete Payment</h1>
            <p className="text-gray-400">
              Secure payment processing with Razorpay
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Project Details */}
            {project && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Project Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                    <p className="text-gray-400 text-sm mb-1">Project Title</p>
                    <p className="text-white font-medium">{project.title}</p>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                    <p className="text-gray-400 text-sm mb-1">Final Project Price</p>
                    <p className="text-white font-medium">
                      ₹{(totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                    <p className="text-gray-400 text-sm mb-1">Assigned Student</p>
                    <p className="text-white font-medium">
                      {project.selectedStudentName || project.studentName || 'Not assigned'}
                    </p>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                    <p className="text-gray-400 text-sm mb-1">Payment Status</p>
                    <p className="text-amber-300 font-medium">{project?.paymentStatus || orderData?.status || 'pending'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary Component */}
            {orderData && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Payment Summary</h2>
                <PaymentSummary
                  payment={{
                    projectName: project?.title || 'N/A',
                    studentName: project?.studentName || 'N/A',
                    status: 'pending',
                    timestamp: new Date(),
                    paymentId: orderData.orderId,
                  }}
                  baseAmount={baseAmount}
                  platformFee={platformFee}
                  totalAmount={totalAmount}
                />
              </div>
            )}

            {/* Security Info */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex gap-3">
              <ShieldAlert size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 text-sm font-medium">Secure Payment</p>
                <p className="text-green-200 text-xs mt-1">
                  Your payment is encrypted and secured with Razorpay
                </p>
              </div>
            </div>
          </div>

          {/* Footer with Payment Button */}
          <div className="bg-slate-900/50 p-6 border-t border-slate-700 flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-4 rounded-lg font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>

            {((project?.paymentStatus || '').toLowerCase() === 'released' || (project?.paymentStatus || '').toLowerCase() === 'captured' || orderData?.hidePayNow) ? (
              <div className="flex-1">
                <div className="py-3 px-4 rounded-lg font-medium bg-green-600/20 text-green-200 flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} className="text-green-300" />
                  <span>Payment Completed ✓</span>
                </div>
                <button onClick={() => navigate('/company/dashboard/payments')} className="w-full mt-3 py-2 px-4 rounded-lg bg-white/5 text-white">View Payment History</button>
              </div>
            ) : (
              <button
                onClick={handlePayment}
                disabled={paymentProcessing || !orderData || !!error}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${paymentProcessing || !orderData || error
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:shadow-lg hover:shadow-amber-500/50 active:scale-95'
                  }`}
              >
                {paymentProcessing ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Pay ₹{totalAmount.toLocaleString('en-IN')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Security
            </p>
            <p className="text-white font-medium text-sm">PCI DSS Compliant</p>
            <p className="text-gray-400 text-xs mt-1">
              Your card details are never stored
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Instant Confirmation
            </p>
            <p className="text-white font-medium text-sm">Immediate Verification</p>
            <p className="text-gray-400 text-xs mt-1">
              Payment confirmed in real-time
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Support
            </p>
            <p className="text-white font-medium text-sm">24/7 Assistance</p>
            <p className="text-gray-400 text-xs mt-1">
              Contact support@seribro.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;