import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'PT Askara Tekno Pangan - Laboratory Solutions Partner';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        tw="w-full h-full flex flex-col justify-between p-16 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white"
      >
        <div tw="flex items-center">
          <div
            tw="bg-sky-600 text-white px-5 py-2 rounded-lg text-lg font-bold tracking-wider uppercase"
          >
            Official Partner
          </div>
          <div
            tw="ml-4 text-slate-400 text-lg font-semibold tracking-wide"
          >
            BioSystems Distributor Indonesia
          </div>
        </div>

        <div tw="flex flex-col">
          <h1
            tw="text-6xl font-extrabold text-white tracking-tight leading-none mb-4"
          >
            PT Askara Tekno Pangan
          </h1>
          <p
            tw="text-2xl text-slate-300 leading-normal max-w-4xl"
          >
            Dedicated Laboratory Solutions for Food Quality Analysis & Analytical Instruments
          </p>
        </div>

        <div tw="flex items-center">
          <div tw="bg-white/10 border border-white/20 text-slate-100 px-4 py-2 rounded-md text-base font-semibold mr-3">
            BioSystems Y15
          </div>
          <div tw="bg-white/10 border border-white/20 text-slate-100 px-4 py-2 rounded-md text-base font-semibold mr-3">
            Rapid Test Allergen
          </div>
          <div tw="bg-white/10 border border-white/20 text-slate-100 px-4 py-2 rounded-md text-base font-semibold mr-3">
            Water RO System
          </div>
          <div tw="bg-white/10 border border-white/20 text-slate-100 px-4 py-2 rounded-md text-base font-semibold">
            IPAL Industri
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
