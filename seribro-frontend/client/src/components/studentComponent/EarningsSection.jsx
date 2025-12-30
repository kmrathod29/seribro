// frontend/src/components/studentComponent/EarningsSection.jsx
// EarningsSection Component - Display earnings and ratings in student profile

import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RatingDisplay from '../RatingDisplay';
import RatingsModal from '../RatingsModal';
import { getStudentEarnings, getStudentRatings } from '../../apis/studentEarningsApi';

const EarningsSection = ({ completedProjects = 0 }) => {
    const navigate = useNavigate();
    const [earnings, setEarnings] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingsModalOpen, setRatingsModalOpen] = useState(false);

    useEffect(() => {
        loadEarningsAndRatings();
    }, []);

    const loadEarningsAndRatings = async () => {
        try {
            setLoading(true);

            // Fetch earnings
            try {
                const earningsData = await getStudentEarnings();
                setEarnings(earningsData);
            } catch (err) {
                console.log('Error loading earnings:', err);
            }

            // Fetch ratings
            try {
                const ratingsData = await getStudentRatings();
                setRatings(ratingsData || []);
            } catch (err) {
                console.log('Error loading ratings:', err);
                setRatings([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const hasEarnings = completedProjects > 0;
    
    const {
        totalEarned = 0,
        completedProjects: completedProjectsCount = 0,
    } = earnings?.summary || {};

    const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
        : 0;

    if (!hasEarnings) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                <AlertCircle className="text-amber-400 mx-auto mb-4" size={40} />
                <h3 className="text-white text-lg font-semibold mb-2">Complete your first project to see earnings & ratings</h3>
                <p className="text-gray-400">Once you complete a project, your earnings and ratings will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Earnings Summary */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp size={24} className="text-gold" />
                        Earnings & Ratings
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Total Earned */}
                    <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-400 text-sm font-semibold mb-1">Total Earned</p>
                        <p className="text-2xl font-bold text-gold">₹{totalEarned.toLocaleString()}</p>
                    </div>

                    {/* Completed Projects */}
                    <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-400 text-sm font-semibold mb-1">Projects Completed</p>
                        <p className="text-2xl font-bold text-green-400">{completedProjectsCount}</p>
                    </div>
                </div>

                {/* Link to Detailed Earnings */}
                <button
                    onClick={() => navigate('/student/earnings')}
                    className="w-full py-2 px-4 bg-gold/20 hover:bg-gold/30 text-gold font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                    View Detailed Earnings
                    <ArrowRight size={18} />
                </button>
            </div>

            {/* Ratings Section */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Star size={24} className="text-gold" />
                        Your Ratings
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
                            View All Ratings
                            <ArrowRight size={18} />
                        </button>
                    </>
                ) : (
                    <p className="text-gray-400 text-center py-4">No ratings yet. Complete projects to start receiving ratings!</p>
                )}
            </div>

            {/* Ratings Modal */}
            <RatingsModal 
                isOpen={ratingsModalOpen}
                onClose={() => setRatingsModalOpen(false)}
                ratings={ratings}
                averageRating={averageRating}
                totalRatings={ratings.length}
                userType="student"
            />
        </div>
    );
};

export default EarningsSection;
