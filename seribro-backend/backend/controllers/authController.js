// controllers/authController.js (Hinglish: Authentication ke saare main logic yahan hain)

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const OTP = require('../models/OTP');
const generateToken = require('../utils/generateToken');
const generateResetToken = require('../utils/generateResetToken');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const path = require('path');
const fs = require('fs');

// Hinglish: Error handling ke liye ek utility function
const removeFileAndThrowError = (filePath, message, res, status = 400) => {
  if (filePath) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('File deletion error:', err);
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
  console.log('Received student registration data:', req.body);

  // college is no longer required at signup
  if (!fullName || !email || !password) {
    return removeFileAndThrowError(null, 'Please fill all required fields', res);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return removeFileAndThrowError(null, 'User already exists', res, 409);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{
      email,
      password,
      role: 'student',
      emailVerified: false,
    }], { session });

    const student = await Student.create([{
      user: user[0]._id,
      fullName,
      // college can be provided later from profile
    }], { session });

    const otpCode = generateOTP();
    await OTP.findOneAndDelete({ email }, { session });
    await OTP.create([{ email, otp: otpCode }], { session });

    const emailMessage = `
      <p>Namaste ${fullName},</p>
      <p>Seribro mein register karne ke liye shukriya. Aapka One-Time Password (OTP) yeh hai:</p>
      <h2 style="color: #1e3a8a; font-size: 24px; font-weight: bold;">${otpCode}</h2>
      <p>Yeh OTP 10 minutes ke liye valid hai. Agar aapne yeh request nahi ki hai, toh is email ko ignore karein.</p>
      <p>Dhanyawad,<br>Team Seribro</p>
    `;
    await sendEmail({
      email,
      subject: 'Seribro: Email Verification OTP',
      message: emailMessage,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Registration successful. OTP sent to your email for verification',
      userId: user[0]._id,
      email: user[0].email,
    });

    } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Student registration error:', error);
    removeFileAndThrowError(null, error.message || 'Student registration failed', res, 500);
  }
});

// @desc    Finalize student account creation after OTP signup verification
// @route   POST /api/auth/student/create-account
// @access  Public (but requires prior OTP verification)
const createStudentAccount = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('User already exists');
  }

  // Check OTP doc was verified for signup
  const otpDoc = await OTP.findOne({ email, purpose: 'signup', verified: true });
  if (!otpDoc) {
    res.status(400);
    throw new Error('OTP not verified for this email. Please verify OTP before creating account.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{
      email,
      password,
      role: 'student',
      emailVerified: true,
    }], { session });

    const student = await Student.create([{
      user: user[0]._id,
      fullName,
    }], { session });

    // Clean up OTP
    await OTP.deleteOne({ email }, { session });

    await session.commitTransaction();
    session.endSession();

    // Issue JWT and return user info
    generateToken(res, user[0]._id, user[0].role);

    res.status(201).json({
      message: 'Account created and logged in',
      _id: user[0]._id,
      email: user[0].email,
      role: user[0].role,
      profileCompleted: false,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('createStudentAccount error:', error);
    res.status(500);
    throw new Error('Account creation failed');
  }
});

// @desc    Register a new company
// @route   POST /api/auth/company/register
// @access  Public
const registerCompany = asyncHandler(async (req, res) => {
  const { contactPerson, companyName, email, password } = req.body;
  console.log('Received company registration data:', req.body);
  const verificationDocumentPath = req.file ? req.file.path : null; // optional at signup

  // companyName and verification document are optional at signup; collect contactPerson, email, password
  if (!contactPerson || !email || !password) {
    return removeFileAndThrowError(verificationDocumentPath, 'Please fill all required fields', res);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return removeFileAndThrowError(verificationDocumentPath, 'User already exists', res, 409);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{
      email,
      password,
      role: 'company',
      emailVerified: false,
    }], { session });

    const companyPayload = {
      user: user[0]._id,
      contactPersonName: contactPerson,
    };
    if (companyName) companyPayload.companyName = companyName;
    if (verificationDocumentPath) companyPayload.verificationDocument = verificationDocumentPath;

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
      subject: 'Seribro: Email Verification OTP',
      message: emailMessage,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Registration successful. OTP sent to your email for verification',
      userId: user[0]._id,
      email: user[0].email,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Company registration error:', error);
    removeFileAndThrowError(verificationDocumentPath, error.message || 'Company registration failed', res, 500);
  }
});

// @desc    Finalize company account creation after OTP signup verification
// @route   POST /api/auth/company/create-account
// @access  Public (but requires prior OTP verification)
const createCompanyAccount = asyncHandler(async (req, res) => {
  const { contactPerson, companyName, email, password } = req.body;

  if (!contactPerson || !email || !password) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('User already exists');
  }

  // Check OTP doc was verified for signup
  const otpDoc = await OTP.findOne({ email, purpose: 'signup', verified: true });
  if (!otpDoc) {
    res.status(400);
    throw new Error('OTP not verified for this email. Please verify OTP before creating account.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{
      email,
      password,
      role: 'company',
      emailVerified: true,
    }], { session });

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

    // Issue JWT and return user info
    generateToken(res, user[0]._id, user[0].role);

    res.status(201).json({
      message: 'Account created and logged in',
      _id: user[0]._id,
      email: user[0].email,
      role: user[0].role,
      profileCompleted: false,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('createCompanyAccount error:', error);
    res.status(500);
    throw new Error('Account creation failed');
  }
});

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }

  // purpose: 'signup' or 'verify' (login). Default to 'verify'.
  const purpose = req.body.purpose === 'signup' ? 'signup' : 'verify';
  const user = await User.findOne({ email });

  // If this is a login/verify OTP request, the user must exist and be unverified
  if (purpose === 'verify') {
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    if (user.emailVerified) {
      res.status(400);
      throw new Error('Email is already verified');
    }
  }

  // If this is a signup OTP request, user must NOT already exist
  if (purpose === 'signup') {
    if (user) {
      res.status(409);
      throw new Error('User already exists');
    }
  }

  const otpCode = generateOTP();
  // For signup, frontend will indicate purpose='signup' when requesting OTP
  
  await OTP.findOneAndDelete({ email });
  await OTP.create({ email, otp: otpCode, purpose });
  // const purpose = req.body.purpose === 'signup' ? 'signup' : 'verify';

  const emailMessage = `
    <p>Namaste,</p>
    <p>Aapka One-Time Password (OTP) yeh hai:</p>
    <h2 style="color: #1e3a8a; font-size: 24px; font-weight: bold;">${otpCode}</h2>
    <p>Yeh OTP 10 minutes ke liye valid hai.</p>
    <p>Dhanyawad,<br>Team Seribro</p>
  `;
  await sendEmail({
    email,
    subject: 'Seribro: Email Verification OTP',
    message: emailMessage,
  });

  res.json({ message: 'New OTP sent to your email' });
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
    throw new Error('Please provide email and OTP');
  }

  const otpDoc = await OTP.findOne({ email, otp });
  if (!otpDoc) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // If this is a signup OTP verification, mark OTP doc as verified but DO NOT create user yet.
  if (otpDoc.purpose === 'signup' || purpose === 'signup') {
    otpDoc.verified = true;
    await otpDoc.save();
    return res.status(200).json({ message: 'OTP verified for signup', email, purpose: 'signup' });
  }

  // Default: login/verification flow where user exists. Proceed to mark user's email as verified and login.
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  console.log('� OTP verified for:', email);

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { emailVerified: true },
    { new: true }
  );

  await OTP.deleteOne({ email });

  // Issue auth token (same behavior as login)
  generateToken(res, updatedUser._id, updatedUser.role);

  res.status(200).json({
    message: 'Email verified and logged in successfully',
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

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (!user.emailVerified || user.emailVerified !== true) {
      console.log('🔐 Login attempt with unverified email:', {
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
        subject: 'Seribro: Email Verification OTP',
        message: emailMessage,
      });

      res.status(202).json({
        message: 'Email not verified. A new OTP has been sent to your email for verification.',
        email: user.email,
        otpSent: true,
      });
      return;
    }

    console.log('✅ Login successful for verified email:', {
      email,
      emailVerified: user.emailVerified,
    });

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || 'Unknown';

    user.devices.push({
      userAgent,
      ip,
      loggedInAt: new Date(),
    });

    if (user.devices.length > 10) {
      user.devices.shift();
    }

    await user.save();

    generateToken(res, user._id, user.role);

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profileCompleted: user.profileCompleted,
      message: 'Login successful',
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'User logged out' });
});

// @desc    Forgot Password - Send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }

  console.log('🔔 Forgot password requested for:', email);

  const user = await User.findOne({ email });

  if (user) console.log('🔎 User found for forgot-password:', { email: user.email, _id: user._id });

  if (!user) {
    return res.status(200).json({
      message: 'Password reset link sent to your email (if user exists)',
    });
  }

  const resetToken = generateResetToken();

  // log masked token for debugging (do not expose full token in production logs)
  console.log('🔐 Generated reset token (masked):', `${String(resetToken).slice(0,6)}...`);

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  // Use FRONTEND_URL env var so the reset link points to the correct frontend app.
  // Fallback to Vite default dev server port where the frontend likely runs.
  const frontendBase = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  const resetURL = `${frontendBase.replace(/\/$/, '')}/reset-password?token=${resetToken}`;

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
    console.log('✉️ Sending password reset email to:', user.email);
    await sendEmail({
      email: user.email,
      subject: 'Seribro: Password Reset Request',
      message: emailMessage,
    });

    console.log('✅ sendEmail resolved for forgot-password for:', user.email);
    res.status(200).json({
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.error('Forgot Password Email Error:', error);
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error('Please provide token and new password');
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    message: 'Password reset successful, please log in again',
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
};