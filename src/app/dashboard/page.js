'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getStoredUser, getStoredTenant } from '@/lib/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setUser(getStoredUser());
    setTenant(getStoredTenant());

    const fetchStats = async () => {
      try {
        const data = await api.analytics.get();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err.message);
        setError('Could not retrieve dashboard statistics. Ensure your database is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const isDistributor = user?.role === 'Distributor';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-indigo-400">{user?.name}</span>
          </h1>
          <p className="text-gray-400 mt-1">Here is a summary of your organization&apos;s operations.</p>
        </div>

        {isDistributor && (
          <Link
            href="/dashboard/orders/new"
            className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm transition glow-btn text-center shadow-lg shadow-indigo-500/20"
          >
            🛒 Create Purchase Order
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metric Card 1: Spend or Revenue */}
        <div className="glass-card p-6 rounded-2xl border border-gray-800/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-all duration-300" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-2">
            {isDistributor ? 'Total Capital Spent' : 'Gross Platform Revenue'}
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white">
              ${isDistributor ? stats?.totalSpent?.toLocaleString() || '0' : stats?.totalRevenue?.toLocaleString() || '0'}
            </span>
            <span className="text-xs text-indigo-400 font-semibold uppercase">USD</span>
          </div>
          <span className="text-xxs text-gray-500 block mt-2">Aggregated from completed purchase orders</span>
        </div>

        {/* Metric Card 2: Order Volume */}
        <div className="glass-card p-6 rounded-2xl border border-gray-800/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-all duration-300" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-2">
            {isDistributor ? 'Purchase Orders Placed' : 'Purchase Orders Received'}
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white">{stats?.totalOrders || 0}</span>
            <span className="text-xs text-purple-400 font-semibold uppercase">Orders</span>
          </div>
          <span className="text-xxs text-gray-500 block mt-2">Active, pending, and completed orders</span>
        </div>

        {/* Metric Card 3: Stock Alert items */}
        <div className="glass-card p-6 rounded-2xl border border-gray-800/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-all duration-300" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-2">
            Low Stock Alerts
          </span>
          <div className="flex items-baseline space-x-1">
            <span className={`text-3xl font-black ${stats?.lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {stats?.lowStockCount || 0}
            </span>
            <span className="text-xs text-gray-400 font-semibold uppercase ml-1">Products</span>
          </div>
          <span className="text-xxs text-gray-500 block mt-2">
            {stats?.lowStockCount > 0 
              ? 'Immediate replenishment is recommended' 
              : 'All product inventory levels are healthy'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Low Stock Alerts Board (Left/Center Column) */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-gray-800/40 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-gray-800/40 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">⚠️ Stock Replenishment Warnings</h3>
                <p className="text-xxs text-gray-400">Inventory items falling at or below reorder thresholds</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xxs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {stats?.lowStockCount || 0} Alert{stats?.lowStockCount !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="p-6">
              {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead>
                      <tr className="border-b border-gray-800/50 text-gray-500 text-xxs font-bold uppercase tracking-wider">
                        <th className="pb-3">SKU</th>
                        <th className="pb-3">Product Name</th>
                        <th className="pb-3 text-center">On Hand</th>
                        <th className="pb-3 text-center">Min Threshold</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/30">
                      {stats.lowStockProducts.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-800/10 transition-colors">
                          <td className="py-3 font-mono text-indigo-300 font-semibold">{p.sku}</td>
                          <td className="py-3 font-medium text-white">{p.name}</td>
                          <td className="py-3 text-center font-bold text-amber-400">{p.quantity}</td>
                          <td className="py-3 text-center text-gray-500">{p.lowStockThreshold}</td>
                          <td className="py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xxs font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                              {p.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <span className="text-4xl mb-4">🎉</span>
                  <p className="text-gray-400 font-semibold text-sm">Perfect Stock Levels!</p>
                  <p className="text-xs text-gray-500 mt-1">No products are currently under their low stock thresholds.</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-900/20 border-t border-gray-800/40 text-right">
            {isDistributor ? (
              <Link 
                href="/dashboard/orders/new" 
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
              >
                Go to procurement builder &gt;
              </Link>
            ) : (
              <Link 
                href="/dashboard/products" 
                className="text-xs font-bold text-purple-400 hover:text-purple-300 transition"
              >
                Manage product catalog &gt;
              </Link>
            )}
          </div>
        </div>

        {/* Top Selling Products (Manufacturer only) or Recent Orders (Distributor) */}
        <div className="glass-card rounded-2xl border border-gray-800/40 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-gray-800/40">
              <h3 className="text-lg font-bold text-white">
                {isDistributor ? 'Recent Outgoing POs' : '🔥 Top Selling Products'}
              </h3>
              <p className="text-xxs text-gray-400">
                {isDistributor ? 'Last 5 procurement transactions' : 'Aggregated orders in Completed status'}
              </p>
            </div>

            <div className="p-6">
              {isDistributor ? (
                stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentOrders.map((o) => (
                      <div key={o._id} className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/40 hover:border-gray-700/60 transition-all">
                        <div className="flex flex-col truncate pr-2">
                          <span className="text-sm font-bold text-white">{o.poNumber}</span>
                          <span className="text-xxs text-gray-500 truncate">to {o.manufacturer?.name}</span>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-xs font-bold text-white">${o.totalAmount.toFixed(2)}</span>
                          <span className={`text-xxs font-bold mt-1 px-2 py-0.5 rounded-full ${
                            o.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            o.status === 'Approved' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            o.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 text-xs">
                    No purchase orders placed yet.
                  </div>
                )
              ) : (
                stats?.topSelling && stats.topSelling.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topSelling.map((p, idx) => (
                      <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-900/40 border border-gray-800/40">
                        <div className="flex items-center space-x-3 truncate pr-2">
                          <span className="h-6 w-6 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex flex-col truncate">
                            <span className="text-sm font-bold text-white truncate">{p.name}</span>
                            <span className="text-xxs text-gray-500 font-mono">{p._id}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-xs font-bold text-white">{p.totalQuantity} sold</span>
                          <span className="text-xxs text-purple-400 font-semibold">${p.totalRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 text-xs">
                    No items sold yet. Completed POs are required to track revenue.
                  </div>
                )
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-900/20 border-t border-gray-800/40 text-right">
            <Link 
              href="/dashboard/orders" 
              className={`text-xs font-bold ${isDistributor ? 'text-indigo-400 hover:text-indigo-300' : 'text-purple-400 hover:text-purple-300'} transition`}
            >
              View all orders &gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
