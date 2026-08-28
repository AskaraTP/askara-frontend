'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.admin.login({ email, password });
      if (res.token) {
        login(res.token, res.user || { email, name: 'Administrator' });
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Column: Brand & Logo */}
      <div className="hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-slate-950 text-white relative">
        {/* Top-Left Logo */}
        <div>
          <Link href="/" className="inline-block">
            <img
              src="/images/logo.png"
              alt="PT Askara Tekno Pangan"
              className="h-10 brightness-0 invert object-contain"
            />
          </Link>
        </div>

        {/* Center Text */}
        <div className="space-y-2">
          <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-400 block">
            Portal
          </span>
          <h1 className="text-2xl font-bold text-white">
            PT Askara Tekno Pangan
          </h1>
          <p className="text-xs text-slate-400 max-w-sm">
            Authorized administrative management system for laboratory instruments and food quality solutions.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="text-xs text-slate-600">
          <p>© {new Date().getFullYear()} PT Askara Tekno Pangan. All rights reserved.</p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-4">
            <Link href="/" className="inline-block mb-2">
              <img
                src="/images/logo.png"
                alt="PT Askara Tekno Pangan"
                className="h-9 mx-auto object-contain"
              />
            </Link>
          </div>

          {/* Form Header */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign In
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              Enter your administrative credentials to manage products and content.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-slate-200 text-slate-900 text-xs sm:text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                  placeholder="admin@askara.co.id"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-slate-200 text-slate-900 text-xs sm:text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-5 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer inside right column */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-end text-xs text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
