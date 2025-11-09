// src/components/Footer.jsx
import React from 'react';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    quickLinks: ['About Us', 'Browse Projects', 'Help Center', 'Contact', 'Blog'],
    forStudents: ['Find Work', 'My Dashboard', 'Payments', 'Resources', 'Sign Up'],
    forCompanies: ['Post a Project', 'Find Talent', 'Payment Terms', 'Success Stories', 'Sign Up'],
  };

  return (
    <footer className="relative bg-gradient-to-br from-navy via-navy to-navy-dark text-white overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-lavender rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section with Enhanced Design */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6 group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-lavender rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-lavender rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-lavender to-white bg-clip-text text-transparent">
                Seribro
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Connecting local talent with opportunities. Empowering students and companies to build the future together.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300 hover:text-lavender transition-colors duration-300 cursor-pointer">
                <Mail size={18} />
                <span className="text-sm">info.seribro@gmail.com
</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 hover:text-lavender transition-colors duration-300 cursor-pointer">
                <Phone size={18} />
                <span className="text-sm">+91 90549 24231</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 hover:text-lavender transition-colors duration-300 cursor-pointer">
                <MapPin size={18} />
                <span className="text-sm">Bhavnagar, Gujarat</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-lavender to-white bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-lavender transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
                    <span className="group-hover:translate-x-2 transition-transform duration-300">{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-lavender to-white bg-clip-text text-transparent">
              For Students
            </h3>
            <ul className="space-y-3">
              {footerLinks.forStudents.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-lavender transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
                    <span className="group-hover:translate-x-2 transition-transform duration-300">{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Companies */}
          <div>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-lavender to-white bg-clip-text text-transparent">
              For Companies
            </h3>
            <ul className="space-y-3">
              {footerLinks.forCompanies.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-lavender transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
                    <span className="group-hover:translate-x-2 transition-transform duration-300">{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-700/50 pt-8 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-lavender via-white to-lavender bg-clip-text text-transparent">
              Stay Updated
            </h3>
            <p className="text-gray-300 mb-6">Subscribe to get the latest projects and opportunities</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender transition-all duration-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-primary to-lavender rounded-lg font-semibold hover:shadow-lg hover:shadow-lavender/50 transform hover:scale-105 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
           © 2025 Midnight Sphere | SeriBro. Made with ❤️ in Bhavnagar.
          </p>
          
          <div className="flex items-center space-x-6">
            <a href="#terms" className="text-gray-400 hover:text-lavender transition-colors duration-300 text-sm">
              Terms of Service
            </a>
            <a href="#privacy" className="text-gray-400 hover:text-lavender transition-colors duration-300 text-sm">
              Privacy Policy
            </a>
            
            {/* Enhanced Social Media Icons */}
            <div className="flex items-center space-x-3 ml-4">
              {[
                { icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', label: 'Facebook' },
                { icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', label: 'Twitter' },
                { icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z', label: 'LinkedIn' },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={`#${social.label.toLowerCase()}`}
                  className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-lavender transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  aria-label={social.label}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;