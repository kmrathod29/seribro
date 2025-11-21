// src/pages/NotFound/NotFound.jsx
import React, { useEffect, useState } from 'react';
import { Home, ArrowRight, Search, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const NotFound = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
      <Navbar />
      
      {/* Main 404 Content */}
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        {/* Animated Background Blobs - 2 Color Gradient Only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-blob transition-transform duration-500"
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            }}
          ></div>
          <div
            className="absolute top-40 right-20 w-72 h-72 bg-navy/15 rounded-full blur-3xl animate-blob animation-delay-2000 transition-transform duration-500"
            style={{
              transform: `translate(-${mousePosition.x * 0.5}px, -${mousePosition.y * 0.5}px)`,
            }}
          ></div>
        </div>

        {/* 404 Content */}
        <div className="relative max-w-2xl w-full text-center z-10">
          {/* Animated 404 Text */}
          <div className="mb-8 animate-fade-in-down">
            <div className="relative inline-block">
              {/* Glowing Background - 2 Color */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-navy rounded-2xl blur-2xl opacity-25 animate-pulse"></div>
              
              {/* Main 404 Number */}
              <div className="relative">
                <h1 className="text-9xl md:text-[200px] font-black bg-gradient-to-r from-primary to-navy bg-clip-text text-transparent leading-none">
                  404
                </h1>
              </div>
            </div>
          </div>

          {/* Error Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-navy mb-4 animate-fade-in-up animation-delay-200">
            Oops! Page Not Found
          </h2>

          {/* Error Description */}
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
            The page you're looking for has moved away or doesn't exist. But don't worry, we have plenty of opportunities waiting for you on Seribro!
          </p>

          {/* Quick Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 animate-fade-in-up animation-delay-600">
            {[
              {
                icon: Home,
                title: 'Home',
                desc: 'Go back to homepage',
                link: '/',
                color: 'from-primary to-primary-dark',
                textColor: 'text-primary'
              },
              {
                icon: Search,
                title: 'Browse Projects',
                desc: 'Find work opportunities',
                link: '/projects',
                color: 'from-navy to-navy-dark',
                textColor: 'text-navy'
              },
              {
                icon: MessageSquare,
                title: 'Support',
                desc: 'Contact our team',
                link: '/support',
                color: 'from-primary to-navy',
                textColor: 'text-primary'
              }
            ].map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                className="group relative bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
                <div className="relative">
                  <item.icon className={`${item.textColor} mx-auto mb-2 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`} size={24} />
                  <h3 className={`font-bold text-sm ${item.textColor} group-hover:text-current transition-colors duration-300`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fade-in-up animation-delay-700">
            <Link
              to="/"
              className="group relative px-8 py-3.5 rounded-xl font-semibold text-base overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-navy"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center space-x-2 text-white">
                <Home size={18} />
                <span>Back to Home</span>
                <ArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" size={18} />
              </span>
            </Link>

            <Link
              to="/projects"
              className="px-8 py-3.5 rounded-xl font-semibold text-base border-2 border-gray-300 text-navy hover:border-primary hover:text-primary transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Search size={18} />
              <span>Find Opportunities</span>
            </Link>
          </div>

          {/* Additional Help Text */}
          <p className="text-sm text-gray-500 mb-6">
            Need help? <Link to="/support" className="text-primary font-semibold hover:underline">Contact our support team</Link>
          </p>

          {/* Error Code Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs font-mono text-gray-600">Error Code: 404</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;