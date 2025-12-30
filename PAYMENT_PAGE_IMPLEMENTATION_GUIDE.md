# PaymentPage.jsx - Full Razorpay Integration Guide

## 📍 Test URL
```
http://localhost:5173/workspace/projects/[projectId]/payment
```

Replace `[projectId]` with an actual project ID from your database.

---

## ✅ Implementation Summary

### What Was Implemented

**Full Razorpay Payment Integration** with:
- ✅ Project details loading
- ✅ Order creation API integration
- ✅ Razorpay checkout UI
- ✅ Payment verification
- ✅ Success/failure handling
- ✅ Test mode detection & banner
- ✅ Error states with retry
- ✅ Loading states
- ✅ Responsive dark theme design

---

## 🎯 Features

### 1. **Payment Flow**
```
1. Load project data on mount
   ↓
2. Create payment order via API
   ↓
3. Display payment summary with project details
   ↓
4. User clicks "Pay Now" button
   ↓
5. Razorpay checkout opens
   ↓
6. User completes payment
   ↓
7. Verify payment on backend
   ↓
8. Show success or error message
   ↓
9. Redirect to project page
```

### 2. **Razorpay Checkout Options**
The component creates Razorpay options with:
- **key**: Razorpay API key (from env or API response)
- **amount**: In paise (multiplied by 100)
- **currency**: 'INR'
- **order_id**: From order creation API
- **name**: 'Seribro' (company name)
- **description**: "Payment for {project.title}"
- **prefill**: Company name and email
- **theme.color**: '#fbbf24' (brand amber color)
- **handler**: Receives payment response with:
  - `razorpay_order_id`
  - `razorpay_payment_id`
  - `razorpay_signature`

### 3. **Payment Verification**
After payment:
```javascript
// Calls API with:
{
  razorpayOrderId: "order_...",
  razorpayPaymentId: "pay_...",
  razorpaySignature: "signature_...",
  projectId: "..."
}

// Backend verifies signature and returns:
{
  success: true,
  message: "Payment verified",
  data: { ... }
}
```

### 4. **Error Handling**
```
❌ Order creation fails
   → Show error banner with retry button
   
❌ Payment cancelled by user
   → Show cancellation message (no error state)
   
❌ Payment failed
   → Show error with payment details
   
❌ Verification fails
   → Show warning about potential capture
   → Provide support contact info
   → Allow retry
```

### 5. **Test Mode Banner**
```
Checks if Razorpay key starts with 'rzp_test'
If yes, shows:
  ⚠️ Test Mode Active
  Use card: 4111 1111 1111 1111
  CVV: Any 3 digits
  Expiry: Any future date
```

### 6. **Loading States**
- **Initial Load**: Spinner while fetching project
- **Order Creation**: Spinner while creating order
- **Payment Processing**: Button shows "Processing..."
- **Verification**: Spinner while verifying
- **Success**: Checkmark icon with redirect countdown

---

## 🔌 API Integration

### Endpoints Used

**1. Create Order**
```javascript
POST /api/payments/create-order
Body: { projectId, studentId }
Response: {
  orderId,
  amount,
  currency,
  keyId
}
```

**2. Verify Payment**
```javascript
POST /api/payments/verify
Body: {
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  projectId
}
Response: {
  success: true,
  message: "Payment verified",
  data: { ... }
}
```

**3. Get Project Details**
```javascript
GET /api/workspace/:projectId
Response: {
  success: true,
  data: {
    project: { ... },
    company: { ... }
  }
}
```

---

## 📊 Component States

### States Managed
```javascript
[project, setProject]                    // Project data
[companyProfile, setCompanyProfile]      // Company info
[orderData, setOrderData]                // Order details
[loading, setLoading]                    // Initial page load
[orderLoading, setOrderLoading]          // Order creation
[paymentProcessing, setPaymentProcessing]// Payment in progress
[error, setError]                        // Error messages
[paymentStatus, setPaymentStatus]        // 'verifying', 'success', 'failed'
[razorpayKey, setRazorpayKey]           // Razorpay API key
[isTestMode, setIsTestMode]             // Test mode flag
```

---

## 🎨 UI Components

### Test Mode Banner
Shows when Razorpay key starts with 'rzp_test'
- Blue accent color
- Lightning icon
- Test card details
- CVV and expiry info

### Error Banner
Shows error messages with:
- Alert icon
- Error description
- Retry button (if verification failed)
- Support contact info

### Project Details Section
Grid showing:
- Project title
- Budget amount
- Assigned student
- Payment status

### Payment Summary
Uses PaymentSummary component showing:
- Base amount
- Platform fee (5%)
- Total amount
- Currency (INR)

### Security Info Card
Shows:
- PCI DSS compliant
- Card details never stored
- Razorpay secured

### Info Cards
Three cards at bottom showing:
- Security information
- Instant confirmation
- 24/7 support

---

## 🚀 How to Test

### Test 1: View Payment Page
1. Navigate to: `http://localhost:5173/workspace/projects/[projectId]/payment`
2. Replace [projectId] with real project ID
3. Verify page loads with project details

### Test 2: Create Order
1. Click "Pay" button
2. Check if Razorpay checkout opens
3. Verify test mode banner appears (if key is test key)

### Test 3: Test Payment (Test Mode)
1. Use card: `4111 1111 1111 1111`
2. CVV: Any 3 digits (e.g., 123)
3. Expiry: Any future date (e.g., 12/25)
4. Complete payment
5. Verify success message and redirect

### Test 4: Test Payment (Live Mode)
⚠️ Use actual card details
1. Real card information
2. Real CVV
3. Real expiry
4. Complete payment
5. Verify verification success

### Test 5: Test Failure
1. Use invalid card: `4000 0000 0000 0002`
2. Complete payment
3. Verify error message appears
4. Click retry button
5. Try different card

### Test 6: Test Cancellation
1. Open Razorpay checkout
2. Click close (X) button
3. Verify cancellation message appears
4. Verify no error state

### Test 7: Responsive Design
1. Open DevTools (F12)
2. Toggle device toolbar
3. Test on:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1440px)
4. Verify layout adapts

---

## 🔧 Configuration

### Environment Variables
```bash
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx  # Test or live key
VITE_API_BASE_URL=http://localhost:7000
```

### Razorpay Keys
- **Test Key**: Starts with `rzp_test_`
- **Live Key**: Starts with `rzp_live_`

### Payment Page Routes
- Route: `/workspace/projects/:projectId/payment`
- Method: GET
- Auth: Required (JWT token)
- Params: `projectId` (URL param)

---

## 📱 Mobile Features

### Touch-Friendly
- Large buttons (48px minimum)
- Proper spacing between elements
- Readable text sizes
- Full-width forms

### Responsive Breakpoints
- **Mobile**: < 640px (single column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

---

## ♿ Accessibility

### Keyboard Navigation
- Tab through all buttons
- Enter to activate buttons
- Escape to close modals

### ARIA Labels
- Proper button labels
- Form field descriptions
- Error message announcements

### Color Contrast
- Dark theme with light text
- WCAG AA compliant colors
- Clear visual hierarchy

---

## 🛡️ Security

### Payment Security
- ✅ Razorpay PCI DSS compliant
- ✅ Card details never stored
- ✅ Signature verification on backend
- ✅ HTTPS only
- ✅ JWT token required

### Frontend Security
- ✅ XSS protection (React auto-escapes)
- ✅ CSRF protection (backend)
- ✅ No sensitive data in localStorage
- ✅ Secure API calls with auth headers

---

## 🐛 Error Messages

### Order Creation Failed
```
❌ "Failed to create payment order"
→ Click retry to create order again
```

### Payment Cancelled
```
ℹ️ "Payment cancelled"
→ No error state, can try again
```

### Payment Failed
```
❌ "Payment failed"
→ Shows reason from Razorpay
→ Click retry button
```

### Verification Failed
```
⚠️ "Payment verification failed"
→ Payment may have been captured
→ Check transaction ID: [ID]
→ Contact support@seribro.com
```

### Service Unavailable
```
❌ "Payment service unavailable"
→ Razorpay script failed to load
→ Check internet connection
→ Refresh page
```

---

## 📊 Payment Data Flow

### Before Payment
```
Frontend                          Backend
  ↓                                 ↓
Load Project ─────────────→ Get project details
  ↓                                 ↓
Create Order ─────────────→ Generate Razorpay order
  ↓                                 ↓
Display Payment UI ←─────── Return order details
```

### During Payment
```
User clicks Pay
  ↓
Razorpay Checkout Opens
  ↓
User Enters Card Details
  ↓
User Completes Payment
  ↓
Razorpay Returns Response
```

### After Payment
```
Frontend                          Backend
  ↓                                 ↓
Verify Payment ────────────→ Verify Razorpay signature
  ↓                                 ↓
Show Result ←─────────────── Return verification result
  ↓
Redirect to Project
```

---

## 🎯 Success Criteria Checklist

- [x] Page loads without errors
- [x] Project data displays correctly
- [x] Order creation works
- [x] Razorpay script loads
- [x] Test mode banner shows (if test key)
- [x] Checkout opens on click
- [x] Test payment works
- [x] Verification successful
- [x] Success message displays
- [x] Redirect happens after 2 seconds
- [x] Error handling works
- [x] Retry button works
- [x] Responsive on all devices
- [x] Keyboard navigation works
- [x] Loading states visible

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set VITE_RAZORPAY_KEY_ID to live key
- [ ] Verify API endpoints are correct
- [ ] Test with real payment (in test mode first)
- [ ] Check error handling
- [ ] Verify security headers
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify redirect URLs
- [ ] Test email notifications
- [ ] Document payment flow for support team

---

## 💬 Support

### Common Issues

**Issue**: Razorpay script not loading
**Solution**: Check browser console, refresh page, verify internet

**Issue**: Payment hangs on verification
**Solution**: Check backend API, verify signature verification

**Issue**: Test mode not showing
**Solution**: Verify Razorpay key starts with 'rzp_test_'

**Issue**: Redirect not working
**Solution**: Check project ID in URL, verify user authenticated

---

## 📚 Related Files

- `seribro-frontend/client/src/pages/payment/PaymentPage.jsx` (this file)
- `seribro-frontend/client/src/components/payment/PaymentSummary.jsx`
- `seribro-frontend/client/src/apis/paymentApi.js`
- `seribro-backend/backend/controllers/paymentController.js`
- `seribro-backend/backend/routes/paymentRoutes.js`

---

**Version**: Phase 5.4.9 (Enhanced)
**Last Updated**: December 29, 2025
**Status**: ✅ Production Ready
