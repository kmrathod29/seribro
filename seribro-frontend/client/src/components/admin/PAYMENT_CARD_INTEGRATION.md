// src/components/admin/PaymentReleaseCard.jsx - Integration Guide

/**
 * PaymentReleaseCard Component - Used in AdminPaymentReleases
 * 
 * This component displays individual payment release cards with:
 * - Company logo and details
 * - Project information
 * - Student name
 * - Payment amount
 * - Pending duration with color coding
 * - Action buttons (View Project, Details, Release)
 * - Expandable payment history
 * 
 * Props:
 * {
 *   payment: {
 *     _id: string,
 *     companyLogo: string (URL),
 *     companyName: string,
 *     projectTitle: string,
 *     projectId: string,
 *     studentName: string,
 *     studentId: string,
 *     amount: number,
 *     releaseReadySince: Date,
 *     paymentHistory: Array<{ status, timestamp, notes }>
 *   },
 *   onRelease: (payment) => void,
 *   onViewProject: ({ projectId, studentId }) => void
 * }
 * 
 * Color Coding (by days pending):
 * - < 1 day: Green (new)
 * - 1-3 days: Yellow (moderate)
 * - > 3 days: Red (urgent)
 */

// Example Usage in AdminPaymentReleases.jsx:
<PaymentReleaseCard
  payment={{
    _id: payment._id,
    companyLogo: payment.company?.logo || '',
    companyName: payment.company?.companyName || 'Unknown',
    projectTitle: payment.project?.title || 'Untitled',
    projectId: payment.project?._id,
    studentName: payment.student?.name || 'Unknown',
    studentId: payment.student?._id,
    amount: payment.amount,
    releaseReadySince: payment.capturedAt || payment.createdAt,
    paymentHistory: payment.transactionHistory || []
  }}
  onRelease={() => handleReleaseClick(payment)}
  onViewProject={(data) => {
    // Navigate to project details if needed
    console.log('View project:', data);
  }}
/>
