'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, getStoredUser } from '@/lib/api';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    role: 'Distributor' // default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getStoredUser()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, organizationName, role } = formData;
    
    if (!name || !email || !password || !organizationName || !role) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.auth.signup(name, email, password, organizationName, role);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg glass-card p-10 rounded-2xl border border-gray-800 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-widest cursor-pointer">
              WEXA
            </span>
          </Link>
          <h2 className="text-xl font-bold mt-4 text-white">Create your organization</h2>
          <p className="text-sm text-gray-400 mt-1">Register as a Distributor or Manufacturer</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={loading}
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="organizationName">
              Organization Name
            </label>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              required
              disabled={loading}
              value={formData.organizationName}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
              placeholder="e.g. Acme Distributors LLC"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              disabled={loading}
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Select Organization Role
            </label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <label className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${
                formData.role === 'Distributor'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-gray-800 bg-gray-900/20 text-gray-400 hover:border-gray-700'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="Distributor"
                  checked={formData.role === 'Distributor'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-base font-bold">Distributor</span>
                <span className="text-xxs mt-1 text-center text-gray-500">I purchase and manage products</span>
              </label>

              <label className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${
                formData.role === 'Manufacturer'
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-gray-800 bg-gray-900/20 text-gray-400 hover:border-gray-700'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="Manufacturer"
                  checked={formData.role === 'Manufacturer'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-base font-bold">Manufacturer</span>
                <span className="text-xxs mt-1 text-center text-gray-500">I manufacture and sell products</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm transition glow-btn flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating organization...</span>
              </span>
            ) : (
              <span>Get Started</span>
            )}
          </button>
        </form>

        <div className="text-center mt-8 text-sm text-gray-400">
          Already registered?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
            Log in to your account
          </Link>
        </div>
      </div>
    </div>
  );
}
