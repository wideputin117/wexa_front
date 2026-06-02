'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api, logout, getStoredUser, getStoredTenant } from '@/lib/api';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = getStoredUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }

        // Validate token with backend
        const session = await api.auth.me();
        setUser(session.user);
        setTenant(session.tenant);
        setLoading(false);
      } catch (err) {
        console.error('Session validation failed:', err.message);
        logout();
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-400 font-semibold text-sm tracking-wide">Validating session...</span>
        </div>
      </div>
    );
  }

  const isDistributor = user?.role === 'Distributor';

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f19]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-800/40 glass-panel flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          {/* Sidebar Header */}
          <div className="px-6 py-6 border-b border-gray-800/40">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-widest">
                WEXA
              </span>
            </Link>
            <div className="mt-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-2 flex flex-col">
              <span className="text-xs text-indigo-300 font-bold truncate">{tenant?.name}</span>
              <span className="text-xxs text-gray-400 mt-0.5 uppercase tracking-widest">{tenant?.type}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-4 py-6 space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname === '/dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'
              }`}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/dashboard/products"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname.startsWith('/dashboard/products')
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'
              }`}
            >
              <span>📦</span>
              <span>{isDistributor ? 'My Inventory' : 'Products Catalog'}</span>
            </Link>

            <Link
              href="/dashboard/orders"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname === '/dashboard/orders'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'
              }`}
            >
              <span>📝</span>
              <span>{isDistributor ? 'Purchase Orders' : 'Incoming POs'}</span>
            </Link>

            {isDistributor && (
              <Link
                href="/dashboard/orders/new"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  pathname === '/dashboard/orders/new'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-500/10'
                    : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'
                }`}
              >
                <span>🛒</span>
                <span>Procure Items</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Sidebar Footer (Profile Info & Log Out) */}
        <div className="p-4 border-t border-gray-800/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-900/40 border border-gray-800/40 mb-3">
            <div className="flex flex-col truncate pr-2">
              <span className="text-sm font-bold text-white truncate">{user?.name}</span>
              <span className="text-xxs text-gray-500 truncate">{user?.email}</span>
            </div>
            <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {isDistributor ? 'Dist' : 'Mfg'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-gray-800 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-all font-semibold text-sm text-gray-400 flex items-center justify-center space-x-2"
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Decorative Background Glows inside Dashboard */}
        <div className="absolute top-10 right-10 w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />

        <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
