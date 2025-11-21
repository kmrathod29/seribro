import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from cookie
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1];

    if (!userData) {
      // User not logged in, redirect to login
      navigate('/login');
      return;
    }

    try {
      const decoded = JSON.parse(decodeURIComponent(userData));
      setCompanyData(decoded);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear cookies
    document.cookie = 'user=; max-age=0; path=/;';
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/seribro_new_logo.png" alt="Seribro" className="w-10 h-10 object-contain" />
            <h1 className="text-2xl font-bold text-navy">Seribro</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors duration-300"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-navy mb-2">Company Dashboard</h2>
          <p className="text-gray-600 mb-8">Welcome to your company dashboard</p>

          {companyData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Company Name</h3>
                <p className="text-2xl font-bold text-navy">{companyData.companyName || 'N/A'}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Email</h3>
                <p className="text-2xl font-bold text-navy break-all">{companyData.email || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Placeholder Content */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary/10 to-navy/10 p-6 rounded-lg border border-primary/20">
              <h3 className="text-lg font-bold text-navy mb-2">Job Postings</h3>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-gray-600 mt-2">Active postings</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-bold text-navy mb-2">Applications</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600 mt-2">New applications</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-bold text-navy mb-2">Students Hired</h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600 mt-2">Total hired</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-semibold">
              ⚠️ Note: This is a placeholder dashboard. Complete functionality coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
