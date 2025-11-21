// src/pages/ResetPassword.jsx (Hinglish: Password reset karne ka page)

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Home } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../apis/api.js'; // Assuming API is configured in a file like this
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is used for notifications

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);

  // Hinglish: Component mount hone par URL se token nikalna
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      const errorMsg = 'Error: Password reset token is missing (Hinglish: Password reset token nahi mila)';
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setToken(urlToken);
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Hinglish: Token check karna
    if (!token) {
      const errorMsg = 'Missing reset token. Please use the link from your email. (Hinglish: Reset token gayab hai. Kripya email se link istemal karein.)';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    // Hinglish: Basic validation
    if (!formData.password || !formData.confirmPassword) {
      const errorMsg = 'Please fill in both password fields (Hinglish: Kripya dono password fields bharein)';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    // Hinglish: Password match check karna
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match (Hinglish: Password match nahi ho rahe hain)';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔑 Attempting password reset with token:', token);
      
      const response = await API.post('/reset-password', {
        token,
        password: formData.password,
      });

      console.log('✅ Reset Password Response Status:', response.status);
      console.log('✅ Reset Password Response Data:', response.data);

      toast.success(response.data.message);
      
      // Hinglish: Success hone par /login par redirect karna
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      console.error('❌ Reset Password Error Details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
      });

      const errorMessage = err.response?.data?.message || 'Password reset failed. Invalid or expired token.';
      setError(errorMessage);
      toast.error(errorMessage);

    } finally {
      setIsLoading(false);
    }
  };

  // Hinglish: Login.jsx se same layout aur styling copy kiya gaya hai
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Blobs (Login.jsx se copy kiya) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-navy/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-navy/5 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-md w-full">
        {/* Back to Home Button (Login.jsx se copy kiya) */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-navy hover:text-primary transition-colors duration-300 mb-4 group animate-fade-in-down"
        >
          <Home size={18} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-semibold text-sm">Back to Home</span>
        </Link>

        {/* Logo & Header (Login.jsx se copy kiya) */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              {/* Assuming logo path is correct */}
              <img src="/seribro_new_logo.png" alt="Seribro" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-black text-navy">Seribro</h1>
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Set New Password</h2>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-fade-in-up animation-delay-400">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-navy mb-1">Reset Password</h3>
            <p className="text-gray-600 text-sm">
              Your token is: <span className="font-mono text-xs text-primary break-all">{token || 'N/A'}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                  disabled={isLoading}
                />
                {/* Password toggle button is shared */}
              </div>
            </div>

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={isLoading || !token}
              className="group w-full relative py-3.5 rounded-xl font-bold text-base text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-navy"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 disabled:opacity-0"></div>
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                {!isLoading && <ArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" size={18} />}
              </span>
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Password reset successful?{' '}
              <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
                Go to Login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Text (Login.jsx se copy kiya) */}
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

export default ResetPassword;
