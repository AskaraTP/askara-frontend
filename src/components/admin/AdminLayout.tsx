'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  FileText,
  Building2,
  Briefcase,
  SlidersHorizontal,
  Factory,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Info,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm font-medium text-slate-300">Loading Askara Admin...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/homepage', label: 'Homepage Banners & Sliders', icon: SlidersHorizontal },
    { href: '/admin/about', label: 'About Us Content', icon: Info },
    { href: '/admin/industries', label: 'Industries We Serve', icon: Factory },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Layers },
    { href: '/admin/articles', label: 'Articles', icon: FileText },
    { href: '/admin/partners', label: 'Partners / Principals', icon: Building2 },
    { href: '/admin/careers', label: 'Careers', icon: Briefcase },
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen shrink-0 bg-slate-900 text-slate-300 border-r border-slate-800 z-30">
        {/* Brand */}
        <div className="h-16 shrink-0 px-6 flex items-center justify-between border-b border-slate-800">
          <Link href="/" target="_blank" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Askara" className="h-8 brightness-0 invert object-contain" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-colors duration-150 ${
                  active
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile & Logout */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user?.email || 'admin@askara.co.id'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Log Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-slate-900 text-slate-300 flex flex-col z-10">
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
              <img src="/images/logo.png" alt="Askara" className="h-8 brightness-0 invert object-contain" />
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                      active ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3.5 border-t border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-rose-500/10 text-rose-400 font-semibold text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-slate-50">
          <div className="w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
