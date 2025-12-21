// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Bell, LogOut, Settings, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getLoggedInUser, logoutUser, getAuthFromLocalToken } from '../utils/authUtils';
import NotificationBell from './NotificationBell';

const Navbar = ({ variant } = {}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(() => getAuthFromLocalToken() || getLoggedInUser());

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Determine if admin is logged in for light theme
  const isAdmin = user?.role === 'admin';

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  // Listen to auth changes (localStorage and custom events) so navbar updates immediately
  useEffect(() => {
    const syncUser = () => {
      try {
        const newUser = getAuthFromLocalToken() || getLoggedInUser();
        setUser(newUser);
      } catch (err) {
        console.error('Navbar syncUser error', err);
        setUser(null);
      }
    };

    const onStorage = (e) => {
      if (!e) return syncUser();
      if (e.key === 'token' || e.key === null) syncUser();
    };

    const onAuthChanged = () => syncUser();

    window.addEventListener('storage', onStorage);
    window.addEventListener('authChanged', onAuthChanged);

    // In case the app navigated back from OAuth flow without firing storage event
    // (same-window), check once on mount
    syncUser();

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('authChanged', onAuthChanged);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Name → Initials
  const getInitials = (fullName) => {
    if (!fullName) return 'NA';
    const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'NA';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  // Build a readable display name from available user fields (handles nested shapes)
  const getDisplayName = (userObj) => {
    if (!userObj) return null;
    const tryStrings = [
      userObj.fullName,
      userObj.contactPersonName,
      userObj.name,
      userObj.user?.fullName,
      userObj.user?.name,
      userObj.data?.user?.fullName,
      userObj.data?.fullName,
      userObj.profile?.fullName,
      `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim(),
      userObj.firstName,
      userObj.lastName,
    ];
    for (const s of tryStrings) {
      if (s && String(s).trim()) return String(s).trim();
    }
    const tryEmails = [
      userObj.email,
      userObj.user?.email,
      userObj.data?.user?.email,
      userObj.data?.email,
      userObj.profile?.email,
    ];
    for (const e of tryEmails) {
      if (e && String(e).includes('@')) {
        const local = String(e).split('@')[0];
        return capitalize(local);
      }
    }
    return null;
  };

  // Helper: capitalize a short username (e.g., from email) into nicer display form
  const capitalize = (s) => {
    if (!s) return s;
    const str = String(s).trim();
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          isAdmin
            ? // Admin always gets light theme
              scrolled
              ? 'bg-white shadow-lg'
              : 'bg-white shadow-md'
            : // Non-admin users get original theme
              variant === 'dark'
            ? scrolled
              ? 'bg-gray-900/95 backdrop-blur-md shadow-lg'
              : 'bg-gray-900/90 backdrop-blur-sm'
            : scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-white/90 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* LOGO */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <img src="/seribro_new_logo.png" alt="Seribro" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-bold text-navy">SeriBro</span>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center space-x-1">
              {['Browse Projects', 'About', 'Help'].map((item, idx) => (
                <a
                  key={idx}
                  href={`${item.toLowerCase().replace(' ', '-')}`}
                  className="relative px-3 py-2 text-gray-700 font-medium text-sm group overflow-hidden rounded-lg"
                >
                  <span className="relative z-10 group-hover:text-primary transition-colors duration-300">
                    {item}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-gold/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              ))}
            </div>

            {/* RIGHT SECTION → AUTH */}
            <div className="hidden md:flex items-center space-x-3">
              {!user ? (
                <>
                  {/* LOGIN */}
                  <Link to="/login">
                    <button className="group relative px-6 py-2 font-semibold text-sm overflow-hidden rounded-lg transition-all duration-300 transform hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      <div className="absolute inset-0.5 bg-white rounded-lg"></div>
                      <span className="relative z-10 text-navy font-medium transition-colors duration-200">
                        Login
                      </span>
                    </button>
                  </Link>

                  {/* SIGN UP */}
                  <Link to="/signup">
                    <button className="relative z-50 px-6 py-2 font-semibold text-sm text-white rounded-lg overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      {/* Base gradient */}
                      <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-navy" />
                      {/* Hover overlay to intensify on hover */}
                      <div className="absolute inset-0 z-0 bg-gradient-to-r from-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center space-x-1.5">
                        <span>Sign Up</span>
                      </span>
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  {/* NOTIFICATION BELL - Phase 2.1 */}
                  <NotificationBell />

                  {/* USER DROPDOWN */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="group flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-primary to-navy rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-300">
                        {getInitials(getDisplayName(user))}
                      </div>

                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-navy">
                          {getDisplayName(user) || 'NA'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </button>

                    {/* DROPDOWN MENU */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in-down">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-navy/5">
                          <p className="text-sm font-semibold text-navy">{getDisplayName(user) || ''}</p>
                          <p className="text-xs text-gray-600">{user?.email}</p>
                          <p className="text-xs text-primary font-medium capitalize mt-1">{user?.role}</p>
                        </div>

                        <div className="py-2">
                          <Link
                            to={
                              user?.role === 'student'
                                ? '/student/dashboard'
                                : user?.role === 'company'
                                ? '/company/dashboard'
                                : user?.role === 'admin'
                                ? '/admin/dashboard'
                                : '/'
                            }
                            className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <BarChart3 size={16} />
                            <span className="text-sm font-medium">Dashboard</span>
                          </Link>

                          {user?.role !== 'admin' && (
                            <Link
                              to={user?.role === 'student' ? '/student/profile' : '/company/profile'}
                              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Settings size={16} />
                              <span className="text-sm font-medium">View Profile</span>
                            </Link>
                          )}

                          {/* Phase 4.1: Post Project Link for Companies */}
                          {user?.role === 'company' && (
                            <Link
                              to="/company/post-project"
                              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <span className="text-sm font-medium">Post Project</span>
                            </Link>
                          )}

                          {/* Phase 4.1: My Projects Link for Companies */}
                          {user?.role === 'company' && (
                            <Link
                              to="/company/projects"
                              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <span className="text-sm font-medium">My Projects</span>
                            </Link>
                          )}

                          {/* Phase 4.3: Applications Management Link for Companies */}
                          {user?.role === 'company' && (
                            <Link
                              to="/company/applications"
                              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <span className="text-sm font-medium">Applications</span>
                            </Link>
                          )}

                          {/* Phase 2.1: Admin Projects Link */}
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin/projects"
                              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <span className="text-sm font-medium">Projects Monitoring</span>
                            </Link>
                          )}

                          {/* Phase 2.1: Admin Applications Link */}
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin/applications"
                              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <span className="text-sm font-medium">Applications Monitoring</span>
                            </Link>
                          )}

                          {/* Phase 4.2: Browse Projects Link for Students */}
                          {user?.role === 'student' && (
                            <Link
                              to="/student/browse-projects"
                              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <span className="text-sm font-medium">Browse Projects</span>
                            </Link>
                          )}

                          {/* Phase 4.2: My Applications Link for Students */}
                          {user?.role === 'student' && (
                            <Link
                              to="/student/my-applications"
                              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <span className="text-sm font-medium">My Applications</span>
                            </Link>
                          )}
                        </div>

                        {/* LOGOUT */}
                        <div className="border-t border-gray-200 px-4 py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-300 font-medium text-sm"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden relative w-9 h-9 text-navy focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {isMenuOpen ? (
                  <X size={24} className="transform rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu size={24} className="transform transition-transform duration-300" />
                )}
              </div>
            </button>
          </div>

          {/* MOBILE MENU */}
          {isMenuOpen && (
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out max-h-80 opacity-100 ${isAdmin ? 'bg-white' : ''}`}>
              <div className="py-3 space-y-1.5">
                {/* Public links */}
                <Link to="/about" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-gold/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>About</Link>
                <Link to="/help" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-gold/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Help</Link>

                <div className="pt-3 border-t border-gray-200 flex flex-col gap-3">
                  {!user ? (
                    <>
                      {/* Mobile Login */}
                      <Link to="/login">
                      <button className="w-full px-3 py-2.5 font-semibold text-sm border-2 border-gray-300 rounded-lg hover:border-primary transition-all duration-300 relative overflow-hidden group">
                        <span className="relative z-10 text-navy font-medium">Login</span>
                      </button>
                      </Link>
                      {/* Mobile Signup */}
                      <Link to="/signup">
                        <button className="w-full px-3 py-2.5 font-semibold text-sm text-white rounded-lg relative overflow-hidden group bg-gradient-to-r from-primary to-navy hover:shadow-md transform hover:scale-105 transition-all duration-300">
                          <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-navy" />
                          <div className="absolute inset-0 z-0 bg-gradient-to-r from-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span className="relative z-10">Sign Up</span>
                        </button>
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Notification Bell for mobile */}
                      <div className="flex justify-end pr-3 pb-1">
                        <NotificationBell />
                      </div>

                      {/* STUDENT MENU */}
                      {user.role === 'student' && (
                        <>
                          <Link to="/student/dashboard" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                          <Link to="/student/profile" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                          <Link to="/student/browse-projects" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Browse Projects</Link>
                          <Link to="/student/my-applications" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>My Applications</Link>
                        </>
                      )}
                      {/* COMPANY MENU */}
                      {user.role === 'company' && (
                        <>
                          <Link to="/company/dashboard" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                          <Link to="/company/profile" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                          <Link to="/company/projects" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>My Projects</Link>
                          <Link to="/company/applications" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Applications</Link>
                          <Link to="/company/post-project" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Post Project</Link>
                        </>
                      )}
                      {/* ADMIN MENU */}
                      {user.role === 'admin' && (
                        <>
                          <Link to="/admin/dashboard" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                          <Link to="/admin/projects" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Projects Monitoring</Link>
                          <Link to="/admin/applications" className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>Applications Monitoring</Link>
                        </>
                      )}
                      <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-red-500 font-medium text-sm hover:bg-red-50 rounded-lg transition-all duration-300">Logout</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
    
  );
};

export default Navbar;