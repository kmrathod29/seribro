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


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        

        {/* Hinglish: Naye Password Reset Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Add your other routes here */}

         {/* Hinglish: Student Profile Management Routes */}
        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        {/* <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<BrowseProjects />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/support" element={<Support />} /> */}

        {/* Error Route - Must be last! */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;