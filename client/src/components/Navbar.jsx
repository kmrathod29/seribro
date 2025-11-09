// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
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
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Glow Effect */}
          <a href="/" className="flex items-center space-x-3 group">
           <img src="/seribro_nobg_only_logo.png" alt="Seribro Icon" className="h-13 w-12" />
            <img src="/seribro_nobg__only_name_logo.png" alt="Seribro Brand" className="h-12" />
          </a>
          {/* <a href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lavender to-primary rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-navy to-navy-light rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <span className="text-lavender font-bold text-2xl">S</span>
              </div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-navy to-navy-light bg-clip-text text-transparent">
              Seribro
            </span>
          </a> */}

          {/* Desktop Navigation with Hover Effects */}
          <div className="hidden md:flex items-center space-x-1">
            {['Browse Projects', 'About', 'Help'].map((item, idx) => (
              <a
                key={idx}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="relative px-4 py-2 text-gray-700 font-medium group overflow-hidden rounded-lg"
              >
                <span className="relative z-10 group-hover:text-primary transition-colors duration-300">
                  {item}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-lavender/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </a>
            ))}
          </div>

          {/* Auth Buttons with Gradient */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-6 py-2.5 text-navy font-semibold hover:text-primary transition-all duration-300 relative group">
              <span className="relative z-10">Login</span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-lavender transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
            <button className="relative px-8 py-3 font-semibold text-white rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-lavender bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500"></div>
              <span className="relative z-10 flex items-center space-x-2">
                <span>Sign Up</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden relative w-10 h-10 text-navy focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {isMenuOpen ? (
                <X size={28} className="transform rotate-90 transition-transform duration-300" />
              ) : (
                <Menu size={28} className="transform transition-transform duration-300" />
              )}
            </div>
          </button>
        </div>

        {/* Mobile Menu with Slide Animation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-2">
            {['Browse Projects', 'About', 'Help'].map((item, idx) => (
              <a
                key={idx}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="block px-4 py-3 text-gray-700 font-medium hover:bg-gradient-to-r hover:from-primary/10 hover:to-lavender/10 hover:text-primary rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-4 space-y-3 border-t border-gray-200">
              <button className="w-full px-4 py-3 text-navy font-semibold border-2 border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-all duration-300">
                Login
              </button>
              <button className="w-full px-4 py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-primary to-lavender hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;