# SERIBRO Backend — Authentication (Phase 1)

Short: Backend authentication module for SERIBRO — registration (student & company), OTP verification, login/logout, password reset.

> Hinglish notes in parentheses provide quick context (e.g., “ye endpoint email verify karta he”).

---

## Table of Contents
- [API Endpoints](#api-endpoints)
- [Routes files](#routes-files)
- [Controllers & functions](#controllers--functions)
- [Middleware files](#middleware-files)
- [Models overview](#models-overview)
- [Folder structure](#folder-structure)
- [Utilities](#utilities)
- [Notes & environment variables](#notes--environment-variables)

---

## API Endpoints

All endpoints are mounted under `/api/auth` (see `server.js`). Each entry shows method, path, very short description, handler function, and where the route file is used.

- `POST /api/auth/student/register` — Register a student (multipart upload: `collegeId`). (ye endpoint student ko register karta hai aur OTP bhejta hai)
  - Route defined in: `backend/routes/authRoutes.js`
  - Handler function: `registerStudent` (in `backend/controllers/authController.js`)
  - Route mounted in: `server.js`

- `POST /api/auth/company/register` — Register a company (multipart upload: `verificationDocument`). (ye endpoint company register karta hai aur OTP bhejta hai)
  - Route defined in: `backend/routes/authRoutes.js`
  - Handler function: `registerCompany` (in `backend/controllers/authController.js`)
  - Route mounted in: `server.js`

- `POST /api/auth/send-otp` — Send verification OTP to user's email. (ye endpoint naya OTP email par bhejega)
  - Route defined in: `backend/routes/authRoutes.js`
  - Handler function: `sendOtp` (in `backend/controllers/authController.js`)
  - Route mounted in: `server.js`

- `POST /api/auth/verify-otp` — Verify OTP and mark email as verified. (ye endpoint email verify karta he)
  - Route defined in: `backend/routes/authRoutes.js`
  - Handler function: `verifyOtp` (in `backend/controllers/authController.js`)
  - Route mounted in: `server.js`

- `POST /api/auth/login` — Authenticate user and set JWT cookie. (ye endpoint login karta hai aur cookie set karega)
  - Route defined in: `backend/routes/authRoutes.js`
  - Handler function: `loginUser` (in `backend/controllers/authController.js`)
  - Route mounted in: `server.js`

- `POST /api/auth/logout` — Logout user (clear cookie). (ye endpoint logout/ cookie clear karega)
  - Route defined in: `backend/routes/authRoutes.js`
  - Handler function: `logoutUser` (in `backend/controllers/authController.js`)
  - Route mounted in: `server.js`

- `POST /api/auth/forgot-password` — Request password reset link (email). (ye endpoint reset link bhejega)
  - Route defined in: `backend/routes/authRoutes.js`
  - Handler function: `forgotPassword` (in `backend/controllers/authController.js`)
  - Route mounted in: `server.js`

- `POST /api/auth/reset-password` — Reset password using reset token. (ye endpoint token validate karke password reset karega)
  - Route defined in: `backend/routes/authRoutes.js`
  - Handler function: `resetPassword` (in `backend/controllers/authController.js`)
  - Route mounted in: `server.js`

---

## Routes files

- `backend/routes/authRoutes.js` — All authentication routes (student/company registration with file upload, send/verify OTP, login, logout, forgot/reset password). (Hinglish: Auth-related endpoints yahin defined hain)

---

## Controllers & functions

All controller functions live in `backend/controllers/authController.js`.

- `registerStudent` — Create `User` + `Student` documents, save uploaded `collegeId`, generate OTP and send verification email. (Used in: `backend/routes/authRoutes.js`)
- `registerCompany` — Create `User` + `Company` documents, save uploaded `verificationDocument`, generate OTP and send verification email. (Used in: `backend/routes/authRoutes.js`)
- `sendOtp` — Generate and persist a new OTP for an existing user and email it. (Used in: `backend/routes/authRoutes.js`)
- `verifyOtp` — Validate OTP document, mark `User.emailVerified = true`, remove OTP record. (Used in: `backend/routes/authRoutes.js`)
- `loginUser` — Authenticate credentials, verify `emailVerified`, track device, and set JWT cookie. (Used in: `backend/routes/authRoutes.js`)
- `logoutUser` — Clear the `jwt` cookie to log out the user. (Used in: `backend/routes/authRoutes.js`)
- `forgotPassword` — Generate password reset token, save to `User`, and email reset link. (Used in: `backend/routes/authRoutes.js`)
- `resetPassword` — Validate reset token and update `User` password. (Used in: `backend/routes/authRoutes.js`)

For each controller function, the following utilities & models are imported and used in `backend/controllers/authController.js`:

- Models imported: `backend/models/User.js`, `backend/models/Student.js`, `backend/models/Company.js`, `backend/models/OTP.js`
- Utils imported: `backend/utils/generateToken.js`, `backend/utils/generateResetToken.js`, `backend/utils/generateOTP.js`, `backend/utils/sendEmail.js`

---

## Middleware files

- `backend/middleware/authMiddleware.js` —
  - `protect` — Verify JWT from `req.cookies.jwt`, attach `req.user` (excludes password). (Used in: `backend/routes/authRoutes.js`) (Hinglish: ye middleware token check karega)
  - `roleCheck` — Higher-order middleware that checks if `req.user.role` is allowed. (Used in: `backend/routes/authRoutes.js` when role-based checks are applied)

- `backend/middleware/uploadMiddleware.js` — (exports Multer instance)
  - `upload` (multer instance) — Handles file storage, naming, file type filtering, and size limits for uploads. (Used in: `backend/routes/authRoutes.js`) (Hinglish: ye middleware file upload handle karega)

Note: Middleware functions are imported by `backend/routes/authRoutes.js` and the route handlers may rely on `protect` to guard endpoints (current routes use `upload` for file uploads and have `protect` available for protected routes).

---

## Models overview

- `backend/models/User.js` — Base user schema: `email`, hashed `password`, `role` (`student|company`), `emailVerified`, password reset fields, and `devices` array for session tracking. (Hinglish: User ke common auth/profile fields)
- `backend/models/Student.js` — Student profile linked to `User` (`user` ObjectId), `fullName`, `college`, `skills` array, `collegeId` (uploaded file path). (Hinglish: Student-specific info aur college ID path)
- `backend/models/Company.js` — Company profile linked to `User` (`user` ObjectId), `contactPersonName`, `companyName`, `verificationDocument` (uploaded file path). (Hinglish: Company-specific info aur verification doc path)
- `backend/models/OTP.js` — Stores `email` and `otp` with TTL/expire (10 minutes). (Hinglish: OTP 10 minute ke baad auto-expire ho jayega)

---

## Folder structure (what each folder is for)

- `backend/` — Backend source root.
  - `backend/routes/` — Express route files (e.g., `authRoutes.js`). (Hinglish: API endpoints yahan map hote hain)
  - `backend/controllers/` — Controller functions and business logic (e.g., `authController.js`). (Hinglish: Yahan auth logic hai)
  - `backend/models/` — Mongoose models/schemas (`User.js`, `Student.js`, `Company.js`, `OTP.js`). (Hinglish: DB schema yahan define hota hai)
  - `backend/middleware/` — Express middleware (e.g., `authMiddleware.js`, `uploadMiddleware.js`). (Hinglish: Request guard aur upload logic)
  - `backend/utils/` — Small helper utilities (`generateOTP.js`, `generateToken.js`, `generateResetToken.js`, `sendEmail.js`). (Hinglish: Helper functions)
  - `backend/config/` — Configuration & DB connection (`dbconection.js`). (Hinglish: DB connect aur config)
  - `backend/uploads/` — Uploaded files storage (static). (Hinglish: Uploaded files yahan store hote hain)

- Project root:
  - `server.js` — Entry point; applies global middleware, mounts routes (`/api/auth`), and starts the server. (Hinglish: Server yahin start hota hai)
  - `package.json` — Dependencies & scripts.

---

## Utilities (quick list)

- `backend/utils/generateOTP.js` — Returns a 6-digit random OTP string. (Used in: `backend/controllers/authController.js`)
- `backend/utils/generateToken.js` — Sign JWT and set HTTP-only cookie `jwt`. (Used in: `backend/controllers/authController.js`)
- `backend/utils/generateResetToken.js` — Generate secure random reset token. (Used in: `backend/controllers/authController.js`)
- `backend/utils/sendEmail.js` — Nodemailer/Brevo transport & send email helper. (Used in: `backend/controllers/authController.js`)

---

## Notes & environment variables

Set these variables in your `.env` (examples used in code):

```
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
JWT_COOKIE_EXPIRE=7d   # example
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_key
FROM_EMAIL=verified@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

(Hinglish: In env vars ko set karo warna DB/email/token kaam nahi karega)

## Quick developer notes

- Uploads are saved to `backend/uploads/` and the file path is stored in `Student.collegeId` or `Company.verificationDocument`. (Hinglish: Uploaded file ka path DB mein store hota hai)
- OTP documents auto-expire after 10 minutes (see `backend/models/OTP.js`). (Hinglish: OTP short-lived hai)
- Passwords are hashed in `User` model pre-save hook via `bcryptjs`. (Hinglish: Password secure tarike se store hota hai)
- JWT cookie is `httpOnly` and set by `backend/utils/generateToken.js`. (Hinglish: Cookie JavaScript se accessible nahi hai)

---

If you want, I can also:

- Add example `curl` and frontend request examples.
- Add a `.env.example` file with the required keys.

If you'd like me to commit this README into the repo, it's already created at `seribro-backend/README.md`.

---

Happy hacking — (Hinglish: Agar aur help chahiye toh batao, main aage badhkar sample requests ya `.env` bana dunga.)
