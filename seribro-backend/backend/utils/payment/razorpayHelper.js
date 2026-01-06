const crypto = require("crypto");
let Razorpay;
try {
  Razorpay = require("razorpay");
} catch (err) {
  // Razorpay might not be installed in some environments; we export helper functions that throw informative errors
  Razorpay = null;
}

const initRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay keys missing in environment. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"
    );
  }
  if (!Razorpay) {
    throw new Error(
      "Razorpay SDK not installed. Run `npm i razorpay` in backend"
    );
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const createRazorpayOrder = async (amount, projectId, studentId) => {
  const rz = initRazorpay();
  const options = {
    amount: Math.round((amount || 0) * 100), // paise
    currency: "INR",
    receipt: `project_${projectId}`,
    notes: { projectId: projectId.toString(), studentId: studentId.toString() },
  };
  return rz.orders.create(options);
};

const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (!process.env.RAZORPAY_KEY_SECRET)
    throw new Error("Missing RAZORPAY_KEY_SECRET");
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return generatedSignature === signature;
};

module.exports = { initRazorpay, createRazorpayOrder, verifyPaymentSignature };
