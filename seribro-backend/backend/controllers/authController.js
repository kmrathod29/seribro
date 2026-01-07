// controllers/authController.js (Hinglish: Authentication ke saare main logic yahan hain)

const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const OTP = require("../models/OTP");
const generateToken = require("../utils/generateToken");
const jwt = require('jsonwebtoken');
const generateResetToken = require("../utils/generateResetToken");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const axios = require('axios');
const path = require("path");
const fs = require("fs");

// Hinglish: Error handling ke liye ek utility function
const removeFileAndThrowError = (filePath, message, res, status = 400) => {
  if (filePath) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("File deletion error:", err);
    });
  }
  res.status(status);
  throw new Error(message);
};

// @desc    Register a new student
// @route   POST /api/auth/student/register
// @access  Public
const registerStudent = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log("Received student registration data:", req.body);

  // college is no longer required at signup
  if (!fullName || !email || !password) {
    return removeFileAndThrowError(
      null,
      "Please fill all required fields",
      res
    );
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return removeFileAndThrowError(null, "User already exists", res, 409);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create(
      [
        {
          email,
          password,
          role: "student",
          emailVerified: false,
        },
      ],
      { session }
    );

    const student = await Student.create(
      [
        {
          user: user[0]._id,
          fullName,
          // college can be provided later from profile
        },
      ],
      { session }
    );

    const otpCode = generateOTP();
    await OTP.findOneAndDelete({ email }, { session });
    await OTP.create([{ email, otp: otpCode }], { session });

    const emailMessage = `
     
    

<p>Namaste ${fullName},</p>

<p>
Thank you for registering with <strong>Seribro</strong>.
To verify your email address, please use the One-Time Password (OTP) below:
</p>

<p style="margin: 20px 0;">
  <span style="display: inline-block; padding: 12px 24px; font-size: 22px; font-weight: 600; letter-spacing: 2px; color: #1e3a8a; border: 1px solid #e5e7eb; border-radius: 6px;">
    ${otpCode}
  </span>
</p>

<p>
This OTP is valid for <strong>10 minutes</strong>.  
For security reasons, please do not share this code with anyone.
</p>

<p>
If you did not initiate this request, you can safely ignore this email.
</p>

<p>
Regards,<br />
<strong>Team Seribro</strong>
</p>

`;
    await sendEmail({
      email,
      subject: "Seribro: Email Verification OTP",
      message: emailMessage,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message:
        "Registration successful. OTP sent to your email for verification",
      userId: user[0]._id,
      email: user[0].email,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Student registration error:", error);
    removeFileAndThrowError(
      null,
      error.message || "Student registration failed",
      res,
      500
    );
  }
});

// @desc    Finalize student account creation after OTP signup verification
// @route   POST /api/auth/student/create-account
// @access  Public (but requires prior OTP verification)
const createStudentAccount = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("User already exists");
  }

  // Check OTP doc was verified for signup
  const otpDoc = await OTP.findOne({
    email,
    purpose: "signup",
    verified: true,
  });
  if (!otpDoc) {
    res.status(400);
    throw new Error(
      "OTP not verified for this email. Please verify OTP before creating account."
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create(
      [
        {
          email,
          password,
          role: "student",
          emailVerified: true,
        },
      ],
      { session }
    );

    const student = await Student.create(
      [
        {
          user: user[0]._id,
          fullName,
        },
      ],
      { session }
    );

    // Clean up OTP
    await OTP.deleteOne({ email }, { session });

    await session.commitTransaction();
    session.endSession();

    // Issue JWT and return user info
  // include student's fullName and email in token payload so frontend can show name immediately
  const studentRecord = student[0];
  const extras = { name: studentRecord.fullName, email: user[0].email };
  generateToken(res, user[0]._id, user[0].role, extras);
  // Also sign a token string to return so frontend can persist it in localStorage
  const token = jwt.sign({ userId: user[0]._id, role: user[0].role, ...extras }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_COOKIE_EXPIRE });

    res.status(201).json({
      message: "Account created and logged in",
      _id: user[0]._id,
      email: user[0].email,
      role: user[0].role,
      profileCompleted: false,
      token,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("createStudentAccount error:", error);
    res.status(500);
    throw new Error("Account creation failed");
  }
});

// @desc    Register a new company
// @route   POST /api/auth/company/register
// @access  Public
const registerCompany = asyncHandler(async (req, res) => {
  const { contactPerson, companyName, email, password } = req.body;
  console.log("Received company registration data:", req.body);
  const verificationDocumentPath = req.file ? req.file.path : null; // optional at signup

  // companyName and verification document are optional at signup; collect contactPerson, email, password
  if (!contactPerson || !email || !password) {
    return removeFileAndThrowError(
      verificationDocumentPath,
      "Please fill all required fields",
      res
    );
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return removeFileAndThrowError(
      verificationDocumentPath,
      "User already exists",
      res,
      409
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create(
      [
        {
          email,
          password,
          role: "company",
          emailVerified: false,
        },
      ],
      { session }
    );

    const companyPayload = {
      user: user[0]._id,
      contactPersonName: contactPerson,
    };
    if (companyName) companyPayload.companyName = companyName;
    if (verificationDocumentPath)
      companyPayload.verificationDocument = verificationDocumentPath;

    const company = await Company.create([companyPayload], { session });

    const otpCode = generateOTP();
    await OTP.findOneAndDelete({ email }, { session });
    await OTP.create([{ email, otp: otpCode }], { session });

    const emailMessage = `
      <p>Namaste ${contactPerson},</p>
      <p>Seribro mein register karne ke liye shukriya. Aapka One-Time Password (OTP) yeh hai:</p>
      <h2 style="color: #1e3a8a; font-size: 24px; font-weight: bold;">${otpCode}</h2>
      <p>Yeh OTP 10 minutes ke liye valid hai. Agar aapne yeh request nahi ki hai, toh is email ko ignore karein.</p>
      <p>Dhanyawad,<br>Team Seribro</p>
    `;
    await sendEmail({
      email,
      subject: "Seribro: Email Verification OTP",
      message: emailMessage,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message:
        "Registration successful. OTP sent to your email for verification",
      userId: user[0]._id,
      email: user[0].email,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Company registration error:", error);
    removeFileAndThrowError(
      verificationDocumentPath,
      error.message || "Company registration failed",
      res,
      500
    );
  }
});

// @desc    Finalize company account creation after OTP signup verification
// @route   POST /api/auth/company/create-account
// @access  Public (but requires prior OTP verification)
const createCompanyAccount = asyncHandler(async (req, res) => {
  const { contactPerson, companyName, email, password } = req.body;

  if (!contactPerson || !email || !password) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("User already exists");
  }

  // Check OTP doc was verified for signup
  const otpDoc = await OTP.findOne({
    email,
    purpose: "signup",
    verified: true,
  });
  if (!otpDoc) {
    res.status(400);
    throw new Error(
      "OTP not verified for this email. Please verify OTP before creating account."
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create(
      [
        {
          email,
          password,
          role: "company",
          emailVerified: true,
        },
      ],
      { session }
    );

    const companyPayload = {
      user: user[0]._id,
      contactPersonName: contactPerson,
    };
    if (companyName) companyPayload.companyName = companyName;

    const company = await Company.create([companyPayload], { session });

    // Clean up OTP
    await OTP.deleteOne({ email }, { session });

    await session.commitTransaction();
    session.endSession();

    // Issue JWT and return user info (include contact person name/email)
    const companyRecord = company[0];
    const extras = { name: companyRecord.contactPersonName || contactPerson || '', email: user[0].email };
    generateToken(res, user[0]._id, user[0].role, extras);
    const token = jwt.sign({ userId: user[0]._id, role: user[0].role, ...extras }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_COOKIE_EXPIRE });

    res.status(201).json({
      message: "Account created and logged in",
      _id: user[0]._id,
      email: user[0].email,
      role: user[0].role,
      profileCompleted: false,
      token,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("createCompanyAccount error:", error);
    res.status(500);
    throw new Error("Account creation failed");
  }
});

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide an email");
  }

  // purpose: 'signup' or 'verify' (login). Default to 'verify'.
  const purpose = req.body.purpose === "signup" ? "signup" : "verify";
  const user = await User.findOne({ email });

  // If this is a login/verify OTP request, the user must exist and be unverified
  if (purpose === "verify") {
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.emailVerified) {
      res.status(400);
      throw new Error("Email is already verified");
    }
  }

  // If this is a signup OTP request, user must NOT already exist
  if (purpose === "signup") {
    if (user) {
      res.status(409);
      throw new Error("User already exists");
    }
  }

  const otpCode = generateOTP();
  // For signup, frontend will indicate purpose='signup' when requesting OTP

  await OTP.findOneAndDelete({ email });
  await OTP.create({ email, otp: otpCode, purpose });
  // const purpose = req.body.purpose === 'signup' ? 'signup' : 'verify';
    // <p>Namaste ${fullName},</p>

  const emailMessage = `
   <p>Namaste,</p>

<p>
Thank you for registering with <strong>Seribro</strong>.
To verify your email address, please use the One-Time Password (OTP) below:
</p>

<p style="margin: 20px 0;">
  <span style="display: inline-block; padding: 12px 24px; font-size: 22px; font-weight: 600; letter-spacing: 2px; color: #1e3a8a; border: 1px solid #e5e7eb; border-radius: 6px;">
    ${otpCode}
  </span>
</p>

<p>
This OTP is valid for <strong>10 minutes</strong>.  
For security reasons, please do not share this code with anyone.
</p>

<p>
If you did not initiate this request, you can safely ignore this email.
</p>

<p>
Regards,<br />
<strong>Team Seribro</strong>
</p>

  `;
  await sendEmail({
    email,
    subject: "Seribro: Email Verification OTP",
    message: emailMessage,
  });

  res.json({ message: "New OTP sent to your email" });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
// Verify OTP: supports both 'verify' (login flow) and 'signup' (pre-account creation) purposes.
// For purpose='verify' (default) it behaves as before: marks user emailVerified and issues token.
// For purpose='signup' it only marks the OTP document as verified={true} so frontend can proceed
// to final account creation (which will actually create the User and Student/Company records).
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, purpose } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error("Please provide email and OTP");
  }

  const otpDoc = await OTP.findOne({ email, otp });
  if (!otpDoc) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // If this is a signup OTP verification, mark OTP doc as verified but DO NOT create user yet.
  if (otpDoc.purpose === "signup" || purpose === "signup") {
    otpDoc.verified = true;
    await otpDoc.save();
    return res
      .status(200)
      .json({ message: "OTP verified for signup", email, purpose: "signup" });
  }

  // Default: login/verification flow where user exists. Proceed to mark user's email as verified and login.
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  console.log("� OTP verified for:", email);

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { emailVerified: true },
    { new: true }
  );

  await OTP.deleteOne({ email });

  // Issue auth token (same behavior as login)
  generateToken(res, updatedUser._id, updatedUser.role);

  res.status(200).json({
    message: "Email verified and logged in successfully",
    emailVerified: true,
    _id: updatedUser._id,
    email: updatedUser.email,
    role: updatedUser.role,
    profileCompleted: updatedUser.profileCompleted || false,
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  // If user exists but has no password (OAuth-only account), return explicit message
  if (user && !user.password) {
    res.status(401);
    throw new Error("This account was created using Google. Please login with Google or set a password.");
  }

  if (user && (await user.matchPassword(password))) {
    if (!user.emailVerified || user.emailVerified !== true) {
      console.log("🔐 Login attempt with unverified email:", {
        email,
        emailVerified: user.emailVerified,
        type: typeof user.emailVerified,
      });

      const otpCode = generateOTP();
      await OTP.findOneAndDelete({ email });
      await OTP.create({ email, otp: otpCode });

      const emailMessage = `
        <p>Namaste,</p>
        <p>Aapne login karne ki koshish ki hai, lekin aapka email verified nahi hai. Aapka One-Time Password (OTP) yeh hai:</p>
        <h2 style="color: #1e3a8a; font-size: 24px; font-weight: bold;">${otpCode}</h2>
        <p>Yeh OTP 10 minutes ke liye valid hai.</p>
        <p>Dhanyawad,<br>Team Seribro</p>
      `;
      await sendEmail({
        email,
        subject: "Seribro: Email Verification OTP",
        message: emailMessage,
      });

      res.status(202).json({
        message:
          "Email not verified. A new OTP has been sent to your email for verification.",
        email: user.email,
        otpSent: true,
      });
      return;
    }

    console.log("✅ Login successful for verified email:", {
      email,
      emailVerified: user.emailVerified,
    });

    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || "Unknown";

    user.devices.push({
      userAgent,
      ip,
      loggedInAt: new Date(),
    });

    if (user.devices.length > 10) {
      user.devices.shift();
    }

    await user.save();

    // Determine a display name from associated profile records (if any)
    let displayName = null;
    if (user.role === 'student') {
      const srec = await Student.findOne({ user: user._id });
      displayName = srec?.fullName || null;
    } else if (user.role === 'company') {
      const crec = await Company.findOne({ user: user._id });
      displayName = crec?.contactPersonName || null;
    }
    const extras = { name: displayName || '', email: user.email };
    generateToken(res, user._id, user.role, extras);
    const token = jwt.sign({ userId: user._id, role: user.role, ...extras }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_COOKIE_EXPIRE });

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profileCompleted: user.profileCompleted,
      message: "Login successful",
      token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// ---------------- Google OAuth (manual, no Passport) ----------------
// Redirect user to Google's OAuth consent screen
const googleAuthRedirect = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const backendBase =
    process.env.BACKEND_URL ||
    process.env.VITE_BACKEND_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    (process.env.NODE_ENV !== 'production' ? 'http://localhost:7000' : null);
  if (!backendBase) {
    console.error('Google OAuth: BACKEND_URL is not set (NODE_ENV=production). Aborting.');
    return res.status(500).json({ message: 'Server misconfiguration: BACKEND_URL is required for OAuth in production' });
  }
  const redirectUri = `${backendBase.replace(/\/$/, '')}/auth/google/callback`;
  console.log('Google OAuth redirectUri:', redirectUri);
  const scope = encodeURIComponent('openid email profile');
  // Allow frontend to pass a desired role via ?role=student|company (sent as state to Google and returned on callback)
  const role = req.query.role || req.query.state || '';
  // Sanitize role to allowed enums to avoid passing arbitrary values
  const allowedRoles = ['student', 'company', 'admin'];
  const safeRole = allowedRoles.includes(role) ? role : '';
  const stateParam = safeRole ? `&state=${encodeURIComponent(safeRole)}` : '';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=online&prompt=select_account${stateParam}`;
  // Redirect browser to Google
  res.redirect(authUrl);
});

// Callback handler: exchange code -> tokens -> get profile -> handle user linking/creation -> issue JWT
const googleAuthCallback = asyncHandler(async (req, res) => {
  const code = req.query.code;
  if (!code) {
    res.status(400);
    throw new Error('Missing code from Google');
  }

  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const backendBase =
    process.env.BACKEND_URL ||
    process.env.VITE_BACKEND_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    (process.env.NODE_ENV !== 'production' ? 'http://localhost:7000' : null);
  if (!backendBase) {
    console.error('Google OAuth: BACKEND_URL is not set (NODE_ENV=production). Aborting.');
    res.status(500);
    throw new Error('Server misconfiguration: BACKEND_URL is required for OAuth in production');
  }
  const redirectUri = `${backendBase.replace(/\/$/, '')}/auth/google/callback`;

  // Exchange code for tokens
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('redirect_uri', redirectUri);
  params.append('grant_type', 'authorization_code');

  const tokenResp = await axios.post(tokenEndpoint, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const accessToken = tokenResp.data.access_token;
  if (!accessToken) {
    res.status(400);
    throw new Error('Could not obtain access token from Google');
  }

  // Fetch profile
  const profileResp = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = profileResp.data;

  // Identify user by email only
  const email = profile.email && profile.email.toLowerCase();
  if (!email) {
    res.status(400);
    throw new Error('Google account did not provide an email');
  }

  // Find user (include password for linking decisions)
  let user = await User.findOne({ email }).select('+password');
  // If Google redirect included a state param (we used it to pass role), prefer it when creating new users
  const requestedRole = req.query.state || req.query.role || null;

  if (!user) {
    // Create new user using Google profile
    const role = requestedRole || 'student'; // use requested role if provided
    
    // Use transaction to ensure User and Student/Company are created atomically
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      user = await User.create([{
        email,
        password: null, // explicitly null for OAuth accounts
        role,
        emailVerified: true,
        googleId: profile.id,
        authProvider: ['google'],
      }], { session });
      user = user[0]; // extract from array returned by create with session
      
      // Create Student or Company record based on role
      if (role === 'student') {
        await Student.create([{
          user: user._id,
          fullName: profile.name || email.split('@')[0],
        }], { session });
      } else if (role === 'company') {
        await Company.create([{
          user: user._id,
          contactPerson: profile.name || email.split('@')[0],
        }], { session });
      }
      
      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Google OAuth user creation failed:', error);
      res.status(500);
      throw new Error('Failed to create user account');
    }
  } else {
    // User exists
    // If user exists with password (email/password account) and googleId not set, link accounts
    if (user.password && !user.googleId) {
      user.googleId = profile.id;
      user.authProvider = Array.from(new Set([...(user.authProvider || []), 'google']));
      await user.save();
    }
    // If user already has google linked or is oauth-only, nothing to change
    
    // Ensure Student/Company record exists for this user
    if (user.role === 'student') {
      const studentExists = await Student.findOne({ user: user._id });
      if (!studentExists) {
        await Student.create({
          user: user._id,
          fullName: profile.name || email.split('@')[0],
        });
      }
    } else if (user.role === 'company') {
      const companyExists = await Company.findOne({ user: user._id });
      if (!companyExists) {
        await Company.create({
          user: user._id,
          contactPerson: profile.name || email.split('@')[0],
        });
      }
    }
  }

  // Determine display name for token payload (prefer Google profile name, then DB records)
  let displayName = profile.name || null;
  if (!displayName) {
    if (user.role === 'student') {
      const srec = await Student.findOne({ user: user._id });
      displayName = srec?.fullName || email.split('@')[0];
    } else if (user.role === 'company') {
      const crec = await Company.findOne({ user: user._id });
      displayName = crec?.contactPersonName || email.split('@')[0];
    } else {
      displayName = email.split('@')[0];
    }
  }

  const extras = { name: displayName, email };
  // Issue JWT cookie using existing utility (include name/email)
  generateToken(res, user._id, user.role, extras);
  // Also sign a token string (same payload/expiry) so frontend can persist it in localStorage
  const token = jwt.sign({ userId: user._id, role: user.role, ...extras }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_COOKIE_EXPIRE });

  // Redirect to dedicated frontend success page which will persist the token and then navigate
  const frontendBase =
    process.env.FRONTEND_URL ||
    process.env.VITE_FRONTEND_URL ||
    process.env.CLIENT_URL ||
    (process.env.NODE_ENV !== 'production' ? 'http://localhost:5173' : null);
  if (!frontendBase) {
    console.error('Google OAuth: FRONTEND_URL is not set (NODE_ENV=production). Aborting.');
    return res.status(500).json({ message: 'Server misconfiguration: FRONTEND_URL is required in production' });
  }
  console.log('Google OAuth final redirect to frontend:', `${frontendBase.replace(/\/$/, '')}/auth/google/success`);
  return res.redirect(`${frontendBase.replace(/\/$/, '')}/auth/google/success?token=${encodeURIComponent(token)}`);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out" });
});

// @desc    Forgot Password - Send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide an email");
  }

  console.log("🔔 Forgot password requested for:", email);

  const user = await User.findOne({ email });

  if (user)
    console.log("🔎 User found for forgot-password:", {
      email: user.email,
      _id: user._id,
    });

  if (!user) {
    return res.status(200).json({
      message: "Password reset link sent to your email (if user exists)",
    });
  }

  const resetToken = generateResetToken();

  // log masked token for debugging (do not expose full token in production logs)
  console.log(
    "🔐 Generated reset token (masked):",
    `${String(resetToken).slice(0, 6)}...`
  );

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  // Use FRONTEND_URL env var so the reset link points to the correct frontend app.
  // Fallback to Vite default dev server port where the frontend likely runs.
  const frontendBase =
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173";
  const resetURL = `${frontendBase.replace(
    /\/$/,
    ""
  )}/reset-password?token=${resetToken}`;

  // Email message includes both a clickable button and the raw link so users can copy-paste if needed.
  const emailMessage = `
    <p>Namaste ${user.email},</p>
    <p>Aapne password reset karne ki request ki hai. Kripya is link par click karein:</p>
    <h3 style="margin: 20px 0;">
      <a href="${resetURL}" style="color: #ffffff; background-color: #1e3a8a; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
    </h3>
    <p>Yadi button kaam na kare, toh yeh link copy-paste karein:</p>
    <p><a href="${resetURL}">${resetURL}</a></p>
    <p>Yeh link sirf 15 minutes ke liye valid hai. Agar aapne yeh request nahi ki hai, toh is email ko ignore karein.</p>
    <p>Dhanyawad,<br>Team Seribro</p>
  `;

  try {
    console.log("✉️ Sending password reset email to:", user.email);
    await sendEmail({
      email: user.email,
      subject: "Seribro: Password Reset Request",
      message: emailMessage,
    });

    console.log("✅ sendEmail resolved for forgot-password for:", user.email);
    res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.error("Forgot Password Email Error:", error);
    res.status(500);
    throw new Error("Email could not be sent. Please try again later.");
  }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error("Please provide token and new password");
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    message: "Password reset successful, please log in again",
  });
});

// ✅ FIXED: Move module.exports to the END after all functions are defined
module.exports = {
  registerStudent,
  registerCompany,
  sendOtp,
  verifyOtp,
  createStudentAccount,
  createCompanyAccount,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  googleAuthRedirect,
  googleAuthCallback,
};
