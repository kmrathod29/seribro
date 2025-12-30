# PaymentPage Testing Guide

## 🧪 Quick Testing Steps

### Step 1: Navigate to Payment Page
```
URL: http://localhost:5173/workspace/projects/[projectId]/payment
Example: http://localhost:5173/workspace/projects/507f1f77bcf86cd799439011/payment
```

**Expected Result**:
- ✅ Page loads
- ✅ Project title displays
- ✅ Budget amount shows
- ✅ "Pay Now" button visible
- ✅ No errors in console

---

## 🔍 Component Testing

### Test 1: Page Load with Project Data

**Steps**:
1. Navigate to payment page with valid projectId
2. Wait for page to load
3. Observe project details section

**Verify**:
- [ ] Project title shows correctly
- [ ] Budget amount displays (e.g., "₹50,000")
- [ ] Student name displays
- [ ] Payment status shows "Pending"
- [ ] No error messages

---

### Test 2: Order Creation

**Steps**:
1. Wait for page to fully load
2. Check if "Pay Now" button is enabled

**Verify**:
- [ ] Button is clickable (not disabled)
- [ ] Order data loaded in background
- [ ] No console errors
- [ ] Loading spinner disappeared

---

### Test 3: Test Mode Banner Detection

**Steps**:
1. Check environment variable VITE_RAZORPAY_KEY_ID
2. If key starts with "rzp_test_", banner should show
3. If key starts with "rzp_live_", no banner

**Verify**:
- [ ] Test mode banner appears (if test key)
- [ ] Shows correct card: 4111 1111 1111 1111
- [ ] Shows CVV instruction: "Any 3 digits"
- [ ] Shows expiry instruction: "Any future date"
- [ ] Blue accent color

---

### Test 4: Payment Summary Display

**Steps**:
1. Scroll down to see Payment Summary
2. Check the breakdown

**Verify**:
- [ ] Base amount shows (project budget)
- [ ] Platform fee shows (5% of base)
- [ ] Total amount correct (base + fee)
- [ ] Currency shows as "INR"
- [ ] All formatted with comma separators

---

### Test 5: Razorpay Checkout Opens

**Steps**:
1. Click "Pay Now" button
2. Observe modal/popup

**Verify**:
- [ ] Razorpay checkout modal opens
- [ ] Modal shows payment form
- [ ] Can see card input field
- [ ] Modal has close button (X)
- [ ] Background is dimmed

---

## 💳 Payment Testing

### Test 6: Successful Test Payment

**Steps**:
1. Click "Pay Now" button
2. Razorpay modal opens
3. Enter test card details:
   - Card: 4111 1111 1111 1111
   - CVV: 123 (any 3 digits)
   - Expiry: 12/25 (any future date)
   - Name: Test User
4. Click "Pay" button

**Verify**:
- [ ] Payment processes (may show "Processing")
- [ ] Success message appears: "Payment Successful!"
- [ ] Success screen shows checkmark icon
- [ ] Text says "Your payment has been verified"
- [ ] Page redirects to project after ~2 seconds

---

### Test 7: Failed Payment

**Steps**:
1. Click "Pay Now" button
2. Enter failed test card:
   - Card: 4000 0000 0000 0002
   - CVV: 123
   - Expiry: 12/25
3. Click "Pay" button

**Verify**:
- [ ] Payment fails with error message
- [ ] Error banner appears at top (red/pink)
- [ ] Error message explains what went wrong
- [ ] "Try Again" button appears
- [ ] "Go to Project" button appears
- [ ] Can click retry and try different card

---

### Test 8: Cancelled Payment

**Steps**:
1. Click "Pay Now" button
2. Razorpay modal opens
3. Click X button to close modal
4. Click "Dismiss" or press Escape

**Verify**:
- [ ] Modal closes
- [ ] Toast message: "Payment cancelled"
- [ ] No error state shown
- [ ] Can click "Pay Now" again to retry
- [ ] Page stays on payment page

---

### Test 9: Timeout/Network Error

**Steps**:
1. Open DevTools (F12)
2. Go to Network tab
3. Offline the browser
4. Click "Pay Now"
5. Try to complete payment

**Verify**:
- [ ] Error message appears
- [ ] Explains network issue
- [ ] Retry button available
- [ ] Can retry when online
- [ ] No page crash

---

## 🔒 Security Testing

### Test 10: Card Data Not Logged

**Steps**:
1. Open DevTools Console
2. Go to Payment page
3. Click "Pay Now"
4. Complete test payment
5. Check console logs

**Verify**:
- [ ] No card numbers logged
- [ ] No CVV logged
- [ ] No sensitive data in console
- [ ] Only order ID and payment ID shown
- [ ] No card data in network requests

---

### Test 11: HTTPS/Secure Context

**Steps**:
1. Check browser address bar
2. Look for lock icon

**Verify**:
- [ ] Lock icon present (HTTPS)
- [ ] URL starts with "https://" (production)
- [ ] URL "http://" is ok for localhost

---

## 📱 Responsive Design Testing

### Test 12: Mobile (375px width)

**Steps**:
1. Open DevTools (F12)
2. Click phone icon (Toggle Device Toolbar)
3. Select iPhone 12 or similar (375px)
4. Navigate to payment page
5. Test all interactions

**Verify**:
- [ ] Layout doesn't overflow
- [ ] Buttons are touch-friendly
- [ ] Text is readable
- [ ] Payment form visible
- [ ] No horizontal scrolling
- [ ] All sections stack vertically

---

### Test 13: Tablet (768px width)

**Steps**:
1. Set viewport to 768px
2. Reload page
3. Check layout

**Verify**:
- [ ] Two-column layout for project details
- [ ] Form centered
- [ ] All content visible
- [ ] Buttons properly sized

---

### Test 14: Desktop (1440px width)

**Steps**:
1. Full browser window
2. Maximize or set to 1440px
3. Check layout

**Verify**:
- [ ] Three-column layout possible
- [ ] Proper spacing
- [ ] Content centered with max-width
- [ ] All info cards visible

---

## 🎯 API Testing

### Test 15: Create Order API Call

**Steps**:
1. Open DevTools Network tab
2. Go to payment page
3. Watch network requests
4. Look for POST to `/api/payments/create-order`

**Verify**:
- [ ] Request sent with projectId and studentId
- [ ] Status code 200 or 201
- [ ] Response contains:
  - `orderId`
  - `amount`
  - `currency`
  - `keyId`

---

### Test 16: Verify Payment API Call

**Steps**:
1. Open DevTools Network tab
2. Complete a test payment
3. Watch for POST to `/api/payments/verify`

**Verify**:
- [ ] Request body contains:
  - `razorpayOrderId`
  - `razorpayPaymentId`
  - `razorpaySignature`
  - `projectId`
- [ ] Response status 200 with:
  - `success: true`
  - `message: "Payment verified"`

---

## 🔄 State Management Testing

### Test 17: Loading States

**Steps**:
1. Navigate to payment page
2. Watch spinner animations
3. Click "Pay Now"
4. Watch for processing state
5. Complete payment
6. Watch success screen

**Verify**:
- [ ] Spinner shows on page load
- [ ] Spinner disappears when loaded
- [ ] Button shows "Processing..." when clicked
- [ ] Button disabled during payment
- [ ] Success screen shows spinner briefly
- [ ] Redirect happens after 2 seconds

---

### Test 18: Error State Recovery

**Steps**:
1. Trigger an error (failed payment or network issue)
2. Click "Try Again" button
3. Complete payment successfully

**Verify**:
- [ ] Error cleared
- [ ] Order recreated
- [ ] Payment can be reattempted
- [ ] Success works after retry

---

## ♿ Accessibility Testing

### Test 19: Keyboard Navigation

**Steps**:
1. Don't use mouse
2. Press Tab key repeatedly
3. Navigate through all elements
4. Press Enter on buttons
5. Test with payment form

**Verify**:
- [ ] Can tab to all buttons
- [ ] Focus visible on all elements
- [ ] Enter activates buttons
- [ ] Can complete full flow with keyboard

---

### Test 20: Screen Reader (Optional)

**Steps**:
1. Enable screen reader (NVDA/JAWS on Windows)
2. Navigate through page
3. Listen to announcements

**Verify**:
- [ ] All labels announced
- [ ] Form fields described
- [ ] Button purposes clear
- [ ] Error messages announced
- [ ] Success message announced

---

## 📊 Full Payment Flow Test

### Test 21: Complete Payment Journey (Happy Path)

**Steps**:
1. Start: Navigate to http://localhost:5173/workspace/projects/[projectId]/payment
2. Wait for page load
3. Verify project details display
4. Click "Pay Now" button
5. Razorpay modal opens
6. Enter test card: 4111 1111 1111 1111
7. Enter CVV: 123
8. Enter expiry: 12/25
9. Click "Pay"
10. Wait for verification
11. See success message
12. Wait for redirect
13. Land on project page

**Verify Each Step**:
- [ ] Step 1: Page loads
- [ ] Step 2: No errors during load
- [ ] Step 3: Project info correct
- [ ] Step 4: Button clickable
- [ ] Step 5: Modal opens
- [ ] Step 6-9: Form submission works
- [ ] Step 10: Verification API called
- [ ] Step 11: Success screen shows
- [ ] Step 12: Auto-redirect works
- [ ] Step 13: Land on correct page

---

## 🐛 Debugging Checklist

If something doesn't work:

**Check Console (F12 → Console tab)**:
- [ ] Any red error messages?
- [ ] Any yellow warnings?
- [ ] Any network errors?

**Check Network (F12 → Network tab)**:
- [ ] API calls completing?
- [ ] Status codes 200/201?
- [ ] Response data looks right?

**Check Environment**:
- [ ] VITE_RAZORPAY_KEY_ID set?
- [ ] Key format correct (rzp_test_ or rzp_live_)?
- [ ] VITE_API_BASE_URL correct?

**Check Backend**:
- [ ] Backend running (http://localhost:7000)?
- [ ] Payment routes configured?
- [ ] Database connected?
- [ ] Payment model created?

**Check Frontend**:
- [ ] All components imported?
- [ ] lucide-react icons showing?
- [ ] Tailwind CSS working?
- [ ] No missing dependencies?

---

## ✅ Quick Checklist

```
FUNCTIONALITY:
☐ Page loads without errors
☐ Project data displays
☐ Order creates successfully
☐ Test mode banner shows (if test key)
☐ Payment summary correct
☐ Razorpay checkout opens
☐ Test payment succeeds
☐ Failed payment handled
☐ Cancelled payment handled
☐ Error retry works
☐ Redirect happens

APPEARANCE:
☐ Dark theme applied
☐ Amber accents visible
☐ Responsive on mobile
☐ Responsive on tablet
☐ Responsive on desktop
☐ Icons display correctly
☐ Loading spinners show
☐ Error messages clear

SECURITY:
☐ No card data in logs
☐ HTTPS in production
☐ Signatures verified
☐ Auth headers sent
☐ No sensitive data exposed

ACCESSIBILITY:
☐ Keyboard navigation works
☐ Tab order logical
☐ Focus visible
☐ Labels clear
☐ Error messages announced
```

---

## 🎯 Test Results Template

```markdown
## Payment Page Test Results

Date: [DATE]
Tester: [NAME]

### Tests Passed: X/21

### Component Tests:
- [ ] Page load
- [ ] Project data
- [ ] Order creation
- [ ] Test mode banner
- [ ] Payment summary
- [ ] Checkout opens

### Payment Tests:
- [ ] Success payment
- [ ] Failed payment
- [ ] Cancelled payment
- [ ] Network error

### Security Tests:
- [ ] No card logging
- [ ] HTTPS check

### Responsive Tests:
- [ ] Mobile
- [ ] Tablet
- [ ] Desktop

### API Tests:
- [ ] Create order API
- [ ] Verify payment API

### State Tests:
- [ ] Loading states
- [ ] Error recovery

### Accessibility Tests:
- [ ] Keyboard navigation
- [ ] Screen reader

### Full Flow:
- [ ] Complete payment journey

### Issues Found:
1. ...
2. ...
3. ...

### Notes:
...
```

---

**Ready to test? Start with Test 1 and work through the checklist!** 🚀
