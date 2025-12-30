# 🚀 Frontend Pages - Router Integration Guide

## Quick Integration Steps

### **Step 1: Copy Page Files**
The following 5 page components have been created:

```
src/pages/
├── StudentPaymentPage.jsx      (159 lines)
├── AdminPaymentPage.jsx        (215 lines)
├── PaymentVerificationPage.jsx (242 lines)
├── RatingPage.jsx              (180 lines)
└── PaymentWorkflowPage.jsx     (285 lines)
```

### **Step 2: Update Your Router Configuration**

In your `src/App.jsx` or route configuration file, add these imports:

```javascript
import StudentPaymentPage from '@/pages/StudentPaymentPage';
import AdminPaymentPage from '@/pages/AdminPaymentPage';
import PaymentVerificationPage from '@/pages/PaymentVerificationPage';
import RatingPage from '@/pages/RatingPage';
import PaymentWorkflowPage from '@/pages/PaymentWorkflowPage';
```

### **Step 3: Add Routes**

Add these routes to your `<Routes>` component:

```jsx
{/* Student Payment History */}
<Route 
  path="/student/payments" 
  element={
    <ProtectedRoute requiredRole="student">
      <StudentPaymentPage />
    </ProtectedRoute>
  } 
/>

{/* Admin Payment Release Dashboard */}
<Route 
  path="/admin/payments" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPaymentPage />
    </ProtectedRoute>
  } 
/>

{/* Payment Verification */}
<Route 
  path="/payments/verify" 
  element={
    <ProtectedRoute requiredRole="company">
      <PaymentVerificationPage />
    </ProtectedRoute>
  } 
/>

{/* Project Rating */}
<Route 
  path="/workspace/projects/:projectId/rating" 
  element={
    <ProtectedRoute requiredRole="student">
      <RatingPage />
    </ProtectedRoute>
  } 
/>

{/* Payment Workflow Guide */}
<Route 
  path="/workflow/payments" 
  element={<PaymentWorkflowPage />} 
/>
```

---

## 📱 Page Components Overview

### **1. StudentPaymentPage.jsx**
**Route:** `/student/payments`

```jsx
// Features:
- Total earnings display
- Payment status filtering
- Transaction history
- Currency formatting (₹ with 2 decimals)
- Responsive grid layout

// Required Props/APIs:
- getStudentEarnings() API call
- User must be logged in as student

// Component Dependencies:
- PaymentSummary (child component)
- Navbar
- react-toastify (notifications)
```

**Example API Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 50000,
    "transactions": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "projectTitle": "E-Commerce Website",
        "studentName": "John Doe",
        "baseAmount": 10000,
        "platformFeePercentage": 5,
        "status": "released",
        "createdAt": "2025-12-30T10:30:00Z",
        "razorpayOrderId": "order_123456"
      }
    ]
  }
}
```

---

### **2. AdminPaymentPage.jsx**
**Route:** `/admin/payments`

```jsx
// Features:
- Pending payment count
- Total release amount
- Days pending breakdown
- Search functionality
- Payment release cards
- Pagination support

// Required Props/APIs:
- getPendingReleases(page) API call
- releasePayment(id, notes) API call
- User must be logged in as admin

// Component Dependencies:
- PaymentReleaseCard (child component)
- Navbar
- react-toastify (notifications)
- lucide-react icons
```

**Example Usage:**
```javascript
// Load payments
const res = await getPendingReleases(1);
// Release a payment
const res = await releasePayment(paymentId, { releaseNotes: 'Released by admin' });
```

---

### **3. PaymentVerificationPage.jsx**
**Route:** `/payments/verify`

```jsx
// Features:
- Form for Razorpay details
- Demo test data loader
- Success/failure states
- Payment details display

// Required Props/APIs:
- verifyPayment(formData) API call
- User must be logged in as company

// Form Fields:
- Razorpay Order ID
- Razorpay Payment ID
- Razorpay Signature

// Component Dependencies:
- Navbar
- react-toastify (notifications)
```

**Example Test Data:**
```javascript
formData = {
  razorpayOrderId: 'order_demo_12345',
  razorpayPaymentId: 'pay_demo_67890',
  razorpaySignature: 'demo_signature_test'
}
```

---

### **4. RatingPage.jsx**
**Route:** `/workspace/projects/:projectId/rating`

```jsx
// Features:
- 1-5 star rating selector
- Optional review text (500 char limit)
- Rating criteria guide
- Success confirmation

// Required Props/APIs:
- submitRating(rating, review) API call
- User must be logged in as student
- Must have completed project

// Component Dependencies:
- Navbar
- react-toastify (notifications)
- lucide-react icons
```

**Example Data:**
```javascript
{
  rating: 5,
  review: 'Great experience working on this project!',
  projectId: '694b926425759654dcf1a87a'
}
```

---

### **5. PaymentWorkflowPage.jsx**
**Route:** `/workflow/payments`

```jsx
// Features:
- 9-step workflow visualization
- Interactive step selector
- Timeline view
- Role-based instructions
- Direct page links

// Requirements:
- Public accessible (no auth required)
- No API calls needed

// Component Dependencies:
- Navbar
- lucide-react icons
```

---

## 🔧 Configuration Checklist

Before testing, ensure:

### **Frontend Setup**
- [ ] All 5 page files copied to `src/pages/`
- [ ] Routes added to main router
- [ ] Components imported in router
- [ ] ProtectedRoute component exists
- [ ] Navbar component exists
- [ ] PaymentSummary component exists
- [ ] PaymentReleaseCard component exists

### **Dependencies Installed**
- [ ] react-toastify
- [ ] lucide-react
- [ ] axios
- [ ] date-fns
- [ ] tailwindcss

### **Backend Ready**
- [ ] All payment APIs deployed
- [ ] Database connected
- [ ] JWT authentication working
- [ ] Role-based middleware working

### **Environment Variables**
- [ ] VITE_API_URL set correctly
- [ ] VITE_SOCKET_URL set correctly
- [ ] VITE_RAZORPAY_KEY_ID configured
- [ ] VITE_PLATFORM_FEE_PERCENTAGE set

---

## 🧪 Testing Instructions

### **Test 1: Student Payment Page**
```
1. Login as student: http://localhost:5173/login
2. Navigate to: http://localhost:5173/student/payments
3. Verify data loads
4. Test filter buttons
5. Check responsive layout
```

### **Test 2: Admin Payment Page**
```
1. Login as admin
2. Navigate to: http://localhost:5173/admin/payments
3. Verify pending payments display
4. Test search functionality
5. Test pagination
6. Try release payment button
```

### **Test 3: Verify Payment**
```
1. Login as company
2. Navigate to: http://localhost:5173/payments/verify
3. Click "Load Test Data"
4. Click "Verify Payment"
5. Verify success message displays
```

### **Test 4: Rating Page**
```
1. Login as student
2. Navigate to: http://localhost:5173/workspace/projects/[projectId]/rating
3. Select 5 stars
4. Write a review (min 10 chars)
5. Click "Submit Rating"
6. Verify success message
```

### **Test 5: Workflow Page**
```
1. Navigate to: http://localhost:5173/workflow/payments
2. No login required
3. Click through workflow steps
4. Read instructions
5. Test "Go to Page" buttons
```

---

## 📊 Component Hierarchy

```
App
├── Router
│   ├── StudentPaymentPage
│   │   └── PaymentSummary (multiple)
│   ├── AdminPaymentPage
│   │   └── PaymentReleaseCard (multiple)
│   ├── PaymentVerificationPage
│   ├── RatingPage
│   └── PaymentWorkflowPage
```

---

## 🔐 Protected Routes Configuration

Each page uses `<ProtectedRoute>` to enforce role-based access:

| Route | Required Role | Fallback |
|-------|---------------|----------|
| `/student/payments` | student | Redirect to login |
| `/admin/payments` | admin | Redirect to login |
| `/payments/verify` | company | Redirect to login |
| `/workspace/projects/:id/rating` | student | Redirect to login |
| `/workflow/payments` | none (public) | N/A |

---

## 🎯 Next Steps

1. **Copy all 5 page files** to your `src/pages/` directory
2. **Update your router** with the provided routes
3. **Test each page** using the testing instructions
4. **Integrate navigation** links in your navbar/sidebar
5. **Update API endpoints** if your backend paths differ
6. **Configure environment** variables

---

## 📞 Troubleshooting

### **Page Not Found (404)**
- Check route path spelling
- Verify imports are correct
- Restart development server

### **Styling Not Showing**
- Verify Tailwind CSS is configured
- Clear browser cache
- Check color variables are defined

### **API Calls Failing**
- Check VITE_API_URL is correct
- Verify JWT token in localStorage
- Check browser network tab for 401/403 errors

### **Protected Route Not Working**
- Ensure ProtectedRoute component exists
- Check user role in localStorage
- Verify middleware on backend

---

## 📝 File Locations

```
Project Root
└── seribro-frontend
    └── client
        └── src
            ├── pages/
            │   ├── StudentPaymentPage.jsx ✓
            │   ├── AdminPaymentPage.jsx ✓
            │   ├── PaymentVerificationPage.jsx ✓
            │   ├── RatingPage.jsx ✓
            │   └── PaymentWorkflowPage.jsx ✓
            ├── components/
            │   ├── payment/
            │   │   └── PaymentSummary.jsx (existing)
            │   ├── admin/
            │   │   └── PaymentReleaseCard.jsx (existing)
            │   ├── ProtectedRoute.jsx (existing)
            │   └── Navbar.jsx (existing)
            ├── apis/
            │   ├── paymentApi.js (existing)
            │   └── ... (other APIs)
            └── App.jsx (UPDATE THIS)
```

---

**Last Updated:** December 30, 2025  
**Status:** Complete - All pages ready for integration ✓
