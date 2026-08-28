'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/context';
import { Menu, X, ChevronDown, Check } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicking outside of language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Do not render public navbar on admin pages
  if (isAdmin) {
    return null;
  }

  const navLinks = [
    { href: '/about', label: t.nav.about },
    { href: '/products', label: t.nav.products },
    { href: '/industries', label: t.nav.industries },
    { href: '/principals', label: t.nav.principals },
    { href: '/articles', label: t.nav.articles },
    { href: '/career', label: t.nav.career },
  ];

  const getLinkClasses = (href: string) => {
    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

    if (isActive) {
      return scrolled
        ? 'text-white font-semibold underline underline-offset-8 decoration-2'
        : isHome
        ? 'text-brand-300 font-semibold underline underline-offset-8 decoration-2'
        : 'text-brand-500 font-semibold underline underline-offset-8 decoration-2';
    }

    if (scrolled) {
      return 'text-white/90 hover:text-white transition-colors duration-200';
    }

    return isHome
      ? 'text-white/90 hover:text-white transition-colors duration-200'
      : 'text-slate-700 hover:text-brand-500 transition-colors duration-200';
  };

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia', short: 'ID' },
    { code: 'en', name: 'English', short: 'EN' },
  ] as const;

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        mobileOpen
          ? isHome
            ? 'bg-slate-950/98 backdrop-blur-md py-4'
            : 'bg-white py-4 border-b border-slate-200'
          : scrolled
          ? 'bg-brand-500/95 backdrop-blur-md shadow-sm py-3.5'
          : isHome
          ? 'bg-transparent py-5'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <img
            src="/images/logo.png"
            alt="PT Askara Tekno Pangan"
            className={`h-9 sm:h-10 object-contain transition-all duration-300 ${
              scrolled || (isHome && mobileOpen) ? 'brightness-0 invert' : ''
            }`}
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium tracking-tight">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={getLinkClasses(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section: Contact + Language Dropdown */}
        <div className="hidden lg:flex items-center gap-3.5">
          {/* Contact Button */}
          <Link
            href="/contact"
            className={`inline-flex items-center justify-center px-4 py-2 rounded-sm text-xs font-semibold tracking-wide transition-colors ${
              scrolled
                ? 'bg-white text-brand-600 hover:bg-slate-50'
                : 'bg-brand-500 hover:bg-brand-600 text-white'
            }`}
          >
            {t.nav.contact}
          </Link>

          {/* Language Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-colors ${
                scrolled
                  ? 'hover:bg-white/15 text-white'
                  : isHome
                  ? 'hover:bg-white/20 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>{currentLang.short}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 opacity-80 transition-transform duration-200 ${
                  langDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-md border border-slate-200 py-1 shadow-md z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLocale(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                      locale === lang.code
                        ? 'bg-brand-50 text-brand-600 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{lang.name}</span>
                    {locale === lang.code && <Check className="w-3.5 h-3.5 text-brand-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden p-2 rounded-md transition-colors ${
            scrolled || (isHome && !mobileOpen)
              ? 'text-white hover:bg-white/10'
              : isHome && mobileOpen
              ? 'text-white hover:bg-white/10'
              : 'text-slate-800 hover:bg-slate-100'
          }`}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer / Modal */}
      {mobileOpen && (
        <div className="lg:hidden mx-4 mt-3 bg-white rounded-sm border border-slate-200/90 p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100dvh-5.5rem)] overflow-y-auto">
          <nav className="flex flex-col gap-1.5 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`py-2.5 px-3.5 rounded-sm text-xs font-bold transition-colors ${
                  pathname.startsWith(link.href) && link.href !== '/'
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs text-center mt-2 transition-colors shadow-xs"
            >
              {t.nav.contact}
            </Link>

            {/* Mobile Language Selector */}
            <div className="pt-4 mt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                {t.nav.language}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLocale(lang.code);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${
                      locale === lang.code
                        ? 'bg-brand-50 border-brand-300 text-brand-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
