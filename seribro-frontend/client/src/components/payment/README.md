# Payment Components - Phase 5.4.8

## Overview

This directory contains payment-related UI components for the SERIBRO platform.

## Components

### PaymentSummary.jsx
Displays a payment breakdown summary with:
- Project and student information
- Base amount with currency formatting
- Platform fee calculation
- Total amount
- Payment status badge
- Transaction timestamp

**Import:**
```jsx
import PaymentSummary from '@/components/payment/PaymentSummary';
```

**Usage:**
```jsx
<PaymentSummary 
  payment={{
    projectName: "Website Redesign",
    studentName: "John Doe",
    baseAmount: 5000,
    platformFeePercentage: 5,
    status: "completed",
    timestamp: new Date(),
    paymentId: "order_123456"
  }}
/>
```

**Features:**
- ✅ Currency formatting with ₹ symbol
- ✅ Automatic fee calculation
- ✅ Status-based color coding
- ✅ Responsive card layout
- ✅ Payment ID reference
- ✅ Formatted timestamps

---

### PaymentReleaseCard.jsx (in /admin directory)
Admin payment management card with:
- Company logo and project information
- Student name
- Large amount display
- Pending duration color-coding
- Quick action buttons
- Expandable payment history

**Import:**
```jsx
import PaymentReleaseCard from '@/components/admin/PaymentReleaseCard';
```

**Usage:**
```jsx
<PaymentReleaseCard 
  payment={{
    companyLogo: "https://example.com/logo.png",
    companyName: "TechCorp",
    projectTitle: "Mobile App Development",
    projectId: "proj_123",
    studentName: "Jane Smith",
    studentId: "student_456",
    amount: 15000,
    releaseReadySince: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    paymentHistory: [
      { status: 'pending', timestamp: new Date() },
      { status: 'completed', timestamp: new Date(Date.now() - 1000) }
    ]
  }}
  onRelease={(payment) => {
    console.log("Release payment:", payment);
  }}
  onViewProject={({ projectId, studentId }) => {
    window.open(`/projects/${projectId}?student=${studentId}`, '_blank');
  }}
/>
```

**Features:**
- ✅ Pending duration color-coding:
  - 🟢 Green: < 24 hours
  - 🟡 Yellow: 1-3 days
  - 🔴 Red: > 3 days
- ✅ Quick action buttons (View, Release, Details)
- ✅ Expandable payment history
- ✅ Image fallback handling
- ✅ Responsive button layout

---

## Dependencies

All required dependencies are already installed:
- `lucide-react` - For icons
- `react` - Core library
- `date-fns` - For date formatting

See `package.json` for complete list.

---

## Configuration

Required environment variables:

```env
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000
VITE_PLATFORM_FEE_PERCENTAGE=5

# Backend (.env)
PLATFORM_FEE_PERCENTAGE=5
```

See `.env.example` files in the root directory for complete configuration.

---

## API Integration

Components use existing payment API endpoints:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/payments/create-order` | Create new payment order |
| `POST /api/payments/verify` | Verify payment |
| `GET /api/payments/admin/pending-releases` | Get pending releases |
| `POST /api/payments/admin/{id}/release` | Release payment |
| `GET /api/payments/student/earnings` | Get student earnings |

API client: `src/apis/paymentApi.js`

---

## Styling

### Color Scheme
- **Primary:** Gold/Yellow (`text-gold`, `bg-gold/20`)
- **Background:** Navy Blue (`from-navy/50 to-navy/30`)
- **Status Colors:**
  - Green: Success/Completed (`bg-green-500/20`, `text-green-300`)
  - Yellow: Warning/Pending (`bg-yellow-500/20`, `text-yellow-300`)
  - Red: Urgent/Error (`bg-red-500/20`, `text-red-300`)
  - Blue: Info (`bg-blue-500/20`, `text-blue-300`)

### Responsive Design
- Mobile: Full-width, stacked layout
- Tablet: 2-column grid
- Desktop: Multi-column optimized layout

All components are fully responsive and mobile-first.

---

## Examples

### Student Payment History Page
```jsx
import { useState, useEffect } from 'react';
import PaymentSummary from '@/components/payment/PaymentSummary';
import { getStudentEarnings } from '@/apis/paymentApi';

export default function PaymentHistory() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const res = await getStudentEarnings();
      if (res.success) {
        setTransactions(res.data.transactions);
      }
    };
    loadTransactions();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {transactions.map((txn) => (
        <PaymentSummary 
          key={txn._id} 
          payment={{
            projectName: txn.projectTitle,
            studentName: txn.studentName,
            baseAmount: txn.baseAmount,
            platformFeePercentage: txn.platformFeePercentage || 5,
            status: txn.status,
            timestamp: txn.createdAt,
            paymentId: txn.razorpayOrderId
          }}
        />
      ))}
    </div>
  );
}
```

### Admin Payment Release Dashboard
```jsx
import { useState, useEffect } from 'react';
import PaymentReleaseCard from '@/components/admin/PaymentReleaseCard';
import { getPendingReleases, releasePayment } from '@/apis/paymentApi';
import { toast } from 'react-toastify';

export default function PaymentDashboard() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const res = await getPendingReleases();
    if (res.success) {
      setPayments(res.data.payments);
    }
  };

  const handleRelease = async (payment) => {
    if (!confirm('Release this payment?')) return;
    
    const res = await releasePayment(payment._id, {});
    if (res.success) {
      toast.success('Payment released');
      setPayments(payments.filter(p => p._id !== payment._id));
    }
  };

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <PaymentReleaseCard
          key={payment._id}
          payment={payment}
          onRelease={handleRelease}
          onViewProject={({ projectId }) => {
            window.open(`/admin/projects/${projectId}`, '_blank');
          }}
        />
      ))}
    </div>
  );
}
```

---

## Props Reference

### PaymentSummary Props

```typescript
interface PaymentSummaryProps {
  payment?: {
    projectName?: string;           // Project title (default: 'N/A')
    studentName?: string;           // Student name (default: 'N/A')
    baseAmount?: number;            // Base amount (default: 0)
    platformFeePercentage?: number; // Fee % (default: 5)
    status?: 'pending' | 'completed' | 'released' | 'failed'; // (default: 'pending')
    timestamp?: Date;               // Payment date (default: now)
    paymentId?: string;             // Transaction ID (optional)
  };
}
```

### PaymentReleaseCard Props

```typescript
interface PaymentReleaseCardProps {
  payment?: {
    companyLogo?: string;
    companyName?: string;
    projectTitle?: string;
    projectId?: string;
    studentName?: string;
    studentId?: string;
    amount?: number;
    releaseReadySince?: Date;
    paymentHistory?: Array<{
      status: 'completed' | 'pending' | 'failed';
      timestamp: Date;
      notes?: string;
    }>;
  };
  onRelease?: (payment: any) => void;
  onViewProject?: ({ projectId, studentId }: any) => void;
}
```

---

## Testing

For comprehensive testing guidance, see:
- `PHASE_5.4.8_TESTING_GUIDE.md` - Full test scenarios
- `PHASE_5.4.8_INTEGRATION_EXAMPLES.jsx` - Code examples

Quick test checklist:
- [ ] Renders without errors
- [ ] Currency formatting is correct
- [ ] Status colors display properly
- [ ] Responsive on all devices
- [ ] Buttons are clickable
- [ ] Error handling works

---

## Documentation

For more detailed information:
- **[PHASE_5.4.8_PAYMENT_COMPONENTS_GUIDE.md](../../PHASE_5.4.8_PAYMENT_COMPONENTS_GUIDE.md)** - Complete guide
- **[PHASE_5.4.8_INTEGRATION_EXAMPLES.jsx](../../PHASE_5.4.8_INTEGRATION_EXAMPLES.jsx)** - Code examples
- **[PHASE_5.4.8_TESTING_GUIDE.md](../../PHASE_5.4.8_TESTING_GUIDE.md)** - Testing guide
- **[PHASE_5.4.8_INDEX.md](../../PHASE_5.4.8_INDEX.md)** - Navigation index

---

## Related Files

- **API Client:** `src/apis/paymentApi.js`
- **Configuration:** `.env.example` (root directory)
- **Existing Components:** `src/components/admin/`, `src/components/companyComponent/`

---

## Phase Information

**Phase:** 5.4.8 - Payment Display Components
**Status:** ✅ Complete
**Date:** December 29, 2025
**Components:** 2
**Breaking Changes:** 0

---

## Support

For questions or issues:
1. Check the comprehensive guide: `PHASE_5.4.8_PAYMENT_COMPONENTS_GUIDE.md`
2. Review integration examples: `PHASE_5.4.8_INTEGRATION_EXAMPLES.jsx`
3. Check testing guide: `PHASE_5.4.8_TESTING_GUIDE.md`
4. Review source code comments in component files

---

*Last Updated: December 29, 2025*
*All components are production-ready*
