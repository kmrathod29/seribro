// src/pages/PaymentWorkflowPage.jsx
// Complete Payment Workflow Visualization Page

import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';

const PaymentWorkflowPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      step: 1,
      title: 'Student Applies to Project',
      role: 'Student',
      description: 'Student browses and finds a suitable project, then submits an application with their portfolio and proposal.',
      url: '/workspace/projects',
      status: 'active',
      details: [
        'Navigate to Projects Dashboard',
        'Browse available projects',
        'Click "Apply to Project"',
        'Submit proposal and portfolio'
      ]
    },
    {
      step: 2,
      title: 'Company Reviews & Accepts',
      role: 'Company',
      description: 'Company reviews student application and accepts the most suitable candidate.',
      url: '/dashboard/applications',
      status: 'pending',
      details: [
        'Go to Applications section',
        'Review student profile & proposal',
        'Click "Accept Application"',
        'Project assignment confirmation sent'
      ]
    },
    {
      step: 3,
      title: 'Project Work Begins',
      role: 'Both',
      description: 'Student and company work together on the project. Deliverables are submitted as per timeline.',
      url: '/workspace/projects/:projectId',
      status: 'pending',
      details: [
        'Student accesses project workspace',
        'Submits work deliverables',
        'Company reviews submissions',
        'Provides feedback and approvals'
      ]
    },
    {
      step: 4,
      title: 'Create Payment',
      role: 'Company',
      description: 'Company creates a payment order through Razorpay with project amount.',
      url: '/payments/verify',
      status: 'pending',
      details: [
        'Click "Create Payment" button',
        'Select project and amount',
        'Razorpay payment gateway opens',
        'Complete payment transaction'
      ]
    },
    {
      step: 5,
      title: 'Verify Payment',
      role: 'Company',
      description: 'Company verifies the payment using Razorpay Order ID, Payment ID, and Signature.',
      url: '/payments/verify',
      status: 'pending',
      details: [
        'Enter Razorpay Order ID',
        'Enter Razorpay Payment ID',
        'Enter Razorpay Signature',
        'Click "Verify Payment"'
      ]
    },
    {
      step: 6,
      title: 'Payment Ready for Release',
      role: 'System',
      description: 'Verified payment is marked as ready for admin release after a 3-day hold period.',
      url: '/admin/payments',
      status: 'pending',
      details: [
        'Payment enters 3-day hold period',
        'Admin dashboard shows ready for release',
        'Email notification sent to admin',
        'Payment appears in release queue'
      ]
    },
    {
      step: 7,
      title: 'Admin Releases Payment',
      role: 'Admin',
      description: 'Admin reviews and releases the verified payment to the student\'s account.',
      url: '/admin/payments',
      status: 'pending',
      details: [
        'Go to Payment Release Dashboard',
        'Review payment details',
        'Click "Release Payment" button',
        'Confirm release action'
      ]
    },
    {
      step: 8,
      title: 'Student Receives Money',
      role: 'Student',
      description: 'Payment is transferred to student\'s bank account. Student can view in earnings.',
      url: '/student/payments',
      status: 'pending',
      details: [
        'View Payment & Earnings page',
        'Check Total Earnings stat',
        'See transaction history',
        'Download payment receipt'
      ]
    },
    {
      step: 9,
      title: 'Rate & Review Project',
      role: 'Student',
      description: 'Student rates the project and provides feedback on their experience.',
      url: '/workspace/projects/:projectId/rating',
      status: 'pending',
      details: [
        'Go to Project Details page',
        'Click "Rate Project" button',
        'Select 1-5 stars rating',
        'Write optional review',
        'Submit rating'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy/90 to-navy/70">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Payment Workflow</h1>
          <p className="text-gray-400">Complete process from application to payment and rating</p>
        </div>

        {/* Workflow Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Workflow Steps */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {workflowSteps.map((workflow, index) => (
                <div
                  key={workflow.step}
                  onClick={() => setActiveStep(index)}
                  className={`cursor-pointer transition-all rounded-lg border ${
                    activeStep === index
                      ? 'bg-gold/20 border-gold shadow-lg shadow-gold/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="p-4 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        activeStep === index
                          ? 'bg-gold text-navy'
                          : 'bg-white/20 text-white'
                      }`}>
                        {workflow.step}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">{workflow.title}</h3>
                      <p className="text-xs text-gray-400 mb-2">{workflow.role}</p>
                      <p className="text-sm text-gray-400 line-clamp-1">{workflow.description}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      <ArrowRight className={`w-5 h-5 ${activeStep === index ? 'text-gold' : 'text-gray-600'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step Details */}
          <div>
            <div className="sticky top-20 bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-lg p-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs font-semibold rounded-full">
                  Step {workflowSteps[activeStep].step} of {workflowSteps.length}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                {workflowSteps[activeStep].title}
              </h2>

              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full">
                  {workflowSteps[activeStep].role}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-6">
                {workflowSteps[activeStep].description}
              </p>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">What to do:</h4>
                <ul className="space-y-2">
                  {workflowSteps[activeStep].details.map((detail, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-400">
                      <span className="text-gold">→</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={workflowSteps[activeStep].url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2 px-4 bg-gold hover:bg-gold/90 text-navy font-semibold rounded-lg text-center transition-all text-sm"
              >
                Go to Page →
              </a>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white mb-8">Detailed Timeline</h2>

          <div className="relative">
            {/* Vertical Line */}
            <div className="hidden md:block absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold to-blue-500" />

            <div className="space-y-8">
              {workflowSteps.map((workflow, index) => (
                <div key={workflow.step} className="md:ml-20">
                  <div className="flex gap-4 items-start">
                    {/* Timeline Dot */}
                    <div className="hidden md:flex absolute -left-2 top-2 w-14 h-14 rounded-full items-center justify-center bg-navy border-2 border-gold">
                      <span className="text-gold font-bold">{workflow.step}</span>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{workflow.title}</h3>
                          <p className="text-xs text-gray-400">{workflow.role}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full">
                          {index + 1}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm mb-4">{workflow.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {workflow.details.map((detail, idx) => (
                          <div key={idx} className="flex gap-2 text-xs text-gray-400">
                            <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6">
            <div className="flex gap-3 mb-3">
              <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <h3 className="font-semibold text-white">3-Day Hold Period</h3>
            </div>
            <p className="text-yellow-200 text-sm">
              After payment verification, there's a 3-day hold period before admin can release funds. This protects both parties.
            </p>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6">
            <div className="flex gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <h3 className="font-semibold text-white">Platform Fee</h3>
            </div>
            <p className="text-blue-200 text-sm">
              A 5-10% platform fee is deducted from the payment amount. Check your .env for exact percentage.
            </p>
          </div>

          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
            <div className="flex gap-3 mb-3">
              <DollarSign className="w-6 h-6 text-green-400 flex-shrink-0" />
              <h3 className="font-semibold text-white">Payment Verification</h3>
            </div>
            <p className="text-green-200 text-sm">
              Use Razorpay Order ID, Payment ID, and Signature to verify payments. All three are required.
            </p>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0" />
              <h3 className="font-semibold text-white">Ratings & Reviews</h3>
            </div>
            <p className="text-purple-200 text-sm">
              Students rate projects after payment is released. Ratings help maintain quality and trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentWorkflowPage;
