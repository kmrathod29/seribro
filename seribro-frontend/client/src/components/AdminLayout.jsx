import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Building2,
  FileCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      desc: 'Overview & Statistics',
    },
    {
      label: 'Pending Students',
      path: '/admin/students/pending',
      icon: Users,
      desc: 'Review student profiles',
    },
    {
      label: 'Pending Companies',
      path: '/admin/companies/pending',
      icon: Building2,
      desc: 'Review company profiles',
    },
    {
      label: 'Student Review',
      path: '/admin/student/:id',
      icon: FileCheck,
      desc: 'Detailed student review',
      isDetail: true,
    },
    {
      label: 'Company Review',
      path: '/admin/company/:id',
      icon: FileCheck,
      desc: 'Detailed company review',
      isDetail: true,
    },
  ];

  const isActive = (path, isDetail) => {
    if (isDetail) {
      // For detail routes like /admin/student/:id or /admin/company/:id
      // Check if current path matches the pattern
      if (path.includes('student/:id')) {
        return location.pathname.startsWith('/admin/student/') && !location.pathname.includes('/admin/students');
      }
      if (path.includes('company/:id')) {
        return location.pathname.startsWith('/admin/company/') && !location.pathname.includes('/admin/companies');
      }
      return false;
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Use shared Navbar for admin pages */}
      <Navbar variant="dark" />

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed md:relative left-0 top-16 md:top-0 h-[calc(100vh-4rem)] md:h-screen w-64 bg-gray-900 border-r border-gray-700 shadow-xl transition-transform duration-300 z-30 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-6 space-y-8 overflow-y-auto h-full pb-20">
            {/* Navigation Section */}
            <div>
              <div className="px-4 py-2 mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Management</p>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path, item.isDetail);
                  return (
                    <Link
                      key={item.path}
                      to={item.isDetail ? (item.path.includes('student') ? '/admin/students/pending' : '/admin/companies/pending') : item.path}
                      onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
                        active
                          ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-l-4 border-primary'
                          : 'text-gray-300 hover:bg-gray-800/60 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <Icon
                          size={20}
                          className={`transition-transform duration-300 ${
                            active ? 'text-primary' : 'text-gray-400 group-hover:text-primary'
                          }`}
                        />
                        <div>
                          <p className={`text-sm font-semibold ${active ? 'text-primary' : ''}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-400 hidden md:block">{item.desc}</p>
                        </div>
                      </div>
                      {active && <ChevronRight size={18} className="text-primary" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Stats Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-gold/10 border border-primary/20">
              <p className="text-xs font-bold text-gray-600 uppercase mb-3">Quick Stats</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Active Users</span>
                  <span className="text-lg font-bold text-primary">1,200+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Pending Review</span>
                  <span className="text-lg font-bold text-gold">25</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900/70 border-t border-gray-700 md:hidden">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors">
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden mt-16"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
