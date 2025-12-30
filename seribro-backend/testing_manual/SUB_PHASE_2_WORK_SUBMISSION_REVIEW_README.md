# Sub-Phase 2 — Work Submission & Review System

## Overview
This sub-phase adds a full work submission and review workflow for projects:
- Students can start work, submit files/links/messages as versioned submissions (v1, v2, v3).
- Companies review submissions: Approve, Request Revision (up to 2), or Reject (opens dispute after max revisions).
- All submissions preserved in project history, with per-version metadata and files stored in Cloudinary.
- Notifications (in-app) and emails sent for major events.

## Backend: Key Changes
- Updated `backend/models/Project.js`
  - Added `submissions[]`, `currentSubmission`, `revisionCount`, `revisionHistory`, timestamps (`startedAt`, `submittedAt`, `reviewedAt`, `approvedAt`, `completedAt`), and `workStarted`.
  - New instance methods: `startWork()`, `submitWork()`, `approveWork()`, `requestRevision()`, `rejectWork()`.

- New middleware: `backend/middleware/workSubmissionUploadMiddleware.js` — Multer-based upload with:
  - Max files: configurable (env `WORK_MAX_FILES`, default 10)
  - Max file size per file: env `WORK_MAX_FILE_SIZE_MB`, default 100 MB
  - Allowed types: common images, PDFs, docs, archives, design files
  - Temporary storage: `backend/uploads/work-submissions/`

- New util: `backend/utils/workspace/uploadWorkToCloudinary.js` — uploads uploaded files to Cloudinary under `seribro/work-submissions/{projectId}` and returns structured metadata.

- New controller: `backend/controllers/workSubmissionController.js` — Implements all endpoints (startWork, submitWork, getSubmissionHistory, getCurrentSubmission, approveWork, requestRevision, rejectWork) with notification/email integration.

- New routes: `backend/routes/workSubmissionRoutes.js` mounted at `/api/workspace`.

- Updates to `backend/utils/workspace/validateWorkspaceAccess.js` to allow more workspace statuses (`revision-requested`, `approved`, `disputed`).

- Env keys (see `.env.example`): `WORK_MAX_FILES`, `WORK_MAX_FILE_SIZE_MB`, `CLOUDINARY_WORK_SUBMISSIONS_FOLDER`, `MAX_SUBMISSION_REVISIONS`, `EMAIL_NOTIFY_ON_SUBMISSION`, etc.

## Frontend: Key Changes
- New API client: `client/src/apis/workSubmissionApi.js` (startWork, submitWork, getSubmissionHistory, getCurrentSubmission, approveWork, requestRevision, rejectWork)
- New pages:
  - `client/src/pages/workspace/SubmitWork.jsx` — Student submission form with FileUploadZone integration
  - `client/src/pages/workspace/ReviewWork.jsx` — Company review interface with submission history display
- New reusable components:
  - `client/src/components/workspace/FileUploadZone.jsx` — Drag-drop file upload with validation, preview grid, file type icons, and memory management (397 lines)
    - Features: Drag & drop + click-to-browse, file count/size/type validation, responsive preview grid (2 cols mobile → 4 cols desktop), image thumbnails, file type icons (PDF/docs/archives/images), error handling with toast notifications, Object URL cleanup
    - Props: onFilesSelected, maxFiles, maxSizePerFile, acceptedTypes, existingFiles, onRemoveFile, selectedFiles
  - `client/src/components/workspace/SubmissionCard.jsx` — Displays individual submission with version badge, status, files, links, message, feedback, and review actions (468 lines)
    - Features: Expandable sections, version/latest/status badges, collapsible files/links/message/feedback sections, company review actions (approve/revision/reject) with inline feedback textarea, character count validation, disabled revision button at max revisions, student-only feedback message
    - Props: submission, isLatest, canReview, userRole, onApprove, onRequestRevision, onReject, maxRevisions, currentRevisions
- Routes added in `client/src/App.jsx`:
  - `/workspace/projects/:projectId/submit`
  - `/workspace/projects/:projectId/review`

## Database Changes
- `Project` model now includes `submissions`, `currentSubmission`, `revisionCount`, `maxRevisionsAllowed` and related timestamps.

## Status Flow
Assigned → In-Progress → Submitted → Under-Review → (Approved | Revision-Requested) → In-Progress (resubmit) → ... → (Approved | Disputed)

## Testing Guide
Refer to the plan in `phase 5.2.txt` (attached) — includes 10 test scenarios covering start, submit, approve, revision, resubmit, rejection, history, file validation, and access control.

## Next Steps & Notes
- Payment release (on approval) is part of Sub-Phase 3 — the controller sends an admin notification as a placeholder.
- **Sub-Phase 5.4.2 — FileUploadZone Component (COMPLETED)**: Created standalone drag-drop file upload component with full validation, preview grid, and error handling. Integrated into SubmitWork.jsx for student work submissions.
- **Sub-Phase 5.4.3 — SubmissionCard Component (COMPLETED)**: Created reusable component for displaying submission history with version badges, status indicators, file/link sections, feedback display, and company review actions. Integrated into ReviewWork.jsx to show all submissions with per-version review capability.
- **ReviewWork.jsx Integration (COMPLETED)**: Updated to display submission history list using SubmissionCard components, handles revision count tracking, shows "No Submissions Yet" empty state, and manages company review workflow (approve/revision/reject).
- **SubmitWork.jsx Integration (COMPLETED)**: Updated to use FileUploadZone for file selection with drag-drop support, external links input, and submission message. Integrates with submitWork() API with proper FormData construction.

---

If you want to continue, next steps are:
1. Verify backend API endpoints (`getSubmissionHistory`, `approveWork`, `requestRevision`, `rejectWork`) return correct data structure and handle submission object properly.
2. Test end-to-end submission → review → approval flow in staging environment.
3. Test file uploads to Cloudinary and verify proper cleanup of temp files in `backend/uploads/work-submissions/`.
4. Add PDF preview modal for in-app file viewing (optional enhancement).
5. Implement dispute resolution flow when max revisions exceeded (Sub-Phase 3).