'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/context';
import { Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900/80 py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

          <span className="hidden sm:inline text-slate-800">|</span>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} PT Askara Tekno Pangan. {t.footer.rights}
          </p>

          {/* Social Media & Staff Portal */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Social Media (LinkedIn & Instagram) */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.linkedin.com/company/askara-tekno-pangan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800/80 flex items-center justify-center text-slate-400 transition-all duration-200"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <a
                href="https://www.instagram.com/askarateknopangan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800/80 flex items-center justify-center text-slate-400 transition-all duration-200"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            <span className="h-4 w-px bg-slate-800" />

            {/* Staff Portal Access */}
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
              title="Staff Portal Login"
            >
              <span>portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
