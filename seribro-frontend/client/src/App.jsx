import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import GoogleSuccess from './pages/Auth/GoogleSuccess';
import NotFound from './pages/NotFound/NotFound';
import About from './pages/About';
import Help from './pages/Help';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// Import other necessary components/pages here

import Dashboard from './pages/students/Dashboard';
import StudentProfile from './pages/students/StudentProfile';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyProfile from './pages/company/CompanyProfile';
// Phase 4.1: Company Project Management
import PostProject from './pages/company/PostProject';
import MyProjects from './pages/company/MyProjects';
import ProjectDetails from './pages/company/ProjectDetails';
import EditProject from './pages/company/EditProject';
// Phase 4.2: Student Project Browsing & Applications
import BrowseProjects from './pages/students/BrowseProjects';
import StudentProjectDetails from './pages/students/ProjectDetails';
import MyApplications from './pages/students/MyApplications';
// Phase 4.3: Company Application Management
import CompanyApplications from './pages/company/CompanyApplications';
import ApplicationDetails from './pages/company/ApplicationDetails';
// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingStudents from './pages/admin/PendingStudents';
import PendingCompanies from './pages/admin/PendingCompanies';
import StudentReview from './pages/admin/StudentReview';
import CompanyReview from './pages/admin/CompanyReview';
import AdminVerification from './pages/admin/AdminVerification';
import AdminPaymentReleases from './pages/admin/AdminPaymentReleases';
// Phase 2.1: Admin Project & Application Monitoring
import AdminProjects from './pages/admin/AdminProjects';
import StudentEarnings from './pages/student/StudentEarnings';
import AdminProjectDetails from './pages/admin/AdminProjectDetails';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationDetails from './pages/admin/AdminApplicationDetails';
import ProjectWorkspace from './pages/workspace/ProjectWorkspace';
import SubmitWork from './pages/workspace/SubmitWork';
import ReviewWork from './pages/workspace/ReviewWork';
import PaymentPage from './pages/payment/PaymentPage';
import RateProject from './pages/workspace/RateProject';
import StudentPaymentPage from './pages/StudentPaymentPage';
import AdminPaymentPage from './pages/AdminPaymentPage';
import PaymentVerificationPage from './pages/PaymentVerificationPage';
import RatingPage from './pages/RatingPage';
import PaymentWorkflowPage from './pages/PaymentWorkflowPage';
// Use SafeToastContainer wrapper to handle React 19 compatibility issues

// import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

<<<<<<< HEAD
import RoleRoute, { AdminRoute, StudentRoute, CompanyRoute } from './components/Shared/RoleRoutes';
=======
import { AdminRoute, StudentRoute, CompanyRoute, default as RoleRoute } from './components/Shared/RoleRoutes';
>>>>>>> c60feea9278ac643f4ee64b68ef91a22103c1bed

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
  <Route path="/auth/google/success" element={<GoogleSuccess />} />
  {/* Generic dashboard entry that redirects based on token role (guards will check token) */}
  <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        
<Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/verification" element={<AdminRoute><AdminVerification /></AdminRoute>} />
        <Route path="/admin/payment-releases" element={<AdminRoute><AdminPaymentReleases /></AdminRoute>} />
        <Route path="/admin/students/pending" element={<AdminRoute><PendingStudents /></AdminRoute>} />

  {/* Student earnings */}
  <Route path="/student/earnings" element={<StudentRoute><StudentEarnings /></StudentRoute>} />
        <Route path="/admin/companies/pending" element={<AdminRoute><PendingCompanies /></AdminRoute>} />
        <Route path="/admin/student/:id" element={<AdminRoute><StudentReview /></AdminRoute>} />
        <Route path="/admin/company/:id" element={<AdminRoute><CompanyReview /></AdminRoute>} />

        {/* Phase 2.1: Admin Projects & Applications Monitoring Routes */}
        <Route path="/admin/projects" element={<AdminRoute><AdminProjects /></AdminRoute>} />
        <Route path="/admin/projects/:projectId" element={<AdminRoute><AdminProjectDetails /></AdminRoute>} />
        <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
        <Route path="/admin/applications/:applicationId" element={<AdminRoute><AdminApplicationDetails /></AdminRoute>} />
        <Route path="/admin/about" element={<About />} />
        <Route path="/admin/help" element={<Help />} />
        <Route path="/admin/browse-projects" element={<BrowseProjects />} />
        {/* Hinglish: Naye Password Reset Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Add your other routes here */}

  {/* Hinglish: Student Profile Management Routes */}
  <Route path="/student/dashboard" element={<StudentRoute><Dashboard /></StudentRoute>} />
  <Route path="/student/profile" element={<StudentRoute><StudentProfile /></StudentRoute>} />
  <Route path="/student/browse-projects" element={<StudentRoute><BrowseProjects /></StudentRoute>} />
  <Route path="/student/projects/browse-projects" element={<StudentRoute><BrowseProjects /></StudentRoute>} />
  <Route path="/student/about" element={<StudentRoute><About /></StudentRoute>} />
  <Route path="/student/help" element={<StudentRoute><Help /></StudentRoute>} />
  <Route path="/student/projects/help" element={<StudentRoute><Help /></StudentRoute>} />

  {/* Company Profile Management Routes */}
  <Route path="/company/dashboard" element={<CompanyRoute><CompanyDashboard /></CompanyRoute>} />
  <Route path="/company/profile" element={<CompanyRoute><CompanyProfile /></CompanyRoute>} />
  <Route path="/company/about" element={<CompanyRoute><About /></CompanyRoute>} />
  <Route path="/company/help" element={<CompanyRoute><Help /></CompanyRoute>} />
        
        {/* Phase 4.1: Company Project Management Routes */}
  <Route path="/company/post-project" element={<CompanyRoute><PostProject /></CompanyRoute>} />
  <Route path="/company/projects" element={<CompanyRoute><MyProjects /></CompanyRoute>} />
  <Route path="/company/projects/:id" element={<CompanyRoute><ProjectDetails /></CompanyRoute>} />
  <Route path="/company/projects/:id/edit" element={<CompanyRoute><EditProject /></CompanyRoute>} />
        
        {/* Phase 4.2: Student Project Browsing & Applications Routes */}
        <Route path="/browse-projects" element={<BrowseProjects />} />
        <Route path="/company/browse-projects" element={<BrowseProjects />} />
  <Route path="/student/projects/:id" element={<StudentRoute><StudentProjectDetails /></StudentRoute>} />
  <Route path="/student/my-applications" element={<StudentRoute><MyApplications /></StudentRoute>} />

        {/* Phase 4.3: Company Application Management Routes */}
  <Route path="/company/applications" element={<CompanyRoute><CompanyApplications /></CompanyRoute>} />
  <Route path="/company/applications/:applicationId" element={<CompanyRoute><ApplicationDetails /></CompanyRoute>} />

        {/* Workspace (Phase 5.1) - Protected for both student and company */}
        <Route path="/workspace/projects/:projectId" element={<RoleRoute allowedRoles={['student', 'company']}><ProjectWorkspace /></RoleRoute>} />
        {/* Sub-Phase 2: Work Submission & Review */}
        <Route path="/workspace/projects/:projectId/submit" element={<RoleRoute allowedRoles={['student']}><SubmitWork /></RoleRoute>} />
        <Route path="/workspace/projects/:projectId/review" element={<RoleRoute allowedRoles={['company']}><ReviewWork /></RoleRoute>} />

        {/* Phase 5.3: Payment */}
        <Route path="/payment/:projectId" element={<CompanyRoute><PaymentPage /></CompanyRoute>} />
        <Route path="/workspace/projects/:projectId/payment" element={<CompanyRoute><PaymentPage /></CompanyRoute>} />

        {/* Rating - Protected for both roles */}
        <Route path="/workspace/projects/:projectId/rate" element={<RoleRoute allowedRoles={['student', 'company']}><RateProject /></RoleRoute>} />

        {/* Phase 5.4.8: New Payment & Rating Pages */}
        <Route path="/student/payments" element={<StudentRoute><StudentPaymentPage /></StudentRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><AdminPaymentPage /></AdminRoute>} />
        <Route path="/payments/verify" element={<CompanyRoute><PaymentVerificationPage /></CompanyRoute>} />
        <Route path="/workspace/projects/:projectId/rating" element={<StudentRoute><RatingPage /></StudentRoute>} />
        <Route path="/workflow/payments" element={<PaymentWorkflowPage />} />
        {/* <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<BrowseProjects />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/support" element={<Support />} /> */}

        {/* Admin Routes */}
        
        {/* Error Route - Must be last! */}
        <Route path="*" element={<NotFound />} />

      </Routes>
<<<<<<< HEAD

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>

=======
      <ToastContainer 
        position="top-right" 
        autoClose={3500} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
      </Router>
    </ErrorBoundary>
>>>>>>> c60feea9278ac643f4ee64b68ef91a22103c1bed
  );
}

export default App;