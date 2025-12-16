import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Search, ChevronDown, ChevronUp, HelpCircle, Users, Briefcase, Shield, CreditCard, FileText, MessageCircle, Mail, Phone, MapPin, BookOpen, CheckCircle, Sparkles } from 'lucide-react';



const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen, color: 'blue' },
    { id: 'students', name: 'For Students', icon: Users, color: 'green' },
    { id: 'companies', name: 'For Companies', icon: Briefcase, color: 'amber' },
    { id: 'payments', name: 'Payments', icon: CreditCard, color: 'purple' },
    { id: 'security', name: 'Security', icon: Shield, color: 'red' },
  ];

  const faqs = [
    {
      category: 'students',
      question: 'How do I register as a student on SeriBro?',
      answer: 'To register as a student: 1) Click "Sign Up" and select "Student" account type. 2) Fill in your basic details (name, email, phone). 3) Upload your college ID for verification. 4) Create your portfolio showcasing your skills and previous work. 5) Wait for verification (usually 24-48 hours). Once verified, you can start applying for projects!'
    },
    {
      category: 'students',
      question: 'What documents do I need for verification?',
      answer: 'You need a valid college ID card showing your name, college name, and current enrollment status. The ID should be clear and legible. We also accept bonafide certificates issued by your college as an alternative verification document.'
    },
    {
      category: 'students',
      question: 'How do I apply for projects?',
      answer: 'Browse available projects in the "Find Work" section. Click on any project to view full details. If interested, click "Apply Now" and submit a proposal explaining why you\'re the right fit, your approach to the project, and your expected timeline. Companies will review applications and contact shortlisted candidates.'
    },
    {
      category: 'students',
      question: 'When and how will I receive payment?',
      answer: 'Payments are released through SeriBro\'s secure escrow system. Once you complete the project and the company approves your work, payment is released to your SeriBro wallet within 2-3 business days. You can withdraw funds to your bank account anytime (minimum ₹500).'
    },
    {
      category: 'companies',
      question: 'How do I post a project on SeriBro?',
      answer: 'To post a project: 1) Sign up as a Company. 2) Complete your company profile with verification documents. 3) Click "Post a Project" from your dashboard. 4) Fill in project details including title, description, required skills, budget, and deadline. 5) Review and publish. Your project will be visible to verified students immediately.'
    },
    {
      category: 'companies',
      question: 'How do I choose the right student for my project?',
      answer: 'Review student applications carefully. Check their portfolio, previous work samples, ratings from past projects, and proposal quality. You can also conduct interviews or request work samples. SeriBro recommends choosing students with verified badges and good ratings for best results.'
    },
    {
      category: 'companies',
      question: 'What if I\'m not satisfied with the work delivered?',
      answer: 'If work doesn\'t meet agreed specifications, you can request revisions through the platform. SeriBro offers dispute resolution if issues persist. Our team reviews both parties\' claims and project requirements to reach a fair resolution. Payment is only released after you approve the final work.'
    },
    {
      category: 'companies',
      question: 'What are the fees for posting projects?',
      answer: 'SeriBro charges a small platform fee of 5% on the project budget. This covers payment processing, verification services, and platform maintenance. There are no upfront costs - you only pay when you hire a student and they complete the work.'
    },
    {
      category: 'payments',
      question: 'How does the payment escrow system work?',
      answer: 'When a company hires you, they deposit the project payment into SeriBro\'s secure escrow. The funds are held safely until you complete and deliver the work. Once the company approves, payment is released to your wallet. This protects both parties and ensures fair transactions.'
    },
    {
      category: 'payments',
      question: 'What payment methods are accepted?',
      answer: 'Companies can pay via UPI, debit/credit cards, net banking, and wallet payments. Students receive payments in their SeriBro wallet and can withdraw to any Indian bank account via NEFT/IMPS. International payments are currently not supported.'
    },
    {
      category: 'payments',
      question: 'Are there any withdrawal limits or fees?',
      answer: 'Minimum withdrawal amount is ₹500. There are no withdrawal fees for bank transfers. Payments typically reach your bank account within 1-2 business days. You can make unlimited withdrawals as long as you have sufficient balance.'
    },
    {
      category: 'security',
      question: 'How does SeriBro verify students and companies?',
      answer: 'Students must upload valid college IDs which our team manually reviews. Companies must provide GST registration, business registration documents, or proprietor ID. We also verify email addresses and phone numbers. Verified accounts get a blue checkmark badge.'
    },
    {
      category: 'security',
      question: 'Is my personal information safe?',
      answer: 'Yes! SeriBro uses industry-standard encryption to protect your data. We never share your personal information with third parties without consent. Payment details are processed through secure payment gateways and we don\'t store sensitive financial information on our servers.'
    },
    {
      category: 'security',
      question: 'What should I do if I suspect fraud or scam?',
      answer: 'Report suspicious activity immediately through the "Report" button on any project or profile. Our team investigates all reports within 24 hours. Never share payment details outside the platform. SeriBro staff will never ask for passwords or OTPs.'
    },
    {
      category: 'students',
      question: 'Can I work on multiple projects simultaneously?',
      answer: 'Yes! You can work on multiple projects as long as you can meet all deadlines and maintain quality. However, we recommend not taking on more than you can handle. Be realistic about your time commitments and communicate clearly with clients about your availability.'
    },
    {
      category: 'companies',
      question: 'Can I hire the same student for future projects?',
      answer: 'Absolutely! Once you find a great student, you can invite them directly to new projects without going through the application process. Build long-term relationships with talented students for ongoing work. Many companies have found their go-to freelancers through SeriBro.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-900  ">
      <Navbar />
      

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy-light to-navy-dark pt-24 pb-16">
        {/* Glowing Orbs Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-24 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[34rem] h-[34rem] bg-amber-500 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-fade-in-down relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <Sparkles className="text-amber-400 animate-pulse relative z-10" size={14} />
            <span className="text-white text-xs font-medium relative z-10">24/7 Support Available</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            How Can We <span className="text-green-400">Help</span> You?
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Find answers to common questions, guides, and get support from our team
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
        </div>
      </section>

      {/* Quick Guides Section - Three Cards Side by Side */}
<section className="px-6 py-20 bg-slate-900">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
      Quick <span className="text-green-500">Guides</span>
    </h2>
    <p className="text-slate-400 text-center text-lg mb-12 max-w-2xl mx-auto">
      Step-by-step instructions to help you get started
    </p>

    <div className="grid md:grid-cols-3 gap-8">
      {/* Card A: How to Post a Project */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-amber-600/10 hover:to-orange-600/10 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">How to Post a Project</h3>
        </div>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">1</div>
            <p className="text-slate-300">Log in to your company account</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">2</div>
            <p className="text-slate-300">Navigate to your dashboard</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">3</div>
            <p className="text-slate-300">Click on 'Post Project' button</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">4</div>
            <p className="text-slate-300">Fill in project details (title, description, skills, budget, deadline)</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">5</div>
            <p className="text-slate-300">Review and submit your project</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">6</div>
            <p className="text-slate-300">Wait for student applications to come in</p>
          </div>
        </div>
      </div>

      {/* Card B: How to Apply for Projects */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-green-600/10 hover:to-emerald-600/10 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">How to Apply for Projects</h3>
        </div>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm font-bold">1</div>
            <p className="text-slate-300">Browse available projects that match your skills</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm font-bold">2</div>
            <p className="text-slate-300">Read the project description and requirements carefully</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm font-bold">3</div>
            <p className="text-slate-300">Click 'Apply Now' and fill in the proposal form</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm font-bold">4</div>
            <p className="text-slate-300">Write a personalized cover letter highlighting your experience</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm font-bold">5</div>
            <p className="text-slate-300">Quote a fair budget and realistic timeline</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm font-bold">6</div>
            <p className="text-slate-300">Attach relevant portfolio samples if available</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-sm font-bold">7</div>
            <p className="text-slate-300">Submit your proposal and wait for company response</p>
          </div>
        </div>
      </div>

      {/* Card C: Managing Payments */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-purple-600/10 hover:to-pink-600/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">Managing Payments</h3>
        </div>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold">1</div>
            <p className="text-slate-300">Complete your project milestones as agreed</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold">2</div>
            <p className="text-slate-300">Submit deliverables through the project management page</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold">3</div>
            <p className="text-slate-300">Wait for company approval and payment release</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold">4</div>
            <p className="text-slate-300">Check your wallet balance in the Payments section</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold">5</div>
            <p className="text-slate-300">Add your bank account details for withdrawal</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold">6</div>
            <p className="text-slate-300">Request withdrawal (minimum ₹500)</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold">7</div>
            <p className="text-slate-300">Receive funds within 1–3 business days</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      

      {/* Category Tabs */}
      <section className="px-6 py-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const colorClasses = {
                blue: isActive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
                green: isActive ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
                amber: isActive ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
                purple: isActive ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
                red: isActive ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
              };
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${colorClasses[cat.color]}`}
                >
                  <Icon size={18} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Frequently Asked <span className="text-green-400">Questions</span>
          </h2>
          <p className="text-slate-400 text-center mb-10">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'} found
          </p>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No results found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-green-500/50 transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/70 transition"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                    </div>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6 pl-20 animate-fade-in">
                      <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Still Need <span className="text-green-400">Help?</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Our support team is here to assist you. Reach out through any of these channels.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
              <p className="text-slate-300 mb-4">Get help via email</p>
              <a href="mailto:info.seribro@gmail.com" className="text-green-400 font-semibold hover:text-green-300 transition">
                info.seribro@gmail.com
              </a>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Phone Support</h3>
              <p className="text-slate-300 mb-4">Call us directly</p>
              <a href="tel:+919054924231" className="text-blue-400 font-semibold hover:text-blue-300 transition">
                +91 9054 92 4231
              </a>
            </div>

            <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Visit Us</h3>
              <p className="text-slate-300 mb-4">Our location</p>
              <p className="text-amber-400 font-semibold">
                Bhavnagar, Gujarat
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }

        .delay-700 {
          animation-delay: 700ms;
        }

        /* Custom color definitions matching your theme */
        .from-navy { background: #1e293b; }
        .via-navy-light { background: #334155; }
        .to-navy-dark { background: #0f172a; }
      `}</style>
    </div>
    </>
    
    
  );
};

export default Help;