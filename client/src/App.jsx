import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Add your other routes here */}
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