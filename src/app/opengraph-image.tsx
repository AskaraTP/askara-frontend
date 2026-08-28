import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export const alt = 'PT Askara Tekno Pangan';
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
    console.error('Error loading logo for opengraph image:', err);
  }

  return new ImageResponse(
    (
      <div
        tw="w-full h-full flex items-center justify-center bg-white p-16"
      >
        {logoBase64 ? (
          <img
            src={logoBase64}
            alt="PT Askara Tekno Pangan"
            tw="w-[420px] object-contain"
          />
        ) : (
          <span tw="text-4xl font-bold text-orange-500">
            PT Askara Tekno Pangan
          </span>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
