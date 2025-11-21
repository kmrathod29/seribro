import React from 'react'
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Award, Users, Target, Zap, Heart, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const about = () => {
  return (
    <>
      <div className='min-h-screen bg-slate-900 '>
        <Navbar />
        {/* Hero Section */}
        <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy-light to-navy-dark pt-24 pb-16">
          {/* Glowing Orbs Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-24 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[34rem] h-[34rem] bg-amber-500 rounded-full blur-3xl animate-pulse delay-700" />
          </div>
          {/* Grid Container */}
          <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-10 z-10">
            {/* Left: Text */}
            <div className="space-y-8">
             {/* Badge with SHINE EFFECT */}
                       <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-fade-in-down relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                         <Sparkles className="text-gold animate-pulse relative z-10" size={14} />
                         <span className="text-white text-xs font-medium relative z-10">India's First Local Freelancing Platform</span>
                       </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight animate-fade-in">
                <span className="text-green-400">Trusted</span> By Students,<br />
                <span className="text-amber-400">Preferred</span> By Companies.<br />
                <span className="block text-slate-200 text-3xl mt-2">Real Work. Real Results.</span>
              </h1>
              {/* Website Link */}
             
              <p className="text-xl md:text-2xl text-slate-300 max-w-2xl animate-slide-up leading-relaxed">
                Seribro unlocks <span className="font-semibold text-green-400">local talent</span>—connecting Bhavnagar students with real company projects to learn, earn, and thrive in a trusted ecosystem.
              </p>
             
              
            </div>
            {/* Right: Hero Logo/Graphic */}
            <div className="flex justify-center md:justify-end py-8">
             
              <Link to="/" className="flex items-center space-x-2.5 group">
            <img src="/seribro_new_logo.png" alt="Seribro" className="w-50 h-50 object-contain" />
            
          </Link>

            </div>
          </div>
          
        </section>

        {/* Our Story Section */}
        <section className="px-6 py-20 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="story-content">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Our <span className="text-green-500">Story</span>
                </h2>
                <div className="space-y-5 text-slate-300 text-lg leading-relaxed">
                  <p>
                    In Bhavnagar, many IT students have strong technical skills but limited real-world exposure. They spend years learning programming, design, and development, yet struggle to find opportunities to apply their knowledge in practical scenarios.
                  </p>
                  <p>
                    At the same time, local companies often struggle to find affordable, trusted developers or designers for small projects. They need quality work done quickly, but hiring full-time employees or expensive agencies isn't always feasible for short-term needs.
                  </p>
                  <p>
                    Seribro bridges this gap — helping students gain practical experience while enabling companies to get quality work done faster and cheaper. We created a platform where trust meets opportunity, and where local talent can shine.
                  </p>
                  <p>
                    Built with trust, transparency, and technology, Seribro creates a growing community where learning meets opportunity. Every project completed is a step forward for both students building their careers and companies growing their businesses.
                  </p>
                </div>
              </div>
              <div className="story-visual relative">
                <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white">
                        <div className="font-bold text-xl">Founded 2024</div>
                        <div className="text-green-200">Based in Bhavnagar</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white">
                        <div className="font-bold text-xl">Local First</div>
                        <div className="text-green-200">Hyperlocal Focus</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white">
                        <div className="font-bold text-xl">Community Driven</div>
                        <div className="text-green-200">Student Empowerment</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="mission-card bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-8 backdrop-blur-sm hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  To empower students by providing real project experience, income opportunities, and industry exposure — all within their own city.
                </p>
              </div>
              <div className="vision-card bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-8 backdrop-blur-sm hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300">
                <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  To build Bhavnagar's strongest IT ecosystem where students and companies collaborate, grow, and innovate together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How Seribro Works Section */}
        <section className="px-6 py-20 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
              How <span className="text-green-500">Seribro</span> Works
            </h2>
            <p className="text-slate-400 text-center text-lg mb-12 max-w-2xl mx-auto">
              Simple, transparent, and designed for success
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="step-card bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-green-600/10 hover:to-emerald-600/10 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-2xl">
                  1
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Students Register & Verify</h3>
                <p className="text-slate-400 leading-relaxed">
                  Create a portfolio, upload your college ID, and showcase your skills. Get verified to build trust with potential clients and start your freelancing journey.
                </p>
              </div>
              <div className="step-card bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-amber-600/10 hover:to-orange-600/10 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
                <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-2xl">
                  2
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Companies Post Projects</h3>
                <p className="text-slate-400 leading-relaxed">
                  Add project details, set your budget, and specify the required skills. Find the right student talent for your business needs quickly and efficiently.
                </p>
              </div>
              <div className="step-card bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-blue-600/10 hover:to-indigo-600/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-2xl">
                  3
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Collaborate & Earn</h3>
                <p className="text-slate-400 leading-relaxed">
                  Work securely on projects, get rated for your work, and receive payments safely through the Seribro platform. Build your reputation and grow your career.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section - Light & Contrasted */}
        <section className="px-6 py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
              Our Core <span className="text-green-500">Values</span>
            </h2>
            <p className="text-gray-500 text-center text-lg mb-12 max-w-2xl mx-auto">
              The principles that guide everything we do at Seribro
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="value-card group bg-white border border-gray-200 rounded-2xl p-8 hover:border-green-500 transition-all duration-300 hover:transform hover:-translate-y-2 shadow">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors duration-300">
                  <Users className="w-7 h-7 text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Community First</h3>
                <p className="text-gray-600 leading-relaxed">
                  We prioritize building a supportive community where students and businesses grow together, fostering meaningful connections beyond transactions.
                </p>
              </div>
              <div className="value-card group bg-white border border-gray-200 rounded-2xl p-8 hover:border-amber-500 transition-all duration-300 hover:transform hover:-translate-y-2 shadow">
                <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
                  <Award className="w-7 h-7 text-yellow-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Quality & Trust</h3>
                <p className="text-gray-600 leading-relaxed">
                  We maintain high standards for projects and ensure transparent, reliable interactions between students and companies through verified profiles and reviews.
                </p>
              </div>
              <div className="value-card group bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition-all duration-300 hover:transform hover:-translate-y-2 shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors duration-300">
                  <Heart className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Empowerment</h3>
                <p className="text-gray-600 leading-relaxed">
                  We empower students with real opportunities to learn, earn, and build their careers while helping local businesses access the talent they need to succeed.
                </p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  )
}

export default about;
