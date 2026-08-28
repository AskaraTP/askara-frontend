'use client';

import React from 'react';
import { useLanguage } from '@/i18n/context';
import {
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Clock,
} from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();

  const getWhatsAppUrl = () => {
    const text = encodeURIComponent(
      `Halo PT Askara Tekno Pangan, saya ingin berkonsultasi mengenai kebutuhan instrumen/analisis laboratorium.`
    );
    return `https://wa.me/62811712908?text=${text}`;
  };

  return (
    <div className="pt-24 lg:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top Header */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-16">
          {/* Left Details */}
          <div className="lg:col-span-6 space-y-7">
            <div>
              <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600 mb-2.5 block">
                {t.contact.badge}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {t.contact.title}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.contact.subtitle}
              </p>
            </div>

            <div className="w-12 h-0.5 bg-brand-500 rounded-sm" />

            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">
                PT Askara Tekno Pangan
              </h2>

              <div className="space-y-3.5 text-slate-600 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold mb-0.5">{t.contact.headOffice}</strong>
                    <span>{t.footer.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold mb-0.5">{t.contact.emailInquiries}</strong>
                    <a href="mailto:info@askarateknopangan.co.id" className="text-brand-600 hover:underline">
                      info@askarateknopangan.co.id
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold mb-0.5">{t.contact.phoneWhatsApp}</strong>
                    <a href="tel:+62811712908" className="text-brand-600 hover:underline">
                      +62 811 712 908
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold mb-0.5">{t.contact.operationalHours}</strong>
                    <span>{t.contact.operationalHoursValue}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t.contact.whatsappDirect}
                </a>
              </div>
            </div>
          </div>

          {/* Right Google Map */}
          <div className="lg:col-span-6">
            <div className="w-full h-[400px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
              <iframe
                src="https://www.google.com/maps?q=Biosystems+Indonesia&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Biosystems Indonesia Location Map"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
