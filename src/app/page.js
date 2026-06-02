'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredUser } from '@/lib/api';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="w-full glass-panel border-b border-gray-800/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent tracking-wider">
              WEXA
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Link 
                href="/dashboard" 
                className="px-5 py-2 rounded-xl text-sm font-semibold border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-all glow-btn"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-semibold text-gray-300 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all glow-btn shadow-lg shadow-indigo-500/20"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 flex-grow flex flex-col items-center justify-center text-center relative z-10">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-semibold mb-6">
          <span>✨</span>
          <span>B2B Inventory & Procurement Platform MVP</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-tight">
          B2B Procurement & Inventory,{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Simplified
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          The seamless gateway for Distributors and Manufacturers. Track real-time inventories, manage low-stock thresholds, and instantly create or process automated Purchase Orders.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 w-full max-w-md">
          {user ? (
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-base hover:opacity-95 transition-all glow-btn shadow-xl shadow-indigo-500/10 text-center"
            >
              Access Portal
            </Link>
          ) : (
            <>
              <Link 
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-base hover:opacity-95 transition-all glow-btn shadow-xl shadow-indigo-500/10 text-center"
              >
                Create Account
              </Link>
              <Link 
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold border border-gray-700 bg-gray-800/40 text-gray-200 text-base hover:bg-gray-800/80 transition-all text-center"
              >
                Log In to Wexa
              </Link>
            </>
          )}
        </div>

        {/* Roles Highlight Section */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mt-8">
          {/* Distributor Card */}
          <div className="glass-card p-8 rounded-2xl border border-gray-800/60 text-left flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl font-bold mb-6">
                D
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">For Distributors</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Wants to keep track of their inventory and procurement. Easily monitor low stock levels across products, search manufacturer catalogs, build and issue purchase orders.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <span className="text-indigo-400">✓</span>
                <span>Track own inventory & set stock thresholds</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-indigo-400">✓</span>
                <span>Send Purchase Orders directly to manufacturers</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-indigo-400">✓</span>
                <span>Real-time low stock dashboard alerts</span>
              </li>
            </ul>
          </div>

          {/* Manufacturer Card */}
          <div className="glass-card p-8 rounded-2xl border border-gray-800/60 text-left flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-2xl font-bold mb-6">
                M
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">For Manufacturers</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Manage your product offering, update inventory on hand, and adjust cost or selling prices. Instantly receive, review, and process incoming POs from distributors.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <span className="text-purple-400">✓</span>
                <span>Add, edit, and delete products dynamically</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-400">✓</span>
                <span>Review and Approve/Reject incoming POs</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-400">✓</span>
                <span>Revenue analysis & top-selling product metrics</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-gray-900/60 glass-panel mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>© 2026 Wexa Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-300 transition">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
