'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, Info } from 'lucide-react';
import { api, resolveImageUrl } from '@/lib/api';
import { formatErrorMessage } from '@/lib/errorHandler';
import { useUI } from '@/context/UIContext';

interface PresetImage {
  label: string;
  path: string;
}

interface AdminImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  presets?: PresetImage[];
  placeholder?: string;
  className?: string;
  recommendedRatio?: string;
  recommendedFormat?: string;
}

const DEFAULT_PRESETS: PresetImage[] = [
  { label: 'BioSystems Y15', path: '/images/y15.png' },
  { label: 'Gluten Test Kit', path: '/images/gluten.png' },
  { label: 'Histamine Strip', path: '/images/histamine.png' },
  { label: 'RO Water Header', path: '/images/header.png' },
  { label: 'Askara Logo', path: '/images/logo.png' },
];

export default function AdminImageUpload({
  label = 'Image Asset',
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  placeholder = '/images/... or upload',
  className = '',
  recommendedRatio,
  recommendedFormat,
}: AdminImageUploadProps) {
  const { toast } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await api.admin.uploadImage(file);
      if (result.url) {
        onChange(result.url);
        toast('Image uploaded successfully', 'success');
      }
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to upload image'), 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          {label}
        </label>
        {recommendedRatio && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
            <Info className="w-3 h-3 text-brand-600" />
            Rasio Ideal: {recommendedRatio}
          </span>
        )}
      </div>

      {recommendedRatio && (
        <div className="flex items-start gap-2 px-3 py-2 rounded bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Rekomendasi Tampilan:</span> Gunakan rasio <strong>{recommendedRatio}</strong> agar gambar tampil padat, tajam, dan tidak ada ruang kosong di web.{recommendedFormat ? ` Format ideal: ${recommendedFormat}.` : ''}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-12 gap-3.5 items-center">
        {/* Preview Frame */}
        <div className="sm:col-span-4 h-32 rounded-md bg-white border-2 border-dashed border-slate-200 flex items-center justify-center p-2 relative overflow-hidden">
          {value ? (
            <>
              <img
                src={resolveImageUrl(value)}
                alt="Preview"
                className="max-h-full max-w-full object-contain rounded-sm"
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors shadow-xs"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="text-center text-slate-400">
              <ImageIcon className="w-6 h-6 mx-auto text-slate-300 mb-1" />
              <p className="text-[11px]">No Image Selected</p>
            </div>
          )}
        </div>

        {/* Upload Button & Manual URL */}
        <div className="sm:col-span-8 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 rounded-md border border-slate-200 hover:border-brand-300 bg-white text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4 text-brand-500" />
            {uploading ? 'Uploading Image...' : 'Upload Image from Computer'}
          </button>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
          />

          {presets.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-1">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(preset.path)}
                    className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold border transition-colors ${
                      value === preset.path
                        ? 'bg-brand-50 border-brand-400 text-brand-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
