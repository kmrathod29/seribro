// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Bell, LogOut, Settings, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications] = useState(2); // Example: 2 unread notifications
  // const [notifications, setNotifications] = useState(2); // Example: 2 unread notifications
  const userMenuRef = useRef(null);
  const navigate = useNavigate();


  // Check for user in cookies on component mount
  useEffect(() => {
    const userData = getCookie('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }
  }, []);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
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

  // Cookie utility functions
  const getCookie = (name) => {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  };

  // const setCookie = (name, value, days = 7) => {
  //   const expires = new Date();
  //   expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  //   document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  // };

  const handleLogout = () => {
    // Delete user cookie
    document.cookie = 'user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    setUser(null);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Get initials from user name
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <img src="/seribro_new_logo.png" alt="Seribro" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold text-navy">
              SeriBro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {['Browse Projects', 'About', 'Help'].map((item, idx) => (
              <a
                key={idx}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="relative px-3 py-2 text-gray-700 font-medium text-sm group overflow-hidden rounded-lg"
              >
                <span className="relative z-10 group-hover:text-primary transition-colors duration-300">
                  {item}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-gold/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </a>
            ))}
          </div>

          {/* Auth Section - Logged Out or Logged In */}
          <div className="hidden md:flex items-center space-x-3">
            {!user ? (
              <>
                {/* LOGIN BUTTON */}
                <Link to="/login">
                  <button className="group relative px-6 py-2 font-semibold text-sm overflow-hidden rounded-lg transition-all duration-300 transform hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    <div className="absolute inset-0.5 bg-white rounded-lg"></div>
                    <span className="relative z-10 bg-gradient-to-r from-navy to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-navy transition-all duration-300">
                      Login
                    </span>
                  </button>
                </Link>
                
                {/* SIGN UP BUTTON */}
                <Link to="/signup">
                  <button className="relative px-6 py-2 font-semibold text-sm text-white rounded-lg overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-navy"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 flex items-center space-x-1.5">
                      <span>Sign Up</span>
                      <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </Link>
              </>
            ) : (
              <>
                {/* NOTIFICATION ICON */}
                <button className="relative p-2 text-gray-700 hover:text-primary transition-colors duration-300 group">
                  <Bell size={20} className="group-hover:scale-110 transition-transform duration-300" />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* USER PROFILE DROPDOWN */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="group flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-navy rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-300">
                      {getInitials(user?.firstName, user?.lastName)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-navy">{user?.firstName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.userType}</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in-down">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-navy/5">
                        <p className="text-sm font-semibold text-navy">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                        <p className="text-xs text-primary font-medium capitalize mt-1">{user?.userType}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to={user?.userType === 'student' ? '/student-dashboard' : '/company-dashboard'}
                          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BarChart3 size={16} />
                          <span className="text-sm font-medium">Dashboard</span>
                        </Link>

                        <Link
                          to="/profile-settings"
                          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings size={16} />
                          <span className="text-sm font-medium">Profile Settings</span>
                        </Link>
                      </div>

                      {/* Logout Button */}
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

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-3 space-y-1.5">
              {['Browse Projects', 'About', 'Help'].map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-gold/10 hover:text-primary rounded-lg transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-200 flex flex-col gap-3">
                {!user ? (
                  <>
                    {/* Mobile Login Button */}
                    <Link to="/login">
                      <button className="w-full px-3 py-2.5 font-semibold text-sm border-2 border-gray-300 rounded-lg hover:border-primary transition-all duration-300 relative overflow-hidden group">
                        <span className="relative z-10 bg-gradient-to-r from-navy to-primary bg-clip-text text-transparent">
                          Login
                        </span>
                      </button>
                    </Link>
                    {/* Mobile Sign Up Button */}
                    <Link to="/signup">
                      <button className="w-full px-3 py-2.5 font-semibold text-sm text-white rounded-lg bg-gradient-to-r from-primary to-navy hover:from-navy hover:to-primary hover:shadow-md transform hover:scale-105 transition-all duration-300">
                        Sign Up
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={user?.userType === 'student' ? '/student-dashboard' : '/company-dashboard'}
                      className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile-settings"
                      className="block px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:to-navy/10 hover:text-primary rounded-lg transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-red-500 font-medium text-sm hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;