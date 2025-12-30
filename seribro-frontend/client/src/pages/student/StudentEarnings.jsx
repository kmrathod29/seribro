// frontend/src/pages/student/StudentEarnings.jsx
// Student Earnings and Payment History Page

import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader, TrendingUp, DollarSign, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import RatingDisplay from '../../components/RatingDisplay';
import RatingsModal from '../../components/RatingsModal';
import paymentApi from '../../apis/paymentApi';
import { getStudentRatings } from '../../apis/studentEarningsApi';
import toast from 'react-hot-toast';

const StudentEarnings = () => {
    const [earnings, setEarnings] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ratingsModalOpen, setRatingsModalOpen] = useState(false);

    useEffect(() => {
        loadEarningsData();
    }, []);

    const loadEarningsData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch earnings
            const earningsRes = await paymentApi.getStudentEarnings();
            if (earningsRes.success) {
                setEarnings(earningsRes.data);
            } else {
                setError(earningsRes.message || 'Failed to load earnings');
            }

            // Fetch ratings
            try {
                const ratingsData = await getStudentRatings();
                setRatings(ratingsData || []);
            } catch (err) {
                console.log('Ratings fetch error:', err);
                setRatings([]);
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
            console.error('Earnings load error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader className="animate-spin text-gold mx-auto mb-4" size={40} />
                        <p className="text-white text-lg">Loading your earnings...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
                        <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
                        <h2 className="text-white text-xl font-bold mb-2">Error Loading Earnings</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button
                            onClick={loadEarningsData}
                            className="bg-gold hover:bg-yellow-400 text-navy font-semibold px-6 py-2 rounded-lg transition-all duration-300"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const {
        summary = {},
        recentPayments = [],
        monthlyEarnings = []
    } = earnings || {};

    const {
        totalEarned = 0,
        pendingPayments = 0,
        completedProjects = 0,
        availableForWithdrawal = 0
    } = summary || {};

    const hasCompletedProjects = completedProjects > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Earnings & <span className="text-gold">Payment History</span>
                    </h1>
                    <p className="text-gray-300">Track your earnings, payments, and ratings</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Earned */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-semibold">Total Earned</h3>
                            <TrendingUp className="text-gold" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">₹{totalEarned.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-2">From {completedProjects} completed projects</p>
                    </div>

                    {/* Pending Payments */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-semibold">Pending Payments</h3>
                            <Clock className="text-amber-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">₹{pendingPayments.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-2">Awaiting admin release</p>
                    </div>

                    {/* Available for Withdrawal */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-semibold">Available Balance</h3>
                            <DollarSign className="text-green-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">₹{availableForWithdrawal.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-2">Ready to withdraw</p>
                    </div>

                    {/* Completed Projects */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-semibold">Projects Completed</h3>
                            <CheckCircle className="text-green-400" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white">{completedProjects}</p>
                        <p className="text-xs text-gray-400 mt-2">Total completed</p>
                    </div>
                </div>

                {/* Ratings Section */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Your Ratings & Reviews</h2>
                        {ratings.length > 0 && (
                            <button
                                onClick={() => setRatingsModalOpen(true)}
                                className="px-4 py-2 bg-gold hover:bg-yellow-400 text-navy font-semibold rounded-lg transition-all duration-300"
                            >
                                View All Ratings ({ratings.length})
                            </button>
                        )}
                    </div>

                    {ratings.length > 0 ? (
                        <>
                            <RatingDisplay 
                                averageRating={ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length}
                                totalRatings={ratings.length}
                                size="lg"
                                className="mb-6"
                            />
                            <div className="grid gap-4">
                                {ratings.slice(0, 3).map((rating, idx) => (
                                    <div 
                                        key={idx}
                                        className="bg-white/5 border border-white/10 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`text-lg ${i < rating.rating ? '⭐' : '☆'}`}
                                                        >
                                                            {i < rating.rating ? '★' : '☆'}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="font-bold text-white">{rating.rating}/5</span>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(rating.ratedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{rating.review || 'No review text'}</p>
                                    </div>
                                ))}
                            </div>
                            {ratings.length > 3 && (
                                <button
                                    onClick={() => setRatingsModalOpen(true)}
                                    className="w-full mt-4 py-2 text-gold hover:text-yellow-400 font-semibold transition-all duration-300"
                                >
                                    View All {ratings.length} Ratings →
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg mb-2">No ratings yet</p>
                            <p className="text-gray-500">Complete your first project to start receiving ratings</p>
                        </div>
                    )}
                </div>

                {/* Recent Payments Table */}
                {hasCompletedProjects && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Recent Payment History</h2>

                        {recentPayments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Project</th>
                                            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Company</th>
                                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Amount</th>
                                            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
                                            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentPayments.map((payment) => (
                                            <tr 
                                                key={payment._id}
                                                className="border-b border-white/10 hover:bg-white/5 transition-all duration-300"
                                            >
                                                <td className="py-3 px-4">
                                                    <p className="text-white font-semibold">{payment.projectName}</p>
                                                    <p className="text-xs text-gray-400">ID: {payment._id}</p>
                                                </td>
                                                <td className="py-3 px-4 text-gray-300">{payment.companyName}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <p className="text-white font-bold">₹{payment.netAmount.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-400">Gross: ₹{payment.amount.toLocaleString()}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        payment.status === 'released' ? 'bg-green-500/20 text-green-300' :
                                                        payment.status === 'captured' ? 'bg-blue-500/20 text-blue-300' :
                                                        payment.status === 'ready_for_release' ? 'bg-amber-500/20 text-amber-300' :
                                                        'bg-gray-500/20 text-gray-300'
                                                    }`}>
                                                        {payment.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-400 text-sm">
                                                    {new Date(payment.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-400 text-lg">No payment history yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!hasCompletedProjects && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center">
                        <AlertCircle className="text-amber-400 mx-auto mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-white mb-2">No Earnings Yet</h2>
                        <p className="text-gray-400 mb-6">Complete your first project to start earning and receiving ratings</p>
                    </div>
                )}
            </main>

            {/* Ratings Modal */}
            <RatingsModal 
                isOpen={ratingsModalOpen}
                onClose={() => setRatingsModalOpen(false)}
                ratings={ratings}
                averageRating={ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0}
                totalRatings={ratings.length}
                userType="student"
            />

            <Footer />
        </div>
    );
};

export default StudentEarnings;