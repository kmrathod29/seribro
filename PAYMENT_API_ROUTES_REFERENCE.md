# 💰 SERIBRO Payment API Routes - Complete Reference

## Base URL
```
http://localhost:5000/api/payments
```

---

## 📋 ALL PAYMENT ENDPOINTS

### 1️⃣ CREATE PAYMENT ORDER
```
POST /api/payments/create-order
```
**Who can access:** Company (role: 'company')
**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "projectId": "proj_123456",
  "studentId": "student_456",
  "amount": 15000,
  "description": "Payment for Mobile App Development"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_123456789",
    "amount": 15000,
    "currency": "INR",
    "status": "created"
  }
}
```

---

### 2️⃣ VERIFY PAYMENT
```
POST /api/payments/verify
```
**Who can access:** Company (role: 'company')
**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "razorpayOrderId": "order_123456789",
  "razorpayPaymentId": "pay_123456789",
  "razorpaySignature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment_123",
    "status": "completed",
    "amount": 15000
  }
}
```

---

### 3️⃣ MARK PAYMENT READY FOR RELEASE
```
POST /api/payments/:paymentId/ready
```
**Who can access:** Company (role: 'company')
**Authentication:** Required (JWT Token)

**Response:**
```json
{
  "success": true,
  "message": "Payment marked ready for release"
}
```

---

### 4️⃣ GET STUDENT EARNINGS
```
GET /api/payments/student/earnings
```
**Who can access:** Student (role: 'student')
**Authentication:** Required (JWT Token)

**Query Parameters:**
```
?page=1
?limit=10
?status=completed|pending|released
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 50000,
    "transactions": [
      {
        "_id": "txn_123",
        "projectTitle": "Website Redesign",
        "companyName": "TechCorp",
        "baseAmount": 5000,
        "platformFeePercentage": 5,
        "platformFee": 250,
        "totalAmount": 5250,
        "status": "completed",
        "createdAt": "2025-12-29T10:30:00Z"
      }
    ]
  }
}
```

---

### 5️⃣ GET COMPANY PAYMENTS
```
GET /api/payments/company/payments
```
**Who can access:** Company (role: 'company')
**Authentication:** Required (JWT Token)

**Query Parameters:**
```
?page=1
?limit=10
?status=pending|completed|released
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPaymentsMade": 150000,
    "payments": [
      {
        "_id": "payment_123",
        "projectTitle": "Mobile App Development",
        "studentName": "Jane Smith",
        "amount": 15000,
        "status": "released",
        "paymentDate": "2025-12-29T10:30:00Z"
      }
    ]
  }
}
```

---

### 6️⃣ GET PENDING RELEASES (ADMIN)
```
GET /api/payments/admin/pending-releases
```
**Who can access:** Admin (role: 'admin')
**Authentication:** Required (JWT Token)

**Query Parameters:**
```
?page=1
?limit=10
?sortBy=createdAt|amount
?order=asc|desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "_id": "payment_123",
        "companyName": "TechCorp",
        "companyLogo": "https://...",
        "projectTitle": "Website Redesign",
        "projectId": "proj_123",
        "studentName": "John Doe",
        "studentId": "student_123",
        "amount": 5000,
        "releaseReadySince": "2025-12-27T10:30:00Z",
        "paymentHistory": [
          {
            "status": "pending",
            "timestamp": "2025-12-29T10:30:00Z",
            "notes": "Awaiting admin approval"
          }
        ]
      }
    ],
    "total": 45,
    "page": 1,
    "pages": 5
  }
}
```

---

### 7️⃣ RELEASE PAYMENT (ADMIN)
```
POST /api/payments/admin/:paymentId/release
```
**Who can access:** Admin (role: 'admin')
**Authentication:** Required (JWT Token)

**URL Parameters:**
```
:paymentId = Payment ID to release
```

**Request Body:**
```json
{
  "releaseNotes": "Payment verified and released",
  "bankDetails": "optional"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment released successfully",
  "data": {
    "paymentId": "payment_123",
    "status": "released",
    "releasedAt": "2025-12-29T10:30:00Z"
  }
}
```

---

### 8️⃣ BULK RELEASE PAYMENTS (ADMIN)
```
POST /api/payments/admin/bulk-release
```
**Who can access:** Admin (role: 'admin')
**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "paymentIds": ["payment_123", "payment_456", "payment_789"],
  "releaseNotes": "Batch release - Weekly payout"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "released": 3,
    "failed": 0,
    "totalAmount": 25000,
    "releasedPayments": ["payment_123", "payment_456", "payment_789"]
  }
}
```

---

### 9️⃣ REFUND PAYMENT (ADMIN)
```
POST /api/payments/admin/:paymentId/refund
```
**Who can access:** Admin (role: 'admin')
**Authentication:** Required (JWT Token)

**URL Parameters:**
```
:paymentId = Payment ID to refund
```

**Request Body:**
```json
{
  "refundReason": "Project not completed",
  "refundAmount": 15000,
  "notes": "Refund approved by admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "paymentId": "payment_123",
    "refundId": "refund_123",
    "amount": 15000,
    "status": "refunded"
  }
}
```

---

### 🔟 GET PAYMENT DETAILS
```
GET /api/payments/:paymentId
```
**Who can access:** Any authenticated user
**Authentication:** Required (JWT Token)

**URL Parameters:**
```
:paymentId = Payment ID to fetch
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "payment_123",
    "company": { "_id": "company_123", "name": "TechCorp" },
    "student": { "_id": "student_123", "name": "John Doe" },
    "project": { "_id": "proj_123", "title": "Website Redesign" },
    "baseAmount": 15000,
    "platformFeePercentage": 5,
    "platformFee": 750,
    "totalAmount": 15750,
    "status": "completed",
    "razorpayOrderId": "order_123",
    "razorpayPaymentId": "pay_123",
    "createdAt": "2025-12-29T10:30:00Z",
    "updatedAt": "2025-12-29T11:30:00Z"
  }
}
```

---

## 🔐 AUTHENTICATION

All endpoints require JWT token in header:

```http
Authorization: Bearer <your_jwt_token>
```

**Get Token from:**
- Login endpoint: `POST /api/auth/login`
- Token stored in: `localStorage.getItem('token')`

---

## 👥 ROLE-BASED ACCESS

| Endpoint | Company | Student | Admin |
|----------|---------|---------|-------|
| create-order | ✅ | ❌ | ❌ |
| verify | ✅ | ❌ | ❌ |
| student/earnings | ❌ | ✅ | ❌ |
| company/payments | ✅ | ❌ | ❌ |
| admin/pending-releases | ❌ | ❌ | ✅ |
| admin/:id/release | ❌ | ❌ | ✅ |
| admin/bulk-release | ❌ | ❌ | ✅ |
| admin/:id/refund | ❌ | ❌ | ✅ |
| /:paymentId | ✅ | ✅ | ✅ |

---

## 📱 HOW TO USE IN FRONTEND

### Import API Client
```javascript
import * as paymentApi from '@/apis/paymentApi';
```

### Example: Create Order (Company)
```javascript
const handleCreateOrder = async () => {
  try {
    const res = await paymentApi.createOrder({
      projectId: 'proj_123',
      studentId: 'student_123',
      amount: 15000,
      description: 'Payment for project'
    });

    if (res.success) {
      console.log('Order created:', res.data.orderId);
      // Open Razorpay checkout
    } else {
      toast.error(res.message);
    }
  } catch (error) {
    toast.error('Error creating order');
  }
};
```

### Example: Get Student Earnings
```javascript
const handleGetEarnings = async () => {
  try {
    const res = await paymentApi.getStudentEarnings();

    if (res.success) {
      console.log('Earnings:', res.data.totalEarnings);
      console.log('Transactions:', res.data.transactions);
    }
  } catch (error) {
    console.error('Error loading earnings');
  }
};
```

### Example: Release Payment (Admin)
```javascript
const handleReleasePayment = async (paymentId) => {
  try {
    const res = await paymentApi.releasePayment(paymentId, {
      releaseNotes: 'Released on ' + new Date().toLocaleDateString()
    });

    if (res.success) {
      toast.success('Payment released');
      // Refresh payment list
    } else {
      toast.error(res.message);
    }
  } catch (error) {
    toast.error('Error releasing payment');
  }
};
```

---

## 🔍 POSTMAN COLLECTION

### Import these in Postman:

**Create Order**
```
POST http://localhost:5000/api/payments/create-order
Headers: Authorization: Bearer <token>
Body (JSON):
{
  "projectId": "proj_123",
  "studentId": "student_456",
  "amount": 15000
}
```

**Verify Payment**
```
POST http://localhost:5000/api/payments/verify
Headers: Authorization: Bearer <token>
Body (JSON):
{
  "razorpayOrderId": "order_123",
  "razorpayPaymentId": "pay_123",
  "razorpaySignature": "sig_123"
}
```

**Get Student Earnings**
```
GET http://localhost:5000/api/payments/student/earnings
Headers: Authorization: Bearer <token>
```

**Get Pending Releases**
```
GET http://localhost:5000/api/payments/admin/pending-releases?page=1
Headers: Authorization: Bearer <token>
```

**Release Payment**
```
POST http://localhost:5000/api/payments/admin/payment_123/release
Headers: Authorization: Bearer <token>
Body (JSON):
{
  "releaseNotes": "Released"
}
```

---

## ⚠️ ERROR RESPONSES

### Common Errors

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Please authenticate"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Payment not found"
}
```

**400 Bad Request**
```json
{
  "success": false,
  "message": "Invalid payment amount"
}
```

---

## 💡 TIPS

1. **Always include JWT token** in Authorization header
2. **Check user role** before calling endpoints
3. **Handle errors** with try-catch and toast notifications
4. **Use pagination** for list endpoints (?page=1&limit=10)
5. **Verify payment amounts** before processing
6. **Log payment transactions** for audit trail
7. **Use bulk-release** for batch payments (more efficient)

---

## 🚀 QUICK START

### For Student (Get Earnings)
```javascript
// Step 1: Make sure you're logged in as student
const token = localStorage.getItem('token');

// Step 2: Call earnings endpoint
const res = await fetch('http://localhost:5000/api/payments/student/earnings', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Step 3: Process response
const data = await res.json();
console.log(data.data.totalEarnings);
```

### For Company (Create Order)
```javascript
// Step 1: Make sure you're logged in as company
const token = localStorage.getItem('token');

// Step 2: Call create order endpoint
const res = await fetch('http://localhost:5000/api/payments/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: 'proj_123',
    studentId: 'student_456',
    amount: 15000
  })
});

// Step 3: Process response
const data = await res.json();
console.log(data.data.orderId);
```

### For Admin (Release Payment)
```javascript
// Step 1: Make sure you're logged in as admin
const token = localStorage.getItem('token');

// Step 2: Call release endpoint
const res = await fetch('http://localhost:5000/api/payments/admin/payment_123/release', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    releaseNotes: 'Released'
  })
});

// Step 3: Process response
const data = await res.json();
console.log(data.message);
```

---

## 📚 RELATED FILES

- **Payment Controller:** `backend/controllers/paymentController.js`
- **Payment Model:** `backend/models/Payment.js`
- **Payment API Client:** `client/src/apis/paymentApi.js`
- **Payment Components:** `client/src/components/payment/`
- **Payment Routes:** `backend/routes/paymentRoutes.js`

---

**Last Updated:** December 30, 2025
**Status:** ✅ Complete Reference
