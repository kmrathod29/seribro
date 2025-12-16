import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
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
// Phase 2.1: Admin Project & Application Monitoring
import AdminProjects from './pages/admin/AdminProjects';
import AdminProjectDetails from './pages/admin/AdminProjectDetails';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationDetails from './pages/admin/AdminApplicationDetails';


function AdminRoute({ children }) {
  // Hinglish: Simple client-side guard (sirf UI level) - backend pe protect+adminOnly already laga hai
  try {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('user='));
    if (!cookie) return <div className="p-6">Unauthorized (admin login required)</div>;
    const user = JSON.parse(cookie.split('=')[1]);
    if (user?.role !== 'admin') return <div className="p-6">Unauthorized (admin only)</div>;
    return children;
  } catch {
    return <div className="p-6">Unauthorized</div>;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        
<Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/verification" element={<AdminRoute><AdminVerification /></AdminRoute>} />
        <Route path="/admin/students/pending" element={<AdminRoute><PendingStudents /></AdminRoute>} />
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
        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/browse-projects" element={<BrowseProjects />} />
        <Route path="/student/projects/browse-projects" element={<BrowseProjects />} />
        <Route path="/student/about" element={<About />} />
        <Route path="/student/help" element={<Help />} />
        <Route path="/student/projects/help" element={<Help />} />

        {/* Company Profile Management Routes */}
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/about" element={<About />} />
        <Route path="/company/help" element={<Help />} />
        
        {/* Phase 4.1: Company Project Management Routes */}
        <Route path="/company/post-project" element={<PostProject />} />
        <Route path="/company/projects" element={<MyProjects />} />
        <Route path="/company/projects/:id" element={<ProjectDetails />} />
        
        {/* Phase 4.2: Student Project Browsing & Applications Routes */}
        <Route path="/browse-projects" element={<BrowseProjects />} />
        <Route path="/company/browse-projects" element={<BrowseProjects />} />
        <Route path="/student/projects/:id" element={<StudentProjectDetails />} />
        <Route path="/student/my-applications" element={<MyApplications />} />

        {/* Phase 4.3: Company Application Management Routes */}
        <Route path="/company/applications" element={<CompanyApplications />} />
        <Route path="/company/applications/:applicationId" element={<ApplicationDetails />} />
        {/* <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<BrowseProjects />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/support" element={<Support />} /> */}

        {/* Admin Routes */}
        
        {/* Error Route - Must be last! */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;