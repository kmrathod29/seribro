// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2.5 group">
            {/* <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-gold to-navy rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-navy to-navy-light rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-md">
                <img src="/logo.png" alt="Seribro" className="w-8 h-8 object-contain" />
                {/* Fallback */}
                {/* <span className="text-primary font-bold text-xl">S</span> */}
              {/* </div> */}
            {/* </div> */} 
            <img src="/seribro_new_logo.png" alt="Seribro" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold text-navy">
              Seribro
            </span>
          </a>

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

          {/* UPDATED Auth Buttons - NEW GRADIENT */}
          <div className="hidden md:flex items-center space-x-3">
            {/* LOGIN BUTTON - Enhanced with border gradient effect */}
            <button className="group relative px-6 py-2 font-semibold text-sm overflow-hidden rounded-lg transition-all duration-300 transform hover:scale-105">
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              <div className="absolute inset-0.5 bg-white rounded-lg"></div>
              <span className="relative z-10 bg-gradient-to-r from-navy to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-navy transition-all duration-300">
                Login
              </span>
            </button>
            
            {/* SIGN UP BUTTON - NEW: Primary to Navy gradient */}
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
              <div className="pt-3 space-y-2 border-t border-gray-200">
                {/* Mobile Login Button */}
                <button className="w-full px-3 py-2.5 font-semibold text-sm border-2 border-gray-300 rounded-lg hover:border-primary transition-all duration-300 relative overflow-hidden group">
                  <span className="relative z-10 bg-gradient-to-r from-navy to-primary bg-clip-text text-transparent">
                    Login
                  </span>
                </button>
                {/* Mobile Sign Up Button - UPDATED GRADIENT */}
                <button className="w-full px-3 py-2.5 font-semibold text-sm text-white rounded-lg bg-gradient-to-r from-primary to-navy hover:from-navy hover:to-primary hover:shadow-md transform hover:scale-105 transition-all duration-300">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;