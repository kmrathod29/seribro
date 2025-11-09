// import React, { useState } from 'react';
import React from 'react';
import { Zap, Shield, CreditCard, Users, Briefcase, Check, ArrowRight, Star, TrendingUp, Award, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  // removed unused testimonial state for now to avoid lint errors

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section - Enhanced with Gradient Animation */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy-light to-navy pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-lavender rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in-down">
            <Sparkles className="text-lavender" size={16} />
            <span className="text-white text-sm font-medium">India's First Local Freelancing Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight animate-fade-in-up">
            <span className="bg-gradient-to-r from-white via-lavender to-white bg-clip-text text-transparent animate-gradient">
              Hire Local Talent,
            </span>
            <br />
            <span className="bg-gradient-to-r from-lavender via-white to-lavender bg-clip-text text-transparent animate-gradient">
              Empower Students.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Connect with verified students for micro-projects. 
            <span className="text-lavender font-semibold"> Fast, Secure, Local.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in-up animation-delay-400">
            <button className="group relative px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-lavender/50">
              <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100"></div>
              <span className="relative z-10 flex items-center space-x-3 text-navy">
                <span>Post a Project</span>
                <ArrowRight className="transform group-hover:translate-x-2 transition-transform duration-300" size={20} />
              </span>
            </button>
            <button className="group px-10 py-5 rounded-2xl font-bold text-lg border-2 border-white/30 text-white backdrop-blur-sm hover:bg-white/10 hover:border-lavender transition-all duration-300 flex items-center space-x-3 transform hover:scale-105">
              <Users size={20} />
              <span>Find Work</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up animation-delay-600">
            {[
              { number: '1,200+', label: 'Students', icon: Users },
              { number: '350+', label: 'Companies', icon: Briefcase },
              { number: '2,500+', label: 'Projects', icon: TrendingUp },
              { number: '₹45L+', label: 'Earned', icon: Award }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <stat.icon className="text-lavender mx-auto mb-3" size={24} />
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-2">
            <div className="w-1 h-3 bg-lavender rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Why Choose Section - Enhanced Cards */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-lavender to-primary"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
              WHY CHOOSE US
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-navy mb-6">
              Why Choose <span className="bg-gradient-to-r from-primary to-lavender bg-clip-text text-transparent">Seribro?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fast, secure, and reliable platform designed for local collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Quick Hiring',
                desc: 'Get qualified applications within hours. Fast-track your hiring process with verified local talent.',
                color: 'from-yellow-400 to-orange-500',
                bgGradient: 'from-yellow-50 to-orange-50'
              },
              {
                icon: Shield,
                title: 'Verified Profiles',
                desc: 'All students verify college credentials. Companies are thoroughly vetted for authenticity.',
                color: 'from-green-400 to-emerald-500',
                bgGradient: 'from-green-50 to-emerald-50'
              },
              {
                icon: CreditCard,
                title: 'Secure Payments',
                desc: 'Escrow system ensures safe transactions. Release funds only when satisfied with work.',
                color: 'from-blue-400 to-purple-500',
                bgGradient: 'from-blue-50 to-purple-50'
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <feature.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className="mt-6 flex items-center space-x-2 text-primary opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                    <span className="font-semibold text-sm">Learn more</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Redesigned */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* For Students Card */}
            <div className="group relative bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-10 overflow-hidden transform hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-primary/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <Users className="text-white" size={32} />
                  </div>
                  <h3 className="text-4xl font-black text-white">For Students</h3>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    'Earn while you learn with flexible projects',
                    'Build portfolio with real-world experience',
                    'Network with local professionals',
                    'Get paid securely and on time'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-3 group/item">
                      <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5 transform group-hover/item:scale-110 transition-transform duration-300">
                        <Check className="text-white" size={14} />
                      </div>
                      <span className="text-white/90 leading-relaxed group-hover/item:text-white transition-colors duration-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button className="w-full bg-white text-primary py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 group/btn">
                  <span>Start Earning</span>
                  <ArrowRight className="transform group-hover/btn:translate-x-2 transition-transform duration-300" size={20} />
                </button>
              </div>
            </div>

            {/* For Companies Card */}
            <div className="group relative bg-gradient-to-br from-navy to-navy-dark rounded-3xl p-10 overflow-hidden transform hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-navy/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-lavender/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-lavender/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <Briefcase className="text-lavender" size={32} />
                  </div>
                  <h3 className="text-4xl font-black text-white">For Companies</h3>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    'Access fresh talent from top colleges',
                    'Cost-effective short-term solutions',
                    'Quick turnaround with motivated students',
                    'Pay-as-you-go with no commitments'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-3 group/item">
                      <div className="w-6 h-6 rounded-full bg-lavender/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5 transform group-hover/item:scale-110 transition-transform duration-300">
                        <Check className="text-lavender" size={14} />
                      </div>
                      <span className="text-white/90 leading-relaxed group-hover/item:text-white transition-colors duration-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button className="w-full bg-gradient-to-r from-lavender to-primary text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 group/btn">
                  <span>Hire Talent</span>
                  <ArrowRight className="transform group-hover/btn:translate-x-2 transition-transform duration-300" size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-lavender/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 md:p-16 border-2 border-gray-100">
            <Star className="text-primary mx-auto mb-6 animate-pulse" size={48} />
            <h2 className="text-4xl md:text-6xl font-black text-navy mb-6">
              Ready to Get <span className="bg-gradient-to-r from-primary to-lavender bg-clip-text text-transparent">Started?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join <span className="font-bold text-primary">1,200+ students</span> and <span className="font-bold text-navy">350+ companies</span> already using Seribro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group px-10 py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary to-lavender text-white hover:shadow-2xl hover:shadow-primary/50 transform hover:scale-105 transition-all duration-300 flex items-center space-x-3">
                <span>Sign Up Now</span>
                <ArrowRight className="transform group-hover:translate-x-2 transition-transform duration-300" size={20} />
              </button>
              <button className="px-10 py-5 rounded-2xl font-bold text-lg border-2 border-gray-300 text-navy hover:border-primary hover:text-primary transition-all duration-300 transform hover:scale-105">
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