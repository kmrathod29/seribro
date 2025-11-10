import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, Github, Linkedin, Home } from 'lucide-react';

const Login = () => {
  const [userType, setUserType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', formData, userType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-navy/5 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-md w-full">
        {/* Back to Home Button */}
        <a 
          href="/"
          className="inline-flex items-center space-x-2 text-navy hover:text-primary transition-colors duration-300 mb-4 group animate-fade-in-down"
        >
          <Home size={18} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-semibold text-sm">Back to Home</span>
        </a>

        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-gold rounded-xl blur opacity-30"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-navy to-navy-light rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary font-bold text-2xl">S</span>
              </div>
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

          <div className="space-y-5">
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
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm"
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
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* OTP Field */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                OTP <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter OTP if enabled"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm"
              />
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <a href="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              className="group w-full relative py-3.5 rounded-xl font-bold text-base text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-navy"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>Login</span>
                <ArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" size={18} />
              </span>
            </button>
          </div>

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
            <button className="group flex items-center justify-center py-3 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300 transform hover:scale-105">
              <Chrome className="text-gray-600 group-hover:text-primary transition-colors" size={20} />
            </button>
            <button className="group flex items-center justify-center py-3 border-2 border-gray-200 rounded-xl hover:border-navy hover:bg-navy/5 transition-all duration-300 transform hover:scale-105">
              <Github className="text-gray-600 group-hover:text-navy transition-colors" size={20} />
            </button>
            <button className="group flex items-center justify-center py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
              <Linkedin className="text-gray-600 group-hover:text-blue-500 transition-colors" size={20} />
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="font-bold text-primary hover:text-primary-dark transition-colors">
                Sign up
              </a>
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