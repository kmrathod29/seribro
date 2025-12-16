# Application Selection System - API Documentation

## Overview

The Application Selection System implements a multi-stage project application workflow:

```
Student Apply
    ↓
pending
    ↓
Company Shortlist (1-5)
    ↓
shortlisted
    ↓
Company Select (1)
    ↓
awaiting_acceptance (24h deadline)
    ├─ Student Accepts → accepted → Project Assigned
    ├─ Student Declines → rejected_by_student → Auto-select next or Reopen
    └─ Timeout → expired → Auto-select next or Reopen
```

## Status Enums

### Application Statuses
- **pending**: Initial status after student applies
- **shortlisted**: Included in company's short list with priority (1-5)
- **awaiting_acceptance**: Selected by company, waiting for student response (24h deadline)
- **accepted**: Student accepted the project
- **rejected**: Non-shortlisted applicant
- **rejected_by_student**: Student declined after being selected
- **on_hold**: Shortlisted but not selected (backup list)
- **withdrawn**: Student withdrew application
- **expired**: Student did not respond within 24h deadline

### Project Statuses (New)
- **selection_pending**: Project is in selection phase (one student awaiting response)

## Core Endpoints

### 1. Shortlist Applications (Company)

**POST** `/api/company/applications/shortlist`

Bulk shortlist applications with priority assignment.

**Request Body:**
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "applicationIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ],
  "priorities": {
    "507f1f77bcf86cd799439012": 1,
    "507f1f77bcf86cd799439013": 2
  }
}
```

**Validation:**
- All `applicationIds` must have status `pending`
- Priorities must be integers 1-5
- Maximum 5 applications per shortlist batch
- Company must own the project

**Response (Success):**
```json
{
  "success": true,
  "message": "2 applications shortlisted successfully",
  "shortlistedCount": 2,
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "status": "shortlisted",
      "shortlistPriority": 1,
      "statusHistory": [...]
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid applicationIds, priorities outside 1-5, duplicate ids
- `404`: Project or Application not found
- `409`: Applications already processed, company doesn't own project
- `500`: Transaction failure

---

### 2. Select Student (Company)

**POST** `/api/company/applications/select`

Select ONE shortlisted student and set 24h deadline.

**Request Body:**
```json
{
  "applicationId": "507f1f77bcf86cd799439012",
  "projectId": "507f1f77bcf86cd799439011"
}
```

**Behavior:**
1. Mark selected application: `status: 'awaiting_acceptance'`
2. Set `acceptanceDeadline = now + 24h`
3. Move other shortlisted: `status: 'on_hold'` (backup list)
4. Mark non-shortlisted pending: `status: 'rejected'`
5. Update project: `status: 'selection_pending'`
6. Send notification to selected student
7. Use MongoDB transaction for atomicity

**Response (Success):**
```json
{
  "success": true,
  "message": "Student selected successfully",
  "selection": {
    "_id": "507f1f77bcf86cd799439012",
    "studentId": "507f1f77bcf86cd799439099",
    "status": "awaiting_acceptance",
    "acceptanceDeadline": "2024-01-15T10:00:00Z",
    "selectedAt": "2024-01-14T10:00:00Z"
  },
  "onHoldCount": 1,
  "rejectedCount": 5,
  "transactionId": "txn_12345"
}
```

**Error Responses:**
- `400`: Application not shortlisted, invalid application status
- `404`: Application or Project not found
- `409`: Another student already under selection (prevent double selection)
- `422`: Invalid state transition, project not eligible for selection
- `500`: Transaction failure

---

### 3. Get Applications by Status (Company)

**GET** `/api/company/applications/grouped/:projectId`

Retrieve applications grouped by status with counts and details.

**Query Parameters:**
- `status` (optional): Filter by specific status
- `page` (optional, default 1): Pagination
- `limit` (optional, default 10): Items per page

**Response (Success):**
```json
{
  "success": true,
  "projectId": "507f1f77bcf86cd799439011",
  "summary": {
    "pending": 10,
    "shortlisted": 5,
    "awaiting_acceptance": 1,
    "on_hold": 4,
    "accepted": 0,
    "rejected": 3,
    "expired": 0,
    "total": 23
  },
  "applications": {
    "pending": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "studentId": "507f1f77bcf86cd799439099",
        "status": "pending",
        "createdAt": "2024-01-14T08:00:00Z",
        "student": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "shortlisted": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "studentId": "507f1f77bcf86cd799439100",
        "status": "shortlisted",
        "shortlistPriority": 1,
        "createdAt": "2024-01-14T08:30:00Z"
      }
    ],
    "awaiting_acceptance": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "studentId": "507f1f77bcf86cd799439101",
        "status": "awaiting_acceptance",
        "acceptanceDeadline": "2024-01-15T10:00:00Z",
        "selectedAt": "2024-01-14T10:00:00Z",
        "timeRemaining": 3600000
      }
    ],
    "on_hold": [...],
    "accepted": [...],
    "rejected": [...]
  }
}
```

**Error Responses:**
- `404`: Project not found
- `403`: Company doesn't own project
- `500`: Query failure

---

### 4. Student Accept Application

**POST** `/api/student/applications/:id/accept`

Accept a selected project within the 24h deadline.

**Request Body:**
```json
{
  "projectId": "507f1f77bcf86cd799439011"
}
```

**Validation:**
- Application status must be `awaiting_acceptance`
- Current time must be before `acceptanceDeadline`
- Student must own the application
- Rate limit: 10 attempts per hour per student

**Behavior:**
1. Verify deadline server-side (critical security check)
2. Mark application: `status: 'accepted'`
3. Update project: `status: 'assigned'`
4. Reject all `on_hold` applications: `status: 'rejected'`
5. Notify declined students
6. Notify company of acceptance
7. Use MongoDB transaction

**Response (Success):**
```json
{
  "success": true,
  "message": "Application accepted successfully",
  "application": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "accepted",
    "acceptedAt": "2024-01-14T10:30:00Z",
    "project": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "AI/ML Developer",
      "status": "assigned"
    }
  },
  "transactionId": "txn_12345"
}
```

**Error Responses:**
- `400`: Invalid request body
- `404`: Application not found
- `403`: Student doesn't own application
- `409`: DEADLINE_EXPIRED - 24h window has passed, CONCURRENT_RESPONSE
- `422`: Application not in awaiting_acceptance status
- `429`: RATE_LIMIT_EXCEEDED - max 10 attempts per hour
- `500`: Transaction failure

---

### 5. Student Decline Application

**POST** `/api/student/applications/:id/decline`

Decline a selected project and trigger auto-selection of backup.

**Request Body:**
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "reason": "Found another opportunity"
}
```

**Validation:**
- Application status must be `awaiting_acceptance`
- Current time must be before deadline
- Student must own the application
- Rate limit: 10 attempts per hour per student

**Behavior:**
1. Mark application: `status: 'rejected_by_student'`
2. Find next on_hold by priority: `shortlistPriority ASC, createdAt ASC`
3. If backup exists:
   - Mark as: `status: 'awaiting_acceptance'`
   - Set new deadline: now + 24h
   - Update project: keep `status: 'selection_pending'`
   - Notify new student
4. If no backup:
   - Update project: `status: 'open'` (reopen for applications)
   - Increment: `currentSelectionRound`
   - Notify company
5. Use MongoDB transaction

**Response (Success):**
```json
{
  "success": true,
  "message": "Application declined",
  "application": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "rejected_by_student",
    "declinedAt": "2024-01-14T10:30:00Z",
    "reason": "Found another opportunity"
  },
  "autoSelection": {
    "occurred": true,
    "nextStudentId": "507f1f77bcf86cd799439102",
    "newDeadline": "2024-01-15T10:30:00Z"
  },
  "projectStatus": "selection_pending",
  "transactionId": "txn_12345"
}
```

Or if no backup:
```json
{
  "success": true,
  "message": "Application declined, project reopened",
  "application": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "rejected_by_student"
  },
  "autoSelection": {
    "occurred": false,
    "reason": "No backup students available"
  },
  "projectStatus": "open",
  "projectReopened": true
}
```

**Error Responses:**
- `400`: Invalid request body
- `404`: Application not found
- `403`: Student doesn't own application
- `409`: DEADLINE_EXPIRED, CONCURRENT_RESPONSE
- `422`: Application not in awaiting_acceptance status
- `429`: RATE_LIMIT_EXCEEDED
- `500`: Transaction failure

---

### 6. Auto-Timeout Applications (System/Admin)

**POST** `/api/system/applications/auto-timeout`

Background job to auto-timeout expired applications. Runs every 5 minutes.

**Request Body:** (Optional)
```json
{
  "force": false
}
```

**Behavior:**
1. Find applications with:
   - `status: 'awaiting_acceptance'`
   - `acceptanceDeadline < now`
2. For each expired:
   - Mark: `status: 'expired'`
   - Find next on_hold by priority
   - If backup: auto-select with new deadline
   - If no backup: reopen project
3. Send notifications
4. Use MongoDB transaction per application

**Response (Success):**
```json
{
  "success": true,
  "message": "Auto-timeout processing completed",
  "summary": {
    "processed": 3,
    "autoSelected": 2,
    "projectsReopened": 1,
    "notificationsSent": 5
  },
  "details": [
    {
      "applicationId": "507f1f77bcf86cd799439012",
      "action": "auto-selected-backup",
      "nextStudentId": "507f1f77bcf86cd799439102",
      "newDeadline": "2024-01-15T10:30:00Z"
    },
    {
      "applicationId": "507f1f77bcf86cd799439013",
      "action": "project-reopened",
      "projectId": "507f1f77bcf86cd799439011"
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized (must be admin or system)
- `500`: Job processing error

---

## Status History & Audit Trail

Every status change records:
```json
{
  "statusHistory": [
    {
      "status": "shortlisted",
      "changedAt": "2024-01-14T09:00:00Z",
      "changedBy": "507f1f77bcf86cd799439050",
      "reason": "Manually shortlisted by recruiter",
      "metadata": {
        "priority": 1,
        "batchId": "batch_123"
      }
    },
    {
      "status": "awaiting_acceptance",
      "changedAt": "2024-01-14T10:00:00Z",
      "changedBy": "507f1f77bcf86cd799439050",
      "reason": "Selected as primary candidate",
      "metadata": {
        "deadline": "2024-01-15T10:00:00Z",
        "onHoldCount": 4,
        "rejectedCount": 5
      }
    }
  ]
}
```

## Error Handling

### Application-Level Errors

| Error Code | HTTP | Meaning | Recovery |
|-----------|------|---------|----------|
| DEADLINE_EXPIRED | 409 | 24h window passed | Decline auto-times out |
| CONCURRENT_SELECTION | 409 | Another student selected | Wait or retry when freed |
| CONCURRENT_RESPONSE | 409 | Multiple accept/decline | Retry (idempotent) |
| VERSION_MISMATCH | 409 | Project modified | Refresh and retry |
| DUPLICATE_APPLICATION | 400 | Same app in batch | Fix batch request |
| RATE_LIMIT_EXCEEDED | 429 | Too many attempts | Retry after delay |

### Project-Level Guards

1. **preventDuplicateSelection**: Only one student `awaiting_acceptance` per project
2. **validateProjectSelectionEligibility**: Project must be in selectable state
3. **preventStudentDoubleBooking**: Student can't accept from same company twice
4. **validateApplicationBatch**: All apps must belong to same project

## Security Measures

1. **Server-Side Deadline Verification**: Deadline checked server-side, not client
2. **MongoDB Transactions**: All multi-document updates are atomic
3. **Optimistic Locking**: Project version checked to prevent race conditions
4. **Rate Limiting**: 10 student response attempts per hour
5. **Role-Based Access Control**: Company can only manage own projects
6. **Audit Trail**: All changes logged in statusHistory with timestamp and actor
7. **Idempotent Operations**: Accept/decline can be retried safely

## Background Job Configuration

The auto-timeout job runs automatically every 5 minutes (configurable):

```javascript
// In server.js
const { startApplicationTimeoutJob } = require('./backend/utils/background/applicationTimeoutJob');

// Start background job with 5-minute interval
startApplicationTimeoutJob(5 * 60 * 1000);
```

## Transaction IDs

Each critical operation returns a `transactionId` for audit and dispute resolution:

```json
{
  "success": true,
  "transactionId": "txn_507f1f77bcf86cd799439011_20240114100000"
}
```

## Rate Limiting

Student accept/decline operations are rate-limited:
- **Limit**: 10 attempts per hour per user
- **Header**: `X-RateLimit-Remaining: 9`
- **Error**: Returns 429 with `Retry-After` header

## Integration Checklist

- [ ] Routes registered in main app.js
- [ ] Background job started in server.js
- [ ] Notification service configured
- [ ] Frontend: Company shortlist UI
- [ ] Frontend: Company selection UI with countdown
- [ ] Frontend: Student accept/decline modal
- [ ] Tests for transaction scenarios
- [ ] Tests for deadline edge cases
- [ ] Tests for race conditions
- [ ] Monitoring/alerts for failed jobs
- [ ] Logging for audit compliance

