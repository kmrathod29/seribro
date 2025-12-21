import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Chrome,
  GraduationCap,
  Briefcase,
  Home,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// import { saveUserToCookie } from "../../utils/authUtils.js";
import API from "../../apis/api.js";
// saveUserToCookie imported in case we need to persist user after final account creation
import { saveUserToCookie } from "../../utils/authUtils.js";

const Signup = () => {
  const [userType, setUserType] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  // Replace single shared loading state with explicit states per action
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [otpData, setOtpData] = useState({
    otp: '',
    showOtpField: false,
    otpSent: false,
  });

  const [otpVerified, setOtpVerified] = useState(false);

  const [studentData, setStudentData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [companyData, setCompanyData] = useState({
    contactPerson: "",
    email: "",
    password: "",
    // verificationDoc removed from signup - optional later in profile
  });

  // -------------------- Handlers --------------------
  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleCompanyChange = (e) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
    setError("");
  };

  // File uploads are not required during signup anymore. Companies can upload verification
  // documents later from their profile. Removed handler to keep signup flow simple.

  const validateStudentForm = () => {
    if (
      !studentData.fullName ||
      !studentData.email ||
      !studentData.password
    ) {
      setError("Please fill in all required fields");
      return false;
    }
    if (studentData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const validateCompanyForm = () => {
    if (
      !companyData.contactPerson ||
      !companyData.email ||
      !companyData.password
    ) {
      setError("Please fill in all required fields");
      return false;
    }
    if (companyData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // -------------------- Submit --------------------
  const handleSubmit = async () => {
    // This action sends OTP (PHASE 1)
    setIsSendingOtp(true);
    setError("");

    try {
      // Validate form
      if (userType === "student" && !validateStudentForm()) {
        setIsSendingOtp(false);
        return;
      }
      if (userType === "company" && !validateCompanyForm()) {
        setIsSendingOtp(false);
        return;
      }

      // Prepare form data
      const formData = new FormData();
      if (userType === "student") {
        // ✅ FIXED: Send 'fullName' instead of 'name'
        formData.append("fullName", studentData.fullName);
        formData.append("email", studentData.email);
        formData.append("password", studentData.password);
      } else {
        // ✅ FIXED: Field names now match backend
        formData.append("contactPerson", companyData.contactPerson);
        formData.append("email", companyData.email);
        formData.append("password", companyData.password);
      }

      // ---- PHASE 1: SEND OTP (do NOT create user) ----
      // We will call the /send-otp endpoint with purpose='signup'. This sends the OTP email
      // but does NOT create a User. Account creation is a separate step after OTP verification.
  await API.post('/send-otp', { email: userType === 'student' ? studentData.email : companyData.email, purpose: 'signup' });

      // Show OTP UI so user can verify
      setOtpData({ ...otpData, showOtpField: true, otpSent: true });
  setIsSendingOtp(false);
      setError('');
      alert('OTP sent to your email. Enter it below to verify, then click Create Account.');
      return; // stop here — wait for OTP verification step

    } catch (err) {
      console.error("Signup error:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Send or resend OTP for the given email (registration already sends on server, but allow resend)
  const handleSendOtp = async () => {
    const email = userType === 'student' ? studentData.email : companyData.email;
    if (!email) {
      setError('Please enter your email to send OTP');
      return;
    }
    // Sending (or resending) OTP
    setIsSendingOtp(true);
    setError('');
    try {
      await API.post('/send-otp', { email });
      setOtpData(prev => ({ ...prev, otpSent: true, showOtpField: true }));
      alert('OTP sent to ' + email);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = userType === 'student' ? studentData.email : companyData.email;
    if (!email || !otpData.otp) {
      setError('Please provide email and OTP');
      return;
    }
    // Verifying OTP
    setIsVerifyingOtp(true);
    setError('');
    try {
      // verify-otp now issues JWT (cookie) and returns user info
  await API.post('/verify-otp', { email, otp: otpData.otp, purpose: 'signup' });
      // Save minimal user info to cookie so client-side UI knows user is logged in
      // (backend issues httpOnly JWT cookie via generateToken)
      // For signup-purpose verification we only get back a confirmation. Mark local flag so
      // Create Account button becomes enabled.
      setOtpVerified(true);
      alert('OTP verified. Now click Create Account to finish sign up.');
      // On success, redirect user to their dashboard (auto-logged in)
      // Do not auto-login here for signup OTP. Final account creation will perform creation
      // and login (generate JWT) when user clicks Create Account.
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // -------------------- Create Account (PHASE 3) --------------------
  // Requires that an OTP for purpose='signup' was verified (server-side flag).
  // This call will create the User + Student/Company records, set emailVerified=true,
  // issue the JWT (httpOnly cookie) and return the user info.
  const handleCreateAccount = async () => {
    // Creating account
    setIsCreatingAccount(true);
    setError('');
    try {
      const payload = userType === 'student'
        ? { fullName: studentData.fullName, email: studentData.email, password: studentData.password }
        : { contactPerson: companyData.contactPerson, companyName: companyData.companyName, email: companyData.email, password: companyData.password };

      const endpoint = userType === 'student' ? '/student/create-account' : '/company/create-account';
      const res = await API.post(endpoint, payload);

      // Save minimal user info (frontend visible) and navigate to dashboard
      saveUserToCookie({ _id: res.data._id, email: res.data.email, role: res.data.role });
      const dashboard = res.data.role === 'student' ? '/student/dashboard' : res.data.role === 'company' ? '/company/dashboard' : '/';
      navigate(dashboard);
    } catch (err) {
      setError(err.response?.data?.message || 'Account creation failed');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // -------------------- UI --------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-navy/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-navy/5 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-navy hover:text-primary transition-colors duration-300 mb-4 group animate-fade-in-down"
        >
          <Home
            size={18}
            className="transform group-hover:-translate-x-1 transition-transform duration-300"
          />
          <span className="font-semibold text-sm">Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img
              src="/seribro_new_logo.png"
              alt="Seribro"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl font-black text-navy">Seribro</h1>
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Join Seribro</h2>
          <p className="text-gray-600">Create an account to get started</p>
        </div>

        {/* User Type Toggle */}
        <div className="bg-gray-100 p-1.5 rounded-xl mb-6 flex animate-fade-in-up animation-delay-200">
          <button
            onClick={() => setUserType("student")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
              userType === "student"
                ? "bg-white text-navy shadow-md"
                : "text-gray-600 hover:text-navy"
            }`}
          >
            <GraduationCap size={18} />
            <span>Student</span>
          </button>
          <button
            onClick={() => setUserType("company")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
              userType === "company"
                ? "bg-white text-navy shadow-md"
                : "text-gray-600 hover:text-navy"
            }`}
          >
            <Briefcase size={18} />
            <span>Company / Business</span>
          </button>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fade-in-up animation-delay-400">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Student Form */}
          {userType === 'student' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={studentData.fullName}
                    onChange={handleStudentChange}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                    disabled={isCreatingAccount}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={studentData.email}
                    onChange={handleStudentChange}
                    placeholder="student@college.edu"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                    disabled={isCreatingAccount}
                  />
                </div>
              </div>

              {/* College/university field removed from signup — students can update later in profile */}

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={studentData.password}
                    onChange={handleStudentChange}
                    placeholder="Create a strong password"
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                    disabled={isCreatingAccount}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-navy transition-colors disabled:opacity-50"
                    disabled={isCreatingAccount}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Company Form */}
          {userType === 'company' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="contactPerson"
                    value={companyData.contactPerson}
                    onChange={handleCompanyChange}
                    placeholder="Jane Smith"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                    disabled={isCreatingAccount}
                  />
                </div>
              </div>

              {/* Company Name removed from signup flow - companies may add this later in their profile */}

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={companyData.email}
                    onChange={handleCompanyChange}
                    placeholder="hr@company.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                    disabled={isCreatingAccount}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={companyData.password}
                    onChange={handleCompanyChange}
                    placeholder="Create a strong password"
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                    disabled={isCreatingAccount}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-navy transition-colors disabled:opacity-50"
                    disabled={isCreatingAccount}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Verification document removed from signup UI - companies can add this later in their profile */}
            </div>
          )}

          {/*
            OTP Section: show verification UI ONLY after OTP has been sent.
            - `otpData.otpSent` === true => show OTP input, Verify button, and Resend link-style button
            - This ensures the original 'Send OTP' (primary form action) is hidden after send
          */}
          {otpData.otpSent && (
            <div className="space-y-3 border-t pt-4 border-gray-100">
              <p className="text-sm text-gray-600 font-medium">
                We've sent an OTP to your email. Enter it below to verify and continue.
              </p>
              <div className="flex items-center space-x-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    name="otp"
                    value={otpData.otp}
                    onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                    disabled={isCreatingAccount}
                  />
                </div>

                {/* Verify - primary action for OTP area */}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || !(userType === 'student' ? studentData.email : companyData.email)}
                  className={`py-2.5 px-4 rounded-lg font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 ${isVerifyingOtp ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                </button>

                {/* Resend - link / secondary style */}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="py-2 px-3 text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {isSendingOtp ? 'Resending...' : 'Resend'}
                </button>
              </div>
            </div>
          )}

          {/* Send OTP Button (PHASE 1)
              - Visible ONLY before OTP is sent (otpData.otpSent === false)
              - Content-width, secondary appearance (not a full-width primary CTA)
          */}
          {!otpData.otpSent && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSendingOtp || !(userType === 'student' ? (studentData.fullName && studentData.email && studentData.password.length >= 6) : (companyData.contactPerson && companyData.email && companyData.password.length >= 6))}
                className={`inline-flex items-center gap-2 py-2 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${isSendingOtp ? 'opacity-70 cursor-wait' : 'bg-white hover:bg-primary/5'} border border-primary text-primary`}
                style={{ width: 'fit-content' }}
              >
                <span>{isSendingOtp ? 'Sending OTP...' : 'Send OTP'}</span>
                {!isSendingOtp && <ArrowRight size={16} />}
              </button>
            </div>
          )}

          {/* Create Account Button (PHASE 3) - enabled only after OTP is verified */}
          {/* Create Account - primary CTA
              - Disabled and looks clearly disabled until otpVerified === true
              - Becomes strong brand color once otpVerified
          */}
          <button
            type="button"
            onClick={handleCreateAccount}
            disabled={!otpVerified || isCreatingAccount}
            className={`w-full relative py-3.5 rounded-xl font-bold text-base text-white overflow-hidden shadow-lg transition-all duration-200 transform hover:scale-[1.01] mt-4 ${!otpVerified ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : (isCreatingAccount ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700')}`}
          >
            <span className="relative z-10">{isCreatingAccount ? 'Creating account...' : 'Create Account'}</span>
          </button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-primary hover:text-primary-dark transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;