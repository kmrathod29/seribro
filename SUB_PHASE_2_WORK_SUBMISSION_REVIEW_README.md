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
  - `client/src/pages/workspace/SubmitWork.jsx` — Student submission form
  - `client/src/pages/workspace/ReviewWork.jsx` — Company review interface
- New component: `client/src/components/workspace/WorkSubmissionForm.jsx` — handles multi-file upload, external links, message, and submission flow
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
- Add richer UI (drag-drop, thumbnails, progress bars) and PDF.js integration for in-app previews as enhancements.

---

If you want, I can now:
1. Add unit/integration tests for the backend methods and routes (recommended).
2. Improve frontend UX (drag-drop zone, file previews with thumbnails, progress indicator).
3. Add e2e tests for the full submission → review → approval flow.

Tell me which you prefer next.