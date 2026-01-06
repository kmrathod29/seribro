import React from 'react';
import { Zap, Shield, CreditCard, Users, Briefcase, Check, ArrowRight, Star, TrendingUp, Award, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { useNavigate } from 'react-router-dom';
import { getLoggedInUser, getAuthFromLocalToken } from '../utils/authUtils';
// import SignupModal from '../components/Auth/SignupModal';

const Home = () => {
  const navigate = useNavigate();

  const openSignupModal = (role = 'student') => {
    // Redirect to the Signup page and preselect the role via query param
    navigate(`/signup?role=${role}`);
  };

  // Alerts for wrong-role access (exact phrasing per spec)
  const showStudentAccessDenied = () => alert("❌ Access Denied: You're a student account.");
  const showCompanyAccessDenied = () => alert("❌ Access Denied: You're a company account.");

  const handleStudentAction = () => {
    const tokenUser = getAuthFromLocalToken();
    const cookieUser = getLoggedInUser();
    const user = tokenUser || cookieUser;

    if (!user) return openSignupModal('student');
    if (user.role === 'company') return showCompanyAccessDenied();

    navigate('/student/browse-projects');
  };

  const handleCompanyAction = () => {
    const tokenUser = getAuthFromLocalToken();
    const cookieUser = getLoggedInUser();
    const user = tokenUser || cookieUser;

    if (!user) return openSignupModal('company');
    if (user.role === 'student') return showStudentAccessDenied();

    navigate('/company/applications');
  };

  // Keep backward-compatible heroes mapped
  const handlePostProjectClick = () => handleCompanyAction();
  const handleFindWorkClick = () => handleStudentAction();

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else navigate('/about');
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section - ENHANCED */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy-light to-navy-dark pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gold rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {/* Badge with SHINE EFFECT */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-fade-in-down relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <Sparkles className="text-gold animate-pulse relative z-10" size={14} />
            <span className="text-white text-xs font-medium relative z-10">India's First Local Freelancing Platform</span>
          </div>

          {/* ENHANCED HEADING - 7XL with DIFFERENT COLORS & SIZES */}
          <h1 className="mb-6 leading-tight animate-fade-in-up">
            <span className="block text-5xl md:text-6xl lg:text-7xl font-black text-primary mb-2">
              Hire Local Talent
            </span>
            <span className="block text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-gold to-white bg-clip-text text-transparent animate-gradient">
              Empower Students.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Connect with verified students for micro-projects.
            <span className="text-gold font-semibold"> Fast, Secure, Local.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up animation-delay-400">
            <button
              onClick={handlePostProjectClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePostProjectClick(); }}
              aria-label="Post a Project (Companies only)"
              className="group relative px-8 py-3.5 rounded-xl font-semibold text-base overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-gold/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100"></div>
              <span className="relative z-10 flex items-center space-x-2 text-navy">
                <span>Post a Project</span>
                <ArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" size={18} />
              </span>
            </button>
            <button
              onClick={handleFindWorkClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFindWorkClick(); }}
              aria-label="Find Work (Students only)"
              className="group px-8 py-3.5 rounded-xl font-semibold text-base border-2 border-white/30 text-white backdrop-blur-sm hover:bg-white/10 hover:border-gold transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
            >
              <Users size={18} />
              <span>Find Work</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in-up animation-delay-600">
            {[
              { number: '1,200+', label: 'Students', icon: Users, color: 'text-primary' },
              { number: '350+', label: 'Companies', icon: Briefcase, color: 'text-gold' },
              { number: '2,500+', label: 'Projects', icon: TrendingUp, color: 'text-primary' },
              { number: '₹45L+', label: 'Earned', icon: Award, color: 'text-gold' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 hover:border-gold transition-all duration-300 transform hover:scale-105">
                <stat.icon className={`${stat.color} mx-auto mb-2`} size={20} />
                <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-gray-300 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ENHANCED Scroll Indicator - VISIBLE DOT - FIXED
            Quick customization notes:
            - Adjust vertical distance from buttons using bottom- utilities (e.g. bottom-24, bottom-32)
            - For precise control use arbitrary values: bottom-[5.5rem] or bottom-[80px]
            - Shift horizontally with left- utilities or arbitrary values: left-1/2, left-[48%], left-[55%]
            - Keep `transform -translate-x-1/2` when using left-1/2 to center; when using left-[48%] it will offset slightly left
        */}
        <div className="absolute bottom-1 left-[45%] md:left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex justify-center items-start pt-2">
            <div className="w-1.5 h-3 bg-gold rounded-full animate-scroll shadow-lg shadow-gold/50"></div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-gold to-navy"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs mb-4">
              WHY CHOOSE US
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-navy mb-4">
              Why Choose <span className="text-primary">Seribro</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fast, secure, and reliable platform designed for local collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-3 text-center mt-2 mb-6">
              <button
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 text-primary font-semibold hover:bg-white/20 transition min-h-[36px]"
              >
                Learn More
                <ArrowRight size={16} />
              </button>
            </div>
            {[
              {
                icon: Zap,
                title: 'Quick Hiring',
                desc: 'Get qualified applications within hours. Fast-track your hiring process with verified local talent.',
                color: 'from-primary to-primary-dark',
                bgGradient: 'from-green-50 to-emerald-50',
                iconColor: 'text-primary'
              },
              {
                icon: Shield,
                title: 'Verified Profiles',
                desc: 'All students verify college credentials. Companies are thoroughly vetted for authenticity.',
                color: 'from-navy to-navy-dark',
                bgGradient: 'from-blue-50 to-indigo-50',
                iconColor: 'text-navy'
              },
              {
                icon: CreditCard,
                title: 'Secure Payments',
                desc: 'Escrow system ensures safe transactions. Release funds only when satisfied with work.',
                color: 'from-gold to-gold-dark',
                bgGradient: 'from-yellow-50 to-amber-50',
                iconColor: 'text-gold'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md`}>
                    <feature.icon className="text-white" size={28} />
                  </div>
                  <h3 className={`text-xl font-bold text-navy mb-3 group-hover:${feature.iconColor} transition-colors duration-300`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className={`mt-4 flex items-center space-x-1 ${feature.iconColor} opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300`}>
                    <span className="font-semibold text-xs">Learn more</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* For Students Card */}
            <div className="group relative bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 overflow-hidden transform hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-primary/50">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Users className="text-white" size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-white">For Students</h3>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    'Earn while you learn with flexible projects',
                    'Build portfolio with real-world experience',
                    'Network with local professionals',
                    'Get paid securely and on time'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-2 group/item">
                      <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5 transform group-hover/item:scale-110 transition-transform duration-300">
                        <Check className="text-white" size={12} />
                      </div>
                      <span className="text-white/90 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStudentAction}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStudentAction(); }}
                  aria-label="Start Earning - Students"
                  className="w-full min-h-[44px] bg-white text-primary py-3 rounded-xl font-bold text-base hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 group/btn"
                >
                  <span>Start Earning</span>
                  <ArrowRight className="transform group-hover/btn:translate-x-1 transition-transform duration-300" size={18} />
                </button>
              </div>
            </div>

            {/* For Companies Card - FIXED WITH DARKER GOLD */}
            <div className="group relative bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-800 rounded-2xl p-8 overflow-hidden transform hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-gold/50">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Briefcase className="text-white" size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-white">For Companies</h3>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    'Access fresh talent from top colleges',
                    'Cost-effective short-term solutions',
                    'Quick turnaround with motivated students',
                    'Pay-as-you-go with no commitments'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-2 group/item">
                      <div className="w-5 h-5 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5 transform group-hover/item:scale-110 transition-transform duration-300">
                        <Check className="text-white" size={12} />
                      </div>
                      <span className="text-white text-sm leading-relaxed font-medium group-hover/item:text-white transition-colors duration-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCompanyAction}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCompanyAction(); }}
                  aria-label="Hire Talent - Companies"
                  className="w-full min-h-[44px] bg-white text-amber-700 py-3 rounded-xl font-bold text-base hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 group/btn"
                >
                  <span>Hire Talent</span>
                  <ArrowRight className="transform group-hover/btn:translate-x-1 transition-transform duration-300" size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-10 md:p-12 border-2 border-gray-100">
            <Star className="text-gold mx-auto mb-4 animate-pulse" size={36} />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-navy mb-4">
              Ready to Get <span className="text-primary">Started</span>?
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Join <span className="font-bold text-primary">1,200+ students</span> and <span className="font-bold text-navy">350+ companies</span> already using Seribro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => openSignupModal('student')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openSignupModal('student'); }}
                aria-label="Sign Up Now"
                className="group relative px-8 py-3.5 rounded-xl font-semibold text-base overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/50 min-h-[44px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-navy"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-navy to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 flex items-center space-x-2 text-white">
                  <span>Sign Up Now</span>
                  <ArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" size={18} />
                </span>
              </button>
              <button
                onClick={scrollToFeatures}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToFeatures(); }}
                className="px-8 py-3.5 rounded-xl font-semibold text-base border-2 border-gray-300 text-navy hover:border-primary hover:text-primary transition-all duration-300 transform hover:scale-105 min-h-[44px]"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;