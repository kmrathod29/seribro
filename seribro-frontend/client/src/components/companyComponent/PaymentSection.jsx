// frontend/src/components/companyComponent/PaymentSection.jsx
// PaymentSection Component - Display payment history and ratings in company profile

import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Star, AlertCircle, Calendar } from 'lucide-react';
import RatingDisplay from '../RatingDisplay';
import RatingsModal from '../RatingsModal';
import { getCompanyPayments, getCompanyRatings } from '../../apis/companyPaymentsApi';

const PaymentSection = ({ completedProjects = 0 }) => {
    const [payments, setPayments] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingsModalOpen, setRatingsModalOpen] = useState(false);

    useEffect(() => {
        loadPaymentsAndRatings();
    }, []);

    const loadPaymentsAndRatings = async () => {
        try {
            setLoading(true);

            // Fetch payments
            try {
                const paymentsData = await getCompanyPayments();
                setPayments(paymentsData);
            } catch (err) {
                console.log('Error loading payments:', err);
            }

            // Fetch ratings
            try {
                const ratingsData = await getCompanyRatings();
                setRatings(ratingsData || []);
            } catch (err) {
                console.log('Error loading ratings:', err);
                setRatings([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const hasPayments = completedProjects > 0;
    
    const {
        totalSpent = 0,
        completedProjects: completedProjectsCount = 0,
        activeProjects = 0,
    } = payments?.summary || {};

    const recentPayments = payments?.recentPayments || [];

    const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
        : 0;

    if (!hasPayments) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                <AlertCircle className="text-amber-400 mx-auto mb-4" size={40} />
                <h3 className="text-white text-lg font-semibold mb-2">Complete your first project to see payment history & ratings</h3>
                <p className="text-gray-400">Once you complete a project, your payment history and student ratings will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp size={24} className="text-gold" />
                        Payment & Project Summary
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Total Spent */}
                    <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-400 text-sm font-semibold mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-gold">₹{totalSpent.toLocaleString()}</p>
                    </div>

                    {/* Completed Projects */}
                    <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-400 text-sm font-semibold mb-1">Completed Projects</p>
                        <p className="text-2xl font-bold text-green-400">{completedProjectsCount}</p>
                    </div>

                    {/* Active Projects */}
                    <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-400 text-sm font-semibold mb-1">Active Projects</p>
                        <p className="text-2xl font-bold text-blue-400">{activeProjects}</p>
                    </div>
                </div>
            </div>

            {/* Ratings Section */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Star size={24} className="text-gold" />
                        Student Ratings
                    </h3>
                    {ratings.length > 0 && (
                        <button
                            onClick={() => setRatingsModalOpen(true)}
                            className="text-gold hover:text-yellow-400 text-sm font-semibold transition-colors duration-300"
                        >
                            View All ({ratings.length})
                        </button>
                    )}
                </div>

                {ratings.length > 0 ? (
                    <>
                        <RatingDisplay 
                            averageRating={averageRating}
                            totalRatings={ratings.length}
                            size="md"
                            className="mb-4"
                        />
                        <button
                            onClick={() => setRatingsModalOpen(true)}
                            className="w-full py-2 px-4 bg-gold/20 hover:bg-gold/30 text-gold font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            View All Student Ratings
                            <ArrowRight size={18} />
                        </button>
                    </>
                ) : (
                    <p className="text-gray-400 text-center py-4">No ratings yet. Complete projects to start receiving student ratings!</p>
                )}
            </div>

            {/* Recent Payments */}
            {recentPayments.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Transactions (Last 3)</h3>
                    <div className="space-y-3">
                        {recentPayments.slice(0, 3).map((payment) => (
                            <div 
                                key={payment._id}
                                className="bg-white/10 rounded-lg p-4 border border-white/10 hover:bg-white/20 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-white font-semibold">{payment.projectName}</p>
                                        <p className="text-sm text-gray-400">Student: {payment.studentName}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        payment.status === 'released' ? 'bg-green-500/20 text-green-300' :
                                        payment.status === 'captured' ? 'bg-blue-500/20 text-blue-300' :
                                        payment.status === 'ready_for_release' ? 'bg-amber-500/20 text-amber-300' :
                                        'bg-gray-500/20 text-gray-300'
                                    }`}>
                                        {payment.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar size={14} />
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </div>
                                    <p className="text-gold font-bold">₹{payment.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ratings Modal */}
            <RatingsModal 
                isOpen={ratingsModalOpen}
                onClose={() => setRatingsModalOpen(false)}
                ratings={ratings}
                averageRating={averageRating}
                totalRatings={ratings.length}
                userType="company"
            />
        </div>
    );
};

export default PaymentSection;
