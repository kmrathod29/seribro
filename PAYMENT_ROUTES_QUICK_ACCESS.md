# 🎯 Payment Routes Quick Access Guide

## 📍 PAYMENT API BASE URL
```
http://localhost:5000/api/payments
```

---

## 🚀 QUICK REFERENCE

### For COMPANY
```
✅ POST   /create-order        → Create payment order
✅ POST   /verify              → Verify payment
✅ GET    /company/payments    → View your payments
```

### For STUDENT
```
✅ GET    /student/earnings    → View your earnings
```

### For ADMIN
```
✅ GET    /admin/pending-releases      → View payments to release
✅ POST   /admin/:id/release           → Release single payment
✅ POST   /admin/bulk-release          → Release multiple payments
✅ POST   /admin/:id/refund            → Refund a payment
```

### For ALL (Authenticated)
```
✅ GET    /:paymentId          → Get payment details
```

---

## 🔑 ALL ENDPOINTS

| # | Method | Endpoint | Role | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | `/create-order` | Company | Create payment |
| 2 | POST | `/verify` | Company | Verify payment |
| 3 | GET | `/student/earnings` | Student | View earnings |
| 4 | GET | `/company/payments` | Company | View payments |
| 5 | GET | `/admin/pending-releases` | Admin | See pending releases |
| 6 | POST | `/admin/:id/release` | Admin | Release payment |
| 7 | POST | `/admin/bulk-release` | Admin | Release batch |
| 8 | POST | `/admin/:id/refund` | Admin | Refund payment |
| 9 | GET | `/:paymentId` | All | Get payment details |

---

## 💻 USAGE IN CODE

### Import the API client:
```javascript
import * as paymentApi from '@/apis/paymentApi';
```

### Available functions:
```javascript
paymentApi.createOrder(data)          // Create order
paymentApi.verifyPayment(payload)     // Verify payment
paymentApi.getPendingReleases(page)   // Admin: Get pending
paymentApi.releasePayment(id, data)   // Admin: Release
paymentApi.refundPayment(id, data)    // Admin: Refund
paymentApi.getStudentEarnings()       // Student: Get earnings
paymentApi.getCompanyPayments()       // Company: View payments
```

---

## 🧪 TEST WITH CURL

### Get Student Earnings:
```bash
curl -X GET http://localhost:5000/api/payments/student/earnings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Pending Releases:
```bash
curl -X GET http://localhost:5000/api/payments/admin/pending-releases \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Release a Payment:
```bash
curl -X POST http://localhost:5000/api/payments/admin/payment_id/release \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"releaseNotes":"Released"}'
```

---

## 📋 REQUEST/RESPONSE EXAMPLES

### 1. Create Order
**Request:**
```json
{
  "projectId": "proj_123",
  "studentId": "student_456",
  "amount": 15000
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_123456789",
    "amount": 15000
  }
}
```

### 2. Get Student Earnings
**Request:** No body needed
**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 50000,
    "transactions": [...]
  }
}
```

### 3. Get Pending Releases
**Request:** No body (use ?page=1)
**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [...],
    "total": 45,
    "page": 1
  }
}
```

### 4. Release Payment
**Request:**
```json
{
  "releaseNotes": "Approved"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Payment released",
  "data": { "status": "released" }
}
```

---

## ⚡ COMMON PATTERNS

### Check if user is logged in:
```javascript
const token = localStorage.getItem('token');
if (!token) {
  // Redirect to login
}
```

### Call payment API:
```javascript
try {
  const res = await paymentApi.getStudentEarnings();
  if (res.success) {
    // Use res.data
  } else {
    toast.error(res.message);
  }
} catch (error) {
  toast.error('Error');
}
```

### Handle authorization error:
```javascript
if (res.status === 401) {
  // Token expired, logout
  logout();
}
```

---

## 🔒 AUTHENTICATION

Every request needs JWT token in header:
```
Authorization: Bearer <your_token>
```

Token is stored after login:
```javascript
localStorage.setItem('token', response.token);
```

---

## 📱 IN REACT COMPONENTS

### Get Student Earnings:
```jsx
import { useEffect, useState } from 'react';
import { getStudentEarnings } from '@/apis/paymentApi';

export function StudentEarnings() {
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    const load = async () => {
      const res = await getStudentEarnings();
      if (res.success) {
        setEarnings(res.data.totalEarnings);
      }
    };
    load();
  }, []);

  return <div>Earnings: ₹{earnings}</div>;
}
```

### Get Pending Payments (Admin):
```jsx
import { useEffect, useState } from 'react';
import { getPendingReleases } from '@/apis/paymentApi';

export function AdminPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await getPendingReleases();
      if (res.success) {
        setPayments(res.data.payments);
      }
    };
    load();
  }, []);

  return payments.map(p => <div key={p._id}>{p.studentName}</div>);
}
```

---

## 🎯 BY ROLE

### STUDENT
```
GET /student/earnings     → View your earnings
GET /:paymentId           → View payment details
```

### COMPANY
```
POST /create-order        → Create payment order
POST /verify              → Verify payment (after Razorpay)
GET /company/payments     → View your payments
GET /:paymentId           → View payment details
```

### ADMIN
```
GET /admin/pending-releases       → View payments ready to release
POST /admin/:id/release           → Release a payment
POST /admin/bulk-release          → Release multiple payments
POST /admin/:id/refund            → Refund a payment
GET /:paymentId                   → View payment details
```

---

## ✅ CHECKLIST

Before using payment APIs:
- [ ] User is authenticated (token in localStorage)
- [ ] User has correct role (company/student/admin)
- [ ] Headers include: `Authorization: Bearer <token>`
- [ ] Request body is valid JSON (for POST)
- [ ] Endpoint URL is correct
- [ ] Handle success and error responses

---

## 📚 MORE INFO

For complete details, see:
→ **PAYMENT_API_ROUTES_REFERENCE.md**

---

**Quick Start:** Use the functions from `paymentApi.js` in your components!
