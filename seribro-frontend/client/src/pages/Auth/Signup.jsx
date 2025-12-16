import React, { useState } from "react";
import {
  User,
  Mail,
  Building,
  Lock,
  Eye,
  EyeOff,
  Upload,
  ArrowRight,
  Chrome,
  Github,
  Linkedin,
  GraduationCap,
  Briefcase,
  Home,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { saveUserToCookie } from "../../utils/authUtils.js";
import API from "../../apis/api.js";

const Signup = () => {
  const [userType, setUserType] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState({
    fullName: "",
    email: "",
    college: "",
    skills: "",
    password: "",
    collegeId: null,
  });

  const [companyData, setCompanyData] = useState({
    contactPerson: "",
    companyName: "",
    email: "",
    password: "",
    verificationDoc: null,
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

  const handleFileUpload = (e, uploadType) => {
    const file = e.target.files[0];
    const target = uploadType || userType;
    if (target === "student") {
      setStudentData({ ...studentData, collegeId: file });
    } else {
      setCompanyData({ ...companyData, verificationDoc: file });
    }
  };

  const validateStudentForm = () => {
    if (
      !studentData.fullName ||
      !studentData.email ||
      !studentData.college ||
      !studentData.skills ||
      !studentData.password
    ) {
      setError("Please fill in all required fields");
      return false;
    }
    if (studentData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!studentData.collegeId) {
      setError("Please upload your college ID");
      return false;
    }
    return true;
  };

  const validateCompanyForm = () => {
    if (
      !companyData.contactPerson ||
      !companyData.companyName ||
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
    if (!companyData.verificationDoc) {
      setError("Please upload verification document");
      return false;
    }
    return true;
  };

  // -------------------- Submit --------------------
  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Validate form
      if (userType === "student" && !validateStudentForm()) {
        setIsLoading(false);
        return;
      }
      if (userType === "company" && !validateCompanyForm()) {
        setIsLoading(false);
        return;
      }

      // Prepare form data
      const formData = new FormData();
      if (userType === "student") {
        // ✅ FIXED: Send 'fullName' instead of 'name'
        formData.append("fullName", studentData.fullName);
        formData.append("email", studentData.email);
        formData.append("college", studentData.college);
        formData.append("skills", studentData.skills);
        formData.append("password", studentData.password);
        formData.append("collegeId", studentData.collegeId);
      } else {
        // ✅ FIXED: Field names now match backend
        formData.append("contactPerson", companyData.contactPerson);
        formData.append("companyName", companyData.companyName);
        formData.append("email", companyData.email);
        formData.append("password", companyData.password);
        formData.append("verificationDocument", companyData.verificationDoc);
      }

      // ---- API Call ----
      const endpoint =
        userType === "student" ? "/student/register" : "/company/register";

      const response = await API.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Success - Show alert and redirect to login
      alert(response.data.message + ". Please check your email for OTP.");
      navigate("/login");

    } catch (err) {
      console.error("Signup error:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  College <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="college"
                    value={studentData.college}
                    onChange={handleStudentChange}
                    placeholder="ABC University"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Skills <span className="text-gray-400 text-xs">(comma separated)</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="skills"
                  value={studentData.skills}
                  onChange={handleStudentChange}
                  placeholder="Web Design, React, Python"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                  disabled={isLoading}
                />
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
                    value={studentData.password}
                    onChange={handleStudentChange}
                    placeholder="Create a strong password"
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

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Upload College ID <span className="text-red-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-primary transition-all duration-300 cursor-pointer group">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'student')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,.pdf"
                    disabled={isLoading}
                  />
                  <div className="text-center pointer-events-none">
                    <Upload className="mx-auto text-gray-400 group-hover:text-primary transition-colors mb-2" size={32} />
                    <p className="text-sm text-gray-600 mb-1">
                      {studentData.collegeId ? studentData.collegeId.name : 'Click to upload College ID'}
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG or PDF (Max 5MB)</p>
                  </div>
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="companyName"
                    value={companyData.companyName}
                    onChange={handleCompanyChange}
                    placeholder="Tech Corp"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                    disabled={isLoading}
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
                    value={companyData.email}
                    onChange={handleCompanyChange}
                    placeholder="hr@company.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300 text-sm disabled:bg-gray-100"
                    disabled={isLoading}
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

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Upload Verification Document <span className="text-red-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-primary transition-all duration-300 cursor-pointer group">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'company')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,.pdf"
                    disabled={isLoading}
                  />
                  <div className="text-center pointer-events-none">
                    <Upload className="mx-auto text-gray-400 group-hover:text-primary transition-colors mb-2" size={32} />
                    <p className="text-sm text-gray-600 mb-1">
                      {companyData.verificationDoc ? companyData.verificationDoc.name : 'Click to upload Company Registration'}
                    </p>
                    <p className="text-xs text-gray-400">GST, Registration Certificate (Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="group w-full relative py-3.5 rounded-xl font-bold text-base text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mt-6 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-navy"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 disabled:opacity-0"></div>
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
              {!isLoading && (
                <ArrowRight
                  className="transform group-hover:translate-x-1 transition-transform duration-300"
                  size={18}
                />
              )}
            </span>
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