# Sub-Phase 1 — Workspace Foundation (Phase 5.1)

## Overview
This phase implements the Project Workspace feature used for real-time communication and work coordination between companies and students. It includes: access control fixes, message model and workspace metadata, attachment handling, notifications with email inactivity checks, paginated message APIs, frontend workspace UI with optimistic messaging, auto-refresh, toasts, and skeleton/loading states.

---

## Architecture (high level)
- Frontend
  - ProjectWorkspace page → MessageBoard, MessageInput, MessageItem, ProjectOverviewCard, AssignedStudentCard, CompanyInfoCard
  - Calls workspace API functions which use axios with credentials
- Backend
  - Routes: `/api/workspace/projects/:projectId`, `/.../messages`
  - Controllers: `getWorkspaceOverview`, `sendMessage`, `getMessages`, `markMessagesAsRead`
  - Models: `Message`, `Project` (workspace fields)
  - Utilities: `validateWorkspaceAccess` for enforcing ownership and workspace statuses
  - Middleware: `workspaceUploadMiddleware` for file uploads and validation

---

## Key Fixes & Features
### Access Control
- Fixed `validateWorkspaceAccess` to:
  - check project status (allowed: `assigned`, `in-progress`, `submitted`, `under-review`, `completed`)
  - correctly compare IDs whether fields are populated or plain ObjectId (robust `extractId` logic)
  - support both `Company` and `CompanyProfile` records for compatibility
  - return `{ hasAccess, role, studentProfile?, companyProfile?, error? }` so controllers can customize the response

### Message Model & Project Updates
- `Message` schema now includes:
  - `attachments` schema with metadata (filename, originalName, fileType, url, public_id, size, uploadedAt)
  - `Message.statics.getProjectMessages(projectId, page, limit)` — paginated retrieval (returned chronologically)
  - `Message.statics.getUnreadCount(projectId, userId)` — unread message count for a user
  - `Message.statics.markAllAsRead(projectId, userId)` — bulk update marking unread messages as read
- `ProjectSchema.methods.updateLastActivity()` implemented and used when messages are posted
- `Project` fields: `lastActivity` (Date), `workspaceCreatedAt` (Date), `messageCount` (Number)

### File Attachments & Middleware
- `backend/middleware/workspaceUploadMiddleware.js` (export `uploadMessageFiles`) config:
  - Accepts up to 3 files under `attachments`
  - Validates extensions and MIME types (jpg/jpeg/png/gif/pdf/doc/docx/zip)
  - Max size 5 MB per file
  - Stores temporary files in `backend/uploads/workspace-messages` before Cloudinary upload
  - Returns 400 errors with clear messages on validation failures

### sendMessage Controller Improvements
- Handles multipart uploads via `uploadMessageFiles` and uploads to Cloudinary (`uploadToCloudinary`) while storing returned metadata on the message attachments
- Increments `project.messageCount` and updates `lastActivity` (via `updateLastActivity`) and sets `workspaceCreatedAt` when workspace opens
- Creates an in-app notification using `sendNotification`
- Implements an *email inactivity check*: queries recipient's latest message or uses `project.lastActivity` — only sends email if the recipient has been inactive for at least 30 minutes; otherwise no email (best-effort fallback if activity info not available)

### Messages API
- `GET /api/workspace/projects/:projectId/messages?page=&limit=` — returns messages with pagination metadata and unread counts
- `POST /api/workspace/projects/:projectId/messages` — send message (supports attachments via FormData)
- `PUT /api/workspace/projects/:projectId/messages/read` — mark all messages as read for current user

### Frontend Improvements
- Added `react-toastify` for success/error/info toasts (top-right, auto-close 3.5s)
- Added `date-fns` for relative timestamps
- Message board features:
  - Auto-refresh polling every 30 seconds
  - Smoothly append new messages and only auto-scroll when the user is at the bottom
  - Show a subtle "New messages" badge and info toast when messages arrive while the user is scrolled up
  - Optimistic UI on send: insert a temp message immediately, replace with server message on success, remove and show error toast on failure
- Message input improvements:
  - Auto-expanding textarea up to ~5 lines
  - Character counter (2000 limit) with color warnings at 1800 (orange) and 1900 (red)
  - Client-side file validation before upload
  - Send disabled when message is empty and no files (or when sending)
  - Keeps message and attachments on failed send so user can retry
- Extracted components: `ProjectOverviewCard`, `AssignedStudentCard`, `CompanyInfoCard` for cleaner structure
- Loading states & skeletons (basic implementations in the UI)

---

## API Reference (examples)
### Get Workspace Overview
GET /api/workspace/projects/:projectId
- Response 200: { success: true, message: 'Workspace loaded', data: { project, student, company, workspace, recentMessages, currentUserId } }
- Errors: 400 Invalid ID, 403 Access denied, 404 Not found

### Send Message
POST /api/workspace/projects/:projectId/messages
- FormData fields:
  - `message` (string, required)
  - `attachments` (files, optional, up to 3)
- Response 201: { success: true, message: 'Message sent successfully', data: { message: <Message> } }
- Errors: 400 validation (file type/size, empty message), 403 access denied

### Get Messages (paginated)
GET /api/workspace/projects/:projectId/messages?page=1&limit=20
- Response 200: { success: true, data: { messages: [...], pagination: { currentPage, totalPages, totalMessages, hasMore }, unreadCount }}

### Mark Messages as Read
PUT /api/workspace/projects/:projectId/messages/read
- Response 200: { success: true, data: { unreadCount: 0 } }

---

## Database Changes
- New/updated fields in `Message` and `Project` models. See `backend/models/Message.js` and `backend/models/Project.js`.

---

## Frontend Files Added/Updated
- Added components:
  - `src/components/workspace/ProjectOverviewCard.jsx`
  - `src/components/workspace/AssignedStudentCard.jsx`
  - `src/components/workspace/CompanyInfoCard.jsx`
- Updated:
  - `src/pages/workspace/ProjectWorkspace.jsx` (integrated components, polling, optimistic send)
  - `src/components/workspace/MessageBoard.jsx` (scroll behavior, new message badge)
  - `src/components/workspace/MessageInput.jsx` (auto-expand, char counter, file validation)
  - `src/components/workspace/MessageItem.jsx` (relative timestamps, improved styles)
  - `src/apis/workspaceApi.js` (FormData send with 60s timeout)
  - Added `react-toastify` & `date-fns` usage

---

## Testing Guide (manual)
1. Access control
   - Log in as the student assigned to a project, visit `/workspace/projects/:projectId` — it should load (no 403)
   - Log in as the project company and verify the workspace loads
   - Log in as a different user and confirm 403 Access Denied
2. Messaging
   - Send a text message as student; confirm immediate optimistic UI, then server confirmation
   - Send a reply from company in another session; confirm auto-refresh brings new message
   - Verify notifications created in DB (notifications collection)
   - Check that emails are only sent when recipient inactive (wait >30 minutes or inspect last message timestamps)
3. File attachments
   - Upload JPEG, PDF, ZIP within size limits — should succeed
   - Upload unsupported file type (e.g., .exe) — should show a clear 400 error
   - Upload >5MB — should be rejected
   - Upload 4 files at once — rejected
4. Pagination & read state
   - Create >20 messages, verify initial page loads 20
   - Load more older messages and check ordering remains chronological
   - When fetching messages, unread messages for the current user should be marked read
5. Frontend UX
   - Verify message input auto-expands and character counter changes color at thresholds
   - When scrolled up and new messages arrive, verify badge and toast appear (no forced scroll)
   - Test mobile responsiveness at 375px & 768px widths

---

## Known Limitations & Next Steps
- Small optimizations: show upload progress for attachments (future improvement)
- Work submission/review features planned for Sub-Phase 2 (dedicated endpoints and UI)
- Consider tracking per-user last-seen timestamps for more accurate email inactivity checks (would allow a more precise inactivity window)

---

If anything is unclear or you want me to open PRs/tests for these changes, I can proceed with unit tests and CI updates next.
