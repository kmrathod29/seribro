# Complete Payment & Rating Pages - URL Guide

## 🌐 All Frontend Page URLs

### Base Configuration
- **Frontend URL:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`
- **Environment:** Development

---

## 📄 Page URLs for Testing

### 1. **Student Payment History Page**
**URL:** `http://localhost:5173/student/payments`

**Purpose:** Student views their earnings and payment transactions

**Features:**
- Total earnings display
- Total projects count
- Pending payment count
- Filter by status (all, pending, completed, released)
- Payment summary cards with breakdowns
- Payment history with dates

**Test Data Needed:**
- Student logged in
- At least one completed project with payment

**Role Required:** Student

---

### 2. **Admin Payment Release Dashboard**
**URL:** `http://localhost:5173/admin/payments`

**Purpose:** Admin manages and releases verified payments

**Features:**
- Ready for release count
- Total amount pending
- Days pending breakdown (1-3 days vs 3+ days)
- Search by project, student, or company
- Payment release cards with color coding
- Pagination for multiple payments
- View project link
- Release payment button

**Test Data Needed:**
- Admin logged in
- Verified payments in queue
- 3-day hold period expired

**Role Required:** Admin

---

### 3. **Payment Verification Page**
**URL:** `http://localhost:5173/payments/verify`

**Purpose:** Verify Razorpay payments before release

**Features:**
- Enter Razorpay Order ID
- Enter Razorpay Payment ID
- Enter Razorpay Signature
- Demo test data loader
- Success/failure states
- Payment details display
- Verify another button

**Test Data (Demo):**
```
Razorpay Order ID: order_demo_12345
Razorpay Payment ID: pay_demo_67890
Razorpay Signature: demo_signature_test
```

**Role Required:** Company

---

### 4. **Rating Page**
**URL:** `http://localhost:5173/workspace/projects/:projectId/rating`

**Example:** `http://localhost:5173/workspace/projects/694b926425759654dcf1a87a/rating`

**Purpose:** Student rates and reviews completed project

**Features:**
- 1-5 star rating selector
- Hover effects on stars
- Optional review text (500 char limit)
- Rating status display
- Character count indicator
- Criteria guide (5-star scale explanation)
- Submit rating button

**Test Data Needed:**
- Student logged in
- Completed project assigned
- Payment already released to student

**Role Required:** Student

---

### 5. **Payment Workflow Page**
**URL:** `http://localhost:5173/workflow/payments`

**Purpose:** Visual guide through complete payment process

**Features:**
- 9-step workflow visualization
- Interactive step selector
- Detailed instructions for each step
- Role-based steps
- Direct links to each page
- Timeline view
- Important notes and warnings

**Test Data:** None required (informational)

**Role Required:** Any authenticated user

---

## 🔗 Related Pages & Navigation

### From Student Dashboard
```
Dashboard
├── My Projects
│   └── Project Details
│       ├── Rating Page (/workspace/projects/:id/rating)
│       └── Payment Status
├── Payments & Earnings (/student/payments)
└── Work History
```

### From Admin Dashboard
```
Admin Dashboard
├── Applications Management
├── Project Management
├── Payment Release (/admin/payments)
├── User Management
└── Analytics
```

### From Company Dashboard
```
Company Dashboard
├── My Projects
├── Applications
├── Payment Verify (/payments/verify)
├── Analytics
└── Team Management
```

---

## 📋 Complete Workflow URLs in Order

Follow this sequence to test complete workflow:

### **Student Journey:**
1. **Browse Projects:** `http://localhost:5173/workspace/projects`
2. **View Project Details:** `http://localhost:5173/workspace/projects/[projectId]`
3. **Apply to Project:** (Button on project details page)
4. **View Applications:** `http://localhost:5173/student/applications`
5. **Check Payment:** `http://localhost:5173/student/payments`
6. **Rate Project:** `http://localhost:5173/workspace/projects/[projectId]/rating`

### **Company Journey:**
1. **Create Project:** `http://localhost:5173/dashboard/projects/create`
2. **View Applications:** `http://localhost:5173/dashboard/applications`
3. **Accept Student:** (Button in applications)
4. **Make Payment:** `http://localhost:5173/dashboard/projects/[projectId]`
5. **Verify Payment:** `http://localhost:5173/payments/verify`
6. **Check Status:** `http://localhost:5173/dashboard/projects/[projectId]`

### **Admin Journey:**
1. **Dashboard:** `http://localhost:5173/admin`
2. **View Payments:** `http://localhost:5173/admin/payments`
3. **Release Payment:** (Button on payment card)
4. **Verify Release:** `http://localhost:5173/admin/payments` (check history)
5. **Analytics:** `http://localhost:5173/admin/analytics`

---

## 🧪 Testing Scenarios

### **Scenario 1: Complete Payment Flow**
```
1. Login as Student → /workspace/projects
2. Browse and apply to project
3. Wait for company acceptance
4. After payment: /student/payments
5. Rate project: /workspace/projects/:id/rating
```

### **Scenario 2: Verify Payment**
```
1. Login as Company
2. Create/Select Project: /dashboard/projects/:id
3. Create Payment (triggers Razorpay)
4. Get Order ID, Payment ID, Signature
5. Go to: /payments/verify
6. Enter all three details
7. Click "Verify Payment"
```

### **Scenario 3: Release Payment (Admin)**
```
1. Login as Admin
2. Go to: /admin/payments
3. Wait 3 days after payment verified
4. Click "Release Payment" on card
5. Confirm release
6. Payment status updates to "released"
7. Student can withdraw funds
```

### **Scenario 4: Rating & Review**
```
1. Login as Student (who received payment)
2. Go to: /workspace/projects/:projectId/rating
3. Select 1-5 stars
4. Write optional review (10+ chars)
5. Click "Submit Rating"
6. Confirmation message displays
```

---

## 🔐 Authentication & Roles

### Required for Each Page:

| Page | URL | Role | Status |
|------|-----|------|--------|
| Student Payments | `/student/payments` | Student | Protected ✓ |
| Admin Payments | `/admin/payments` | Admin | Protected ✓ |
| Verify Payment | `/payments/verify` | Company | Protected ✓ |
| Rating | `/workspace/projects/:id/rating` | Student | Protected ✓ |
| Workflow | `/workflow/payments` | Any | Public |

### Login URLs:
- **Student Login:** `http://localhost:5173/login`
- **Company Login:** `http://localhost:5173/login`
- **Admin Login:** `http://localhost:5173/login`

---

## 📊 Environment Variables Check

Before testing, ensure these are set in `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_RAZORPAY_KEY_SECRET=your_razorpay_secret
VITE_PLATFORM_FEE_PERCENTAGE=5
```

---

## 🚀 Quick Start Testing

### **1. Start Frontend**
```bash
cd seribro-frontend/client
npm run dev
# Frontend runs on http://localhost:5173
```

### **2. Start Backend**
```bash
cd seribro-backend
npm start
# Backend runs on http://localhost:5000
```

### **3. Create Test Accounts**
- Register student
- Register company
- Admin account (pre-configured)

### **4. Test Routes**

**Test Student Payment:**
```
1. Open: http://localhost:5173/student/payments
2. View earnings and transactions
3. Filter by status
```

**Test Payment Verify:**
```
1. Open: http://localhost:5173/payments/verify
2. Load demo test data
3. Click "Verify Payment"
4. See success message
```

**Test Admin Release:**
```
1. Open: http://localhost:5173/admin/payments
2. Click "Release Payment" on card
3. Confirm action
4. Status updates to released
```

**Test Rating:**
```
1. Open: http://localhost:5173/workspace/projects/694b926425759654dcf1a87a/rating
2. Select stars (hover to preview)
3. Write review (optional)
4. Click "Submit Rating"
```

---

## 📱 Responsive Pages

All pages are fully responsive:
- **Mobile:** Stack layout, single column
- **Tablet:** 2-column grid
- **Desktop:** Full multi-column grid

Test at different viewport sizes:
- Mobile: `320px - 640px`
- Tablet: `641px - 1024px`
- Desktop: `1025px+`

---

## 🔔 Integration Points

### **PaymentSummary Component**
Used in: `/student/payments`
Shows: Payment breakdown with fee calculation

### **PaymentReleaseCard Component**
Used in: `/admin/payments`
Shows: Payment with release options and history

### **ProtectedRoute Component**
Guards all payment pages with role-based access

### **API Endpoints Called**
- `GET /api/payments/student/earnings` - Student page
- `GET /api/payments/admin/pending-releases` - Admin page
- `POST /api/payments/verify` - Verify page
- `POST /api/payments/admin/:id/release` - Admin release
- `POST /api/ratings/submit` - Rating submission

---

## ✅ Verification Checklist

Before marking as complete:

- [ ] Student Payment page loads and displays data
- [ ] Admin Payment page shows pending payments
- [ ] Payment Verification accepts demo data
- [ ] Rating page accepts star selection
- [ ] All pages have proper styling and layout
- [ ] Role-based access control working
- [ ] Navigation links functional
- [ ] Responsive on mobile/tablet/desktop
- [ ] Pagination works on admin page
- [ ] Search/filter works on admin page
- [ ] All API calls complete successfully
- [ ] Error handling displays properly
- [ ] Loading states show correctly
- [ ] Success messages display
- [ ] Back buttons work properly

---

## 🐛 Debugging Tips

### **Page Not Loading?**
1. Check browser console for errors
2. Verify JWT token in localStorage
3. Check user role matches page requirements
4. Ensure backend is running
5. Check CORS configuration

### **API Call Failing?**
1. Check network tab in dev tools
2. Verify API URL in .env
3. Check JWT token validity
4. Check backend server status
5. Check API response in network tab

### **Styling Not Showing?**
1. Clear browser cache
2. Rebuild frontend: `npm run build`
3. Check Tailwind CSS is imported
4. Verify color variables in CSS
5. Check for CSS conflicts

---

## 📞 Need Help?

Refer to these documentation files:
- `PAYMENT_API_ROUTES_REFERENCE.md` - API endpoints
- `PAYMENT_ROUTES_QUICK_ACCESS.md` - Quick API reference
- `PHASE_5.4.8_IMPLEMENTATION_GUIDE.md` - Component docs
- `PHASE_5.4.8_TESTING_GUIDE.md` - Testing procedures

---

**Last Updated:** December 30, 2025
**Phase:** 5.4.8 - Payment Components Implementation
**Status:** Complete ✓
