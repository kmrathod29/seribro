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
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gold rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2.5 mb-5 group cursor-pointer">
              {/* <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-gold rounded-lg blur opacity-40 group-hover:opacity-80 transition duration-300"></div>
                <div className="relative w-10 h-10 bg-white rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-lg p-1">
                  <img src="/logo.png" alt="Seribro" className="w-full h-full object-contain" />
                </div>
              </div> */}
              {/* <img src="/seribro_new_logo.png" alt="Seribro" className="w-12 h-12 object-contain" /> */}

              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-gold rounded-lg blur opacity-40 group-hover:opacity-80 transition duration-300"></div>
                <div className="relative w-10 h-10 bg-white rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-lg p-1">
                  <img src="/seribro_new_logo.png" alt="Seribro" className="w-12 h-12 object-contain" />
                </div>
              </div>

              <span className="text-2xl font-bold text-white">
                Seribro
              </span>
            </div>
            <p className="text-gray-300 text-base leading-relaxed mb-5">
              Connecting local talent with opportunities. Empowering students and companies to build the future together.
            </p>

            {/* Contact Info */}
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2.5 text-gray-300 hover:text-gold transition-colors duration-300 cursor-pointer">
                <Mail size={16} className="text-primary" />
                <span className="text-base">info.seribro@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2.5 text-gray-300 hover:text-gold transition-colors duration-300 cursor-pointer">
                <Phone size={16} className="text-primary" />
                <span className="text-base">+91 9054 92 4231</span>
              </div>
              <div className="flex items-center space-x-2.5 text-gray-300 hover:text-gold transition-colors duration-300 cursor-pointer">
                <MapPin size={16} className="text-primary" />
                <span className="text-base">Bhavnagar, Gujarat</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-gold transition-all duration-300 flex items-center space-x-1.5 group text-base"
                  >
                    <ArrowRight size={14} className="text-primary transform group-hover:translate-x-0.5 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold">
              For Students
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.forStudents.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-gold transition-all duration-300 flex items-center space-x-1.5 group text-base"
                  >
                    <ArrowRight size={14} className="text-primary transform group-hover:translate-x-0.5 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Companies */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold">
              For Companies
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.forCompanies.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-gold transition-all duration-300 flex items-center space-x-1.5 group text-base"
                  >
                    <ArrowRight size={14} className="text-primary transform group-hover:translate-x-0.5 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section - UPDATED GRADIENT */}
        <div className="border-t border-gray-700/50 pt-8 mb-8">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-2 text-gold">
              Stay Updated
            </h3>
            <p className="text-gray-300 text-base mb-5">Subscribe to get the latest projects and opportunities</p>
            <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 text-base rounded-lg bg-white/10 backdrop-blur-sm border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              />
              {/* UPDATED: Primary to Navy gradient */}
              <button className="group relative px-5 py-2.5 text-base font-semibold rounded-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-navy"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 text-white">Subscribe</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700/50 pt-6 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <p className="text-gray-400 text-sm">
            © 2025 Midnight Sphere | Seribro. Made with <span className="text-gold">❤️</span> in Bhavnagar
          </p>

          <div className="flex items-center space-x-5">
            <a href="#terms" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm">
              Terms of Service
            </a>
            <a href="#privacy" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm">
              Privacy Policy
            </a>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-2.5 ml-3">
              {[
                { icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', label: 'Facebook' },
                { icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', label: 'Twitter' },
                { icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z', label: 'LinkedIn' },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={`#${social.label.toLowerCase()}`}
                  className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-gold transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                  aria-label={social.label}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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