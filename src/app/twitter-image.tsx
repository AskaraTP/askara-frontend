import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export const alt = 'PT Askara Tekno Pangan - Solusi Laboratorium & Kualitas Pangan';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  let logoBase64 = '';
  try {
    const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public/images/logo.png'));
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (err) {
    console.error('Error loading logo for twitter image:', err);
  }

  return new ImageResponse(
    (
      <div
        tw="w-full h-full flex flex-col justify-between p-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white relative font-sans"
      >
        {/* Top Header Bar */}
        <div tw="flex items-center justify-between w-full">
          {/* Logo Container Card */}
          <div tw="flex items-center bg-white px-7 py-3 rounded-2xl shadow-2xl border border-white/90">
            {logoBase64 ? (
              <img
                src={logoBase64}
                alt="PT Askara Tekno Pangan"
                tw="h-12 object-contain"
              />
            ) : (
              <span tw="text-2xl font-extrabold text-orange-500">
                ASKARA
              </span>
            )}
          </div>

          {/* Official Partner Badge */}
          <div tw="flex items-center bg-orange-500/15 border border-orange-500/40 rounded-full px-6 py-2.5 shadow-lg">
            <div tw="w-2.5 h-2.5 rounded-full bg-orange-500 mr-3" />
            <span tw="text-orange-400 text-base font-bold tracking-wider uppercase">
              Distributor Resmi BioSystems
            </span>
          </div>
        </div>

        {/* Center Main Headline & Description */}
        <div tw="flex flex-col my-auto">
          <h1 tw="text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
            PT Askara Tekno Pangan
          </h1>
          <p tw="text-2xl text-slate-300 leading-normal max-w-4xl font-normal">
            Solusi Terpercaya Instrumen Otomatis Analisis Pangan, Reagen Kimia, Rapid Test Allergen & IPAL Industri di Indonesia
          </p>
        </div>

        {/* Bottom Feature Tags & Domain Badge */}
        <div tw="flex items-center justify-between w-full">
          {/* Feature Pills */}
          <div tw="flex items-center">
            <div tw="bg-white/10 border border-white/15 text-slate-100 px-5 py-2.5 rounded-xl text-base font-semibold mr-3 shadow-sm">
              BioSystems Y15
            </div>
            <div tw="bg-white/10 border border-white/15 text-slate-100 px-5 py-2.5 rounded-xl text-base font-semibold mr-3 shadow-sm">
              Rapid Test Allergen
            </div>
            <div tw="bg-white/10 border border-white/15 text-slate-100 px-5 py-2.5 rounded-xl text-base font-semibold mr-3 shadow-sm">
              Water RO System
            </div>
            <div tw="bg-white/10 border border-white/15 text-slate-100 px-5 py-2.5 rounded-xl text-base font-semibold shadow-sm">
              IPAL Industri
            </div>
          </div>

          {/* Website Domain Pill */}
          <div tw="flex items-center bg-slate-900/90 border border-white/15 rounded-xl px-5 py-2.5 shadow-sm">
            <div tw="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5" />
            <span tw="text-slate-300 text-base font-semibold">
              askara.co.id
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
