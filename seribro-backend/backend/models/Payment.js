const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: String,
});

const PaymentSchema = new Schema({
  razorpayOrderId: { type: String, unique: true, index: true, sparse: true },
  razorpayPaymentId: { type: String, unique: true, index: true, sparse: true },
  razorpaySignature: String,

  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  company: { type: Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },

  amount: { type: Number, required: true, min: 0 }, // in rupees
  platformFee: { type: Number, default: 0 },
  netAmount: { type: Number },
  currency: { type: String, default: 'INR' },

  status: { type: String, enum: ['pending', 'captured', 'ready_for_release', 'released', 'refunded', 'failed'], default: 'pending' },

  createdAt: { type: Date, default: Date.now },
  capturedAt: Date,
  releasedAt: Date,
  refundedAt: Date,

  releasedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  releaseMethod: { type: String, enum: ['razorpay_payout', 'manual_transfer'] },
  releaseNotes: String,

  refundReason: String,
  refundedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  refundAmount: Number,

  paymentMethod: String,
  paymentDetails: { type: Schema.Types.Mixed },

  transactionHistory: [TransactionSchema],
});

// Instance methods
PaymentSchema.methods.addTransactionHistory = async function (action, userId, notes) {
  this.transactionHistory.push({ action, performedBy: userId, notes });
  return this.save();
};

PaymentSchema.methods.capturePayment = async function (captureMeta = {}) {
  if (this.status !== 'pending') throw new Error('Payment not in pending state');
  this.status = 'captured';
  this.capturedAt = new Date();
  this.razorpayPaymentId = this.razorpayPaymentId || captureMeta.razorpayPaymentId;
  this.razorpaySignature = this.razorpaySignature || captureMeta.razorpaySignature;
  await this.addTransactionHistory('captured', captureMeta.performedBy || null, captureMeta.notes || 'Payment captured');
  return this.save();
};

PaymentSchema.methods.markReadyForRelease = async function (userId, notes) {
  if (this.status !== 'captured') throw new Error('Only captured payments can be marked ready for release');
  this.status = 'ready_for_release';
  await this.addTransactionHistory('ready_for_release', userId || null, notes || 'Marked ready for release');
  return this.save();
};

PaymentSchema.methods.releasePayment = async function (adminId, method = 'manual_transfer', notes = '') {
  if (this.status !== 'ready_for_release') throw new Error('Payment not ready for release');
  this.status = 'released';
  this.releasedAt = new Date();
  this.releasedBy = adminId;
  this.releaseMethod = method;
  this.releaseNotes = notes;
  await this.addTransactionHistory('released', adminId, notes || 'Payment released by admin');
  return this.save();
};

PaymentSchema.methods.processRefund = async function (adminId, reason, amount = null) {
  if (!['captured', 'ready_for_release', 'failed', 'released'].includes(this.status)) throw new Error('Payment cannot be refunded in current state');
  const refundAmt = amount || this.amount;
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.refundedBy = adminId;
  this.refundReason = reason;
  this.refundAmount = refundAmt;
  await this.addTransactionHistory('refunded', adminId, `Refunded ${refundAmt} - ${reason}`);
  return this.save();
};

// Static methods
PaymentSchema.statics.getPendingReleases = function () {
  return this.find({ status: 'ready_for_release' }).populate('project company student').sort({ createdAt: 1 });
};

PaymentSchema.statics.getStudentEarnings = async function (studentId) {
  const payments = await this.find({ student: studentId, status: 'released' });
  const total = payments.reduce((s, p) => s + (p.netAmount || (p.amount - (p.platformFee || 0))), 0);
  return { totalEarned: total, payments };
};

PaymentSchema.statics.getCompanyPayments = function (companyId) {
  return this.find({ company: companyId }).sort({ createdAt: -1 });
};

PaymentSchema.statics.getPlatformRevenue = async function () {
  const paid = await this.aggregate([
    { $match: { status: 'released' } },
    { $group: { _id: null, totalPlatformFee: { $sum: '$platformFee' } } }
  ]);
  return (paid[0] && paid[0].totalPlatformFee) || 0;
};

module.exports = mongoose.model('Payment', PaymentSchema);
