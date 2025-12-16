// src/components/NotificationBell.jsx
// Hinglish: Notification bell component for navbar

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../apis/notificationApi';

/**
 * Hinglish: Notification bell component
 * - Bell icon dikhata hai
 * - Unread count badge dikhata hai
 * - Dropdown mein recent notifications
 * - Mark as read functionality
 */
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hinglish: Component mount par notifications fetch karo
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Hinglish: 30 seconds mein auto-refresh
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Hinglish: Notifications fetch karo
   */
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(1, 5);
      if (response.success) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hinglish: Unread count fetch karo
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  /**
   * Hinglish: Notification ko read mark karo
   */
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  /**
   * Hinglish: Sab unread notifications ko read mark karo
   */
  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  /**
   * Hinglish: Notification delete karo
   */
  const handleDelete = async (notificationId) => {
    try {
      const response = await deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <div className="relative">
      {/* Hinglish: Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        // Use a brighter/yellow color so the bell is visible on dark navbar backgrounds
        className="relative p-2 color-gray-700 hover:text-yellow-400 transition-colors"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Hinglish: Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between sticky top-0">
            <h3 className="text-white font-semibold">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div>
            {loading && (
              <div className="p-4 text-center text-gray-400">
                Loading...
              </div>
            )}

            {!loading && error && (
              <div className="p-4 text-center text-red-400">
                {error}
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                No notifications yet
              </div>
            )}

            {!loading && notifications.length > 0 && (
              <>
                {notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`border-b border-gray-700 p-4 hover:bg-gray-800 transition-colors ${
                      !notification.isRead ? 'bg-gray-800/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className={`text-sm flex-1 ${
                        notification.isRead ? 'text-gray-400' : 'text-gray-200 font-medium'
                      }`}>
                        {notification.message}
                      </p>
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="text-gray-500 hover:text-red-400 ml-2"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-800 border-t border-gray-700 p-4 flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Mark All as Read
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
