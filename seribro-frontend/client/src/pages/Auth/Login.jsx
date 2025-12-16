// src/pages/Auth/Login.jsx - DEBUG VERSION
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, Github, Linkedin, Home, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../apis/api.js';
import { saveUserToCookie } from '../../utils/authUtils';

const Login = () => {
  const [userType, setUserType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [otpData, setOtpData] = useState({
    otp: '',
    showOtpField: false,
    otpSent: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOtpChange = (e) => {
    setOtpData({ ...otpData, otp: e.target.value });
    setError('');
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email to send OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      console.log('📧 Sending OTP to:', formData.email);
      console.log('📡 API URL:', API.defaults.baseURL + '/send-otp');
      
      const response = await API.post('/send-otp', { email: formData.email });
      console.log('✅ OTP Send Response:', response.data);
      setOtpData({ ...otpData, showOtpField: true, otpSent: true });
      alert(response.data.message);
    } catch (err) {
      console.error('❌ Send OTP Error - Full:', err);
      console.error('❌ Response:', err.response);
      console.error('❌ Response Data:', err.response?.data);
      console.error('❌ Status:', err.response?.status);
      
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.email || !otpData.otp) {
      setError('Please enter email and OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      console.log('🔐 Verifying OTP:', { email: formData.email, otp: otpData.otp });
      const response = await API.post('/verify-otp', { email: formData.email, otp: otpData.otp });
      console.log('✅ OTP Verify Response:', response.data);
      
      // ✅ CRITICAL FIX: Hide OTP field and show success message
      setOtpData({ otp: '', showOtpField: false, otpSent: false });
      setError(''); // Clear any errors
      
      // Show success message
      alert('✅ ' + response.data.message + ' Your email is now verified. Please login again with your credentials.');
      
      // Clear password field for re-login
      setFormData({ ...formData, password: '' });
      
    } catch (err) {
      console.error('❌ Verify OTP Error:', err.response?.data);
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    // If OTP field is visible, user must verify OTP first
    if (otpData.showOtpField) {
      setError('Please verify your OTP before logging in');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔑 Attempting login with:', { email: formData.email, password: '***' });
      
      const response = await API.post('/login', {
        email: formData.email,
        password: formData.password,
      });

      console.log('✅ Login Response Status:', response.status);
      console.log('✅ Login Response Data:', response.data);

      // Hinglish: Agar status 202 hai, toh iska matlab hai email verified nahi hai
      if (response.status === 202) {
        console.log('📩 Status 202 received - Email not verified. OTP sent.');
        setOtpData({ ...otpData, showOtpField: true, otpSent: true });
        setError('Your email is not verified. please  first enter otp and verify it .OTP has been sent to your email. Please enter it below.');
        return; // Yahan rok do, aage mat jao
      }

      // Agar 200 status hai (successful login), toh proceed karo
      if (response.status === 200) {
        console.log('✅ Login successful with verified email');
        const userData = response.data;
        const saved = saveUserToCookie(userData);

        if (saved) {
          // Route based on role: student, company or admin
          const dashboard =
            userData.role === 'student'
              ? '/student/dashboard'
              : userData.role === 'company'
              ? '/company/dashboard'
              : userData.role === 'admin'
              ? '/admin/dashboard'
              : '/';
          console.log('🎯 Navigating to:', dashboard);
          navigate(dashboard);
        } else {
          setError('Failed to save login information');
        }
      }

    } catch (err) {
      // ✅ IMPROVED ERROR LOGGING
      console.error('❌ Login Error Details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.response?.data?.message,
        fullError: err.response?.data,
        stack: err.stack
      });

      const status = err.response?.status;
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';

      // Hinglish: Agar status 202 (Accepted) hai (yeh case ab catch mein nahi aana chahiye, lekin safety ke liye)
      if (status === 202) {
        console.log('📩 Status 202 in catch - OTP sent automatically. Showing OTP field.');
        setOtpData({ ...otpData, showOtpField: true, otpSent: true });
        setError('Your email is not verified. OTP has been sent to your email. Please enter it below.'); 
      } 
      // Hinglish: Agar status 401 hai aur message 'Email not verified' hai
      else if (status === 401 && errorMessage.includes('Email not verified')) {
        console.log('📩 Email not verified (401) - showing OTP field');
        setOtpData({ ...otpData, showOtpField: true, otpSent: false });
        setError('Your email is not verified. Click "Send OTP" to receive verification code.');
      } else {
        setError(errorMessage);
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-navy/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-navy/5 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-md w-full">
        {/* Back to Home Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-navy hover:text-primary transition-colors duration-300 mb-4 group animate-fade-in-down"
        >
          <Home size={18} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-semibold text-sm">Back to Home</span>
        </Link>

        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <img src="/seribro_new_logo.png" alt="Seribro" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-black text-navy">Seribro</h1>
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Welcome Back</h2>
          <p className="text-gray-600">Login to your account to continue</p>
        </div>

        {/* User Type Toggle */}
        <div className="bg-gray-100 p-1.5 rounded-xl mb-6 flex animate-fade-in-up animation-delay-200">
          <button
            onClick={() => setUserType('student')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
              userType === 'student'
                ? 'bg-white text-navy shadow-md'
                : 'text-gray-600 hover:text-navy'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setUserType('company')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
              userType === 'company'
                ? 'bg-white text-navy shadow-md'
                : 'text-gray-600 hover:text-navy'
            }`}
          >
            Company / Business
          </button>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fade-in-up animation-delay-400">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-navy mb-1">
              {userType === 'student' ? 'Student Login' : 'Company Login'}
            </h3>
            <p className="text-gray-600 text-sm">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={userType === 'student' ? 'student@college.edu' : 'hr@company.com'}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-navy transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* OTP Section (Visible only if needed) */}
            {otpData.showOtpField && (
              <div className="space-y-4 border-t pt-4 border-gray-100">
                <p className="text-sm text-gray-600 font-medium">
                  Your email is not verified. Please verify with OTP.
                </p>
                <div className="flex space-x-3">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      name="otp"
                      value={otpData.otp}
                      onChange={handleOtpChange}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={otpData.otpSent ? handleVerifyOtp : handleSendOtp}
                    disabled={isLoading || !formData.email}
                    className={`py-3 px-4 rounded-xl font-bold text-sm text-white transition-all duration-300 disabled:opacity-50 ${
                      otpData.otpSent ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-navy'
                    }`}
                  >
                    <span className="flex items-center space-x-1">
                      {otpData.otpSent ? 'Verify' : 'Send OTP'}
                      {!otpData.otpSent && <Send size={16} />}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full relative py-3.5 rounded-xl font-bold text-base text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-navy"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 disabled:opacity-0"></div>
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>{isLoading ? 'Logging in...' : 'Login'}</span>
                {!isLoading && <ArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" size={18} />}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button type="button" className="group flex items-center justify-center py-3 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300 transform hover:scale-105 disabled:opacity-50" disabled={isLoading}>
              <Chrome className="text-gray-600 group-hover:text-primary transition-colors" size={20} />
            </button>
            <button type="button" className="group flex items-center justify-center py-3 border-2 border-gray-200 rounded-xl hover:border-navy hover:bg-navy/5 transition-all duration-300 transform hover:scale-105 disabled:opacity-50" disabled={isLoading}>
              <Github className="text-gray-600 group-hover:text-navy transition-colors" size={20} />
            </button>
            <button type="button" className="group flex items-center justify-center py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50" disabled={isLoading}>
              <Linkedin className="text-gray-600 group-hover:text-blue-500 transition-colors" size={20} />
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-primary hover:text-primary-dark transition-colors">
                Sign up
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

export default Login;