# Sub-Phase 5.3 — Payment Integration & Completion Flow

This document describes the Phase 5.3 implementation: Hybrid payment capture (Razorpay test mode), admin release, project completion, and mutual ratings.

Highlights:
- Payment model: `backend/models/Payment.js` tracks all payments and their lifecycle.
- Rating model: `backend/models/Rating.js` supports one rating per project (student & company parts).
- Project, Student, Company models extended to store payment & rating stats.
- Razorpay helper: `backend/utils/payment/razorpayHelper.js` (requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`).
- New controller & routes: `backend/controllers/paymentController.js` + `backend/routes/paymentRoutes.js`.
- Rating controller + routes: `backend/controllers/ratingController.js` + `backend/routes/ratingRoutes.js`.
- Frontend pages added:
  - `/payment/:projectId` — Company completes payment (Razorpay checkout)
  - `/admin/payment-releases` — Admin list and release payments
  - `/student/earnings` — Student earnings dashboard
  - `/workspace/projects/:projectId/rate` — Rating form for both parties

Notes and safety:
- If Razorpay SDK or keys are not configured, the backend will create a `Payment` record in `pending` state and return an informative message; this is non-blocking and does not break assignment flow.
- `approveStudentForProject` now creates a `Payment` record (best-effort) after assignment and notifies the company.
- Admin must `Release Payment` to mark project `completed`, which triggers student earnings and rating prompts.

Env vars added to `.env.example`:
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- PLATFORM_FEE_PERCENTAGE
- EMAIL_NOTIFY_ON_PAYMENT
- PAYMENT_PAYOUT_METHOD

Next steps:
- Add unit and integration tests for payment flows (create order, verify, release, refund)
- (Optional) Integrate Razorpay Payout API for automated releases
- Add UI polish and export CSV for payouts

If you want, I can run manual smoke tests for assign→pay→start→submit→approve→release→rate flows next. 