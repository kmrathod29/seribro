import React, { useEffect, useState } from 'react';
import AdminAPI from '../../apis/adminApi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMessage } from '../../utils/toastUtils';
import { Bell, X, CheckCircle, AlertCircle, TrendingUp, Users, Building2, Clock, ChevronRight, DollarSign } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import {
  fetchAdminNotifications,
  markNotificationAsRead,
  formatApiError,
} from '../../apis/adminNotificationApi';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Hinglish: Dashboard data load karna
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AdminAPI.get('/dashboard');
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        toast.error(err.response?.data?.message || 'Dashboard load nahi ho paya');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hinglish: Notifications load karna (background refresh)
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      // Add a timeout promise that resolves after 10 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Notification load timeout')), 10000)
      );
      const data = await Promise.race([
        fetchAdminNotifications(),
        timeoutPromise
      ]);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.warn('Notification load warning (non-blocking):', err.message);
      // Don't show error toast - notifications are optional
      // Set empty notifications array so UI doesn't break
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Hinglish: Notification ko list se remove karna
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      toast.success('Notification marked as read');
    } catch (err) {
      const apiError = formatApiError(err);
      toast.error(getMessage(apiError, 'Failed to mark notification as read'));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-primary border-t-gold rounded-full"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    { 
      label: 'Total Students', 
      value: data?.totalStudents || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    { 
      label: 'Total Companies', 
      value: data?.totalCompanies || 0,
      icon: Building2,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    { 
      label: 'Pending Reviews', 
      value: (data?.pendingStudentVerifications || 0) + (data?.pendingCompanyVerifications || 0),
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100'
    },
    { 
      label: 'Total Projects', 
      value: data?.totalProjects || 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    },
  ];

  // Hinglish: Unread notifications count nikalna
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-navy mb-2">
              Welcome Back, <span className="text-primary">Admin</span>
            </h1>
            <p className="text-gray-600">Here's what's happening on Seribro today</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-xl bg-white border-2 border-gray-200 hover:border-primary text-gray-600 hover:text-primary transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-lg animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
                <div className="p-4 border-b bg-gradient-to-r from-navy/5 to-primary/5 flex items-center justify-between">
                  <h3 className="font-bold text-navy text-lg">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="mx-auto mb-2 opacity-50" size={32} />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-gray-900 cursor-pointer transition-all duration-200 border-l-4 ${
                            !notif.isRead 
                              ? 'border-l-primary bg-primary/5' 
                              : 'border-l-transparent'
                          }`}
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-grow">
                              <p className="text-sm font-semibold text-navy">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                              </p>
                              <div className="flex gap-2 mt-3">
                                <span className={`text-xs font-bold capitalize px-3 py-1 rounded-full ${
                                  notif.type === 'student_submission' 
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {notif.type?.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            {!notif.isRead && (
                              <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t bg-gray-50">
                  <button
                    onClick={loadNotifications}
                    className="w-full text-sm font-semibold text-primary hover:text-primary-dark py-2 transition-colors"
                  >
                    Refresh Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group relative bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-transparent overflow-hidden transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <TrendingUp className="text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={20} />
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Management Button */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <button
            onClick={() => navigate('/admin/payments')}
            className="group bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <DollarSign className="w-12 h-12 group-hover:rotate-12 transition-transform duration-300" />
              <div className="text-left">
                <h3 className="font-bold text-xl mb-1">Payment Release Dashboard</h3>
                <p className="text-emerald-100 text-sm">Manage pending payments and release funds</p>
              </div>
              <ChevronRight className="ml-auto w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </button>

          <button
            onClick={() => navigate('/workflow/payments')}
            className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <TrendingUp className="w-12 h-12 group-hover:rotate-12 transition-transform duration-300" />
              <div className="text-left">
                <h3 className="font-bold text-xl mb-1">Payment Workflow Guide</h3>
                <p className="text-purple-100 text-sm">Learn about the complete payment process</p>
              </div>
              <ChevronRight className="ml-auto w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </button>
        </div>

        {/* Recent Pending Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-1">Recent Pending Reviews</h2>
              <p className="text-gray-400 text-sm">Latest submissions waiting for approval</p>
            </div>
            <Link
              to="/admin/students/pending"
              className="px-4 py-2 rounded-lg bg-yellow-400 text-white font-semibold hover:bg-yellow-300 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-navy/5 to-primary/5 border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400">College/Company</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data?.recentPending?.length ? (
                    data.recentPending.map((row, idx) => (
                      <tr
                        key={`${row.type}-${row.id}`}
                        className="hover:bg-gray-900 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            row.type === 'student'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">{row.name}</td>
                        <td className="px-6 py-4 text-gray-400">{row.email}</td>
                        <td className="px-6 py-4 text-gray-400">{row.college || row.company || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {row.submittedAt 
                            ? new Date(row.submittedAt).toLocaleDateString() 
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={row.type === 'student' ? `/admin/student/${row.id}` : `/admin/company/${row.id}`}
                            className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg bg-yellow-400 text-white text-sm font-semibold hover:bg-yellow-300 transition-all duration-200 hover:shadow-lg"
                          >
                            <span>Review</span>
                            <ChevronRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        <Clock className="mx-auto mb-2 opacity-50" size={32} />
                        <p className="font-medium">No pending reviews</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
