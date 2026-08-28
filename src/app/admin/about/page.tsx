'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api, resolveImageUrl } from '@/lib/api';
import { formatErrorMessage } from '@/lib/errorHandler';
import { AboutContent, AboutSlideImage, AboutReason } from '@/types';
import {
  Save,
  ExternalLink,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  ShieldCheck,
  Award,
  Wrench,
  Headphones,
  Zap,
  CheckCircle2,
  Microscope,
  Star,
  HeartHandshake,
  Truck,
  Building2,
  Users,
  Images,
  Edit3,
  UploadCloud,
  X,
  Info,
} from 'lucide-react';

const ICON_OPTIONS = [
  { name: 'ShieldCheck', label: 'Shield', icon: ShieldCheck },
  { name: 'Award', label: 'Award', icon: Award },
  { name: 'Wrench', label: 'Tools', icon: Wrench },
  { name: 'Headphones', label: 'Support', icon: Headphones },
  { name: 'Zap', label: 'Fast', icon: Zap },
  { name: 'CheckCircle2', label: 'Check', icon: CheckCircle2 },
  { name: 'Microscope', label: 'Lab', icon: Microscope },
  { name: 'Star', label: 'Quality', icon: Star },
  { name: 'HeartHandshake', label: 'Partner', icon: HeartHandshake },
  { name: 'Truck', label: 'Delivery', icon: Truck },
  { name: 'Building2', label: 'Company', icon: Building2 },
  { name: 'Users', label: 'Team', icon: Users },
];

const PRESETS = [
  { label: 'BioSystems Y15', path: '/images/y15.png' },
  { label: 'Gluten Test Kit', path: '/images/gluten.png' },
  { label: 'Histamine Strip', path: '/images/histamine.png' },
  { label: 'RO Water Header', path: '/images/header.png' },
  { label: 'Askara Logo', path: '/images/logo.png' },
];

const DEFAULT_ABOUT: AboutContent = {
  hero_badge_en: 'About PT Askara Tekno Pangan',
  hero_badge_id: 'Tentang PT Askara Tekno Pangan',
  hero_title_en: 'Empowering Food Quality Laboratories in Indonesia',
  hero_title_id: 'Memajukan Laboratorium Kualitas Pangan di Indonesia',
  hero_subtitle_en: 'Through trusted laboratory technology, professional support, and reliable solutions for the food and beverage industry.',
  hero_subtitle_id: 'Melalui teknologi laboratorium terpercaya, dukungan profesional, dan solusi handal untuk industri makanan & minuman.',

  who_we_are_tag_en: 'Who We Are',
  who_we_are_tag_id: 'Tentang Kami',
  who_we_are_heading_en: 'Your Trusted Partner for Food Quality Analysis',
  who_we_are_heading_id: 'Mitra Terpercaya Anda untuk Analisis Kualitas Pangan',
  who_we_are_p1_en: 'PT Askara Tekno Pangan is an Indonesian laboratory solution provider specializing in food quality analysis and analytical solutions.',
  who_we_are_p1_id: 'PT Askara Tekno Pangan adalah penyedia solusi laboratorium di Indonesia yang berfokus pada analisis mutu pangan dan solusi analitis.',
  who_we_are_p2_en: 'Established in 2019, Askara delivers reliable analytical instruments, reagents, and professional support to help laboratories achieve accurate and efficient testing performance.',
  who_we_are_p2_id: 'Didirikan pada tahun 2019, Askara menghadirkan instrumen analitis handal, reagen, serta dukungan profesional untuk membantu laboratorium mencapai performa pengujian yang akurat dan efisien.',
  who_we_are_points_en: [
    'Authorized distributor of BioSystems Food & Beverage',
    'Certified application scientists & field engineers across Indonesia',
    'Full warranty, calibration, and preventive maintenance support',
  ],
  who_we_are_points_id: [
    'Distributor resmi BioSystems Food & Beverage',
    'Application scientist & field engineer tersertifikasi di seluruh Indonesia',
    'Dukungan garansi penuh, kalibrasi, dan pemeliharaan preventif',
  ],
  who_we_are_images: [
    {
      image: '/images/y15.png',
      caption_en: 'BioSystems Y15 Automated Photometric Analyzer',
      caption_id: 'BioSystems Y15 Automated Photometric Analyzer',
      alt_text: 'BioSystems Y15 Analyzer',
    },
    {
      image: '/images/gluten.png',
      caption_en: 'Gluten & Allergen Rapid Testing Solution',
      caption_id: 'Solusi Uji Cepat Gluten & Alergen',
      alt_text: 'Gluten Test Kit',
    },
  ],

  why_choose_badge_en: 'Why Choose Askara',
  why_choose_badge_id: 'Mengapa Memilih Askara',
  why_choose_heading_en: 'Built for the Food & Beverage Industry',
  why_choose_heading_id: 'Dirancang untuk Industri Makanan & Minuman',
  why_choose_reasons: [
    {
      icon: 'ShieldCheck',
      title_en: 'Food & Beverage Specialist',
      title_id: 'Spesialis Makanan & Minuman',
      desc_en: 'Dedicated laboratory solutions for quality analysis and testing in the food and beverage industry.',
      desc_id: 'Solusi laboratorium berdedikasi untuk analisis mutu dan pengujian di industri pangan & minuman.',
    },
    {
      icon: 'Award',
      title_en: 'Official BioSystems Distributor',
      title_id: 'Distributor Resmi BioSystems',
      desc_en: 'Providing trusted analytical technology solutions across laboratories in Indonesia.',
      desc_id: 'Menyediakan solusi teknologi analitis terpercaya untuk laboratorium di seluruh Indonesia.',
    },
    {
      icon: 'Wrench',
      title_en: 'Installation & Training',
      title_id: 'Instalasi & Pelatihan',
      desc_en: 'Professional installation, application support, and user training by experienced specialists.',
      desc_id: 'Instalasi profesional, dukungan aplikasi, dan pelatihan pengguna oleh spesialis berpengalaman.',
    },
    {
      icon: 'Headphones',
      title_en: 'Technical Support',
      title_id: 'Dukungan Teknis Handal',
      desc_en: 'Reliable after-sales service and scheduled maintenance to support long-term laboratory operations.',
      desc_id: 'Layanan purna jual responsif dan pemeliharaan berkala untuk mendukung kelancaran operasional laboratorium.',
    },
  ],
};

export default function AdminAboutManagementPage() {
  const { toast, confirm } = useUI();
  const [activeTab, setActiveTab] = useState<'who_we_are' | 'why_choose' | 'hero'>('who_we_are');
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [formData, setFormData] = useState<AboutContent>(DEFAULT_ABOUT);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAdminAboutContent();
      if (data) {
        setFormData({
          ...DEFAULT_ABOUT,
          ...data,
          who_we_are_points_en: data.who_we_are_points_en || DEFAULT_ABOUT.who_we_are_points_en,
          who_we_are_points_id: data.who_we_are_points_id || DEFAULT_ABOUT.who_we_are_points_id,
          who_we_are_images: data.who_we_are_images && data.who_we_are_images.length > 0 ? data.who_we_are_images : DEFAULT_ABOUT.who_we_are_images,
          why_choose_reasons: data.why_choose_reasons && data.why_choose_reasons.length > 0 ? data.why_choose_reasons : DEFAULT_ABOUT.why_choose_reasons,
        });
      }
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to load About content'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.admin.updateAdminAboutContent(formData);
      if (updated) {
        setFormData((prev) => ({ ...prev, ...updated }));
      }
      toast('Perubahan berhasil disimpan!', 'success');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Gagal menyimpan perubahan'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- Image Upload Handlers ---
  const handleUploadImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(index);
    try {
      const result = await api.admin.uploadImage(file);
      if (result.url) {
        const updated = [...formData.who_we_are_images];
        updated[index] = { ...updated[index], image: result.url };
        setFormData({ ...formData, who_we_are_images: updated });
        toast('Gambar berhasil diunggah', 'success');
      }
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Gagal mengunggah gambar'), 'error');
    } finally {
      setUploadingIdx(null);
    }
  };

  // --- Image Slide Actions ---
  const handleAddSlide = () => {
    const newSlide: AboutSlideImage = {
      image: '/images/y15.png',
      caption_id: 'BioSystems Y15 Analyzer',
      caption_en: 'BioSystems Y15 Analyzer',
      alt_text: 'Askara Image',
    };
    setFormData((prev) => ({
      ...prev,
      who_we_are_images: [...(prev.who_we_are_images || []), newSlide],
    }));
  };

  const handleRemoveSlide = async (idx: number) => {
    const ok = await confirm({
      title: 'Hapus Gambar',
      message: 'Hapus gambar ini dari slider Who We Are?',
      confirmText: 'Hapus',
      isDestructive: true,
    });
    if (ok) {
      setFormData((prev) => ({
        ...prev,
        who_we_are_images: prev.who_we_are_images.filter((_, i) => i !== idx),
      }));
    }
  };

  const handleMoveSlide = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= (formData.who_we_are_images?.length || 0)) return;
    setFormData((prev) => {
      const arr = [...(prev.who_we_are_images || [])];
      const temp = arr[idx];
      arr[idx] = arr[targetIdx];
      arr[targetIdx] = temp;
      return { ...prev, who_we_are_images: arr };
    });
  };

  // --- Bullet Points Actions ---
  const handleAddPoint = () => {
    setFormData((prev) => ({
      ...prev,
      who_we_are_points_id: [...(prev.who_we_are_points_id || []), 'Poin keunggulan baru'],
      who_we_are_points_en: [...(prev.who_we_are_points_en || []), 'New advantage highlight'],
    }));
  };

  const handleRemovePoint = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      who_we_are_points_id: prev.who_we_are_points_id.filter((_, i) => i !== idx),
      who_we_are_points_en: prev.who_we_are_points_en.filter((_, i) => i !== idx),
    }));
  };

  // --- Reason Cards Actions ---
  const handleAddReason = () => {
    const newReason: AboutReason = {
      icon: 'ShieldCheck',
      title_id: 'Keunggulan Baru',
      title_en: 'New Advantage',
      desc_id: 'Penjelasan keunggulan layanan atau produk.',
      desc_en: 'Description of the key advantage.',
    };
    setFormData((prev) => ({
      ...prev,
      why_choose_reasons: [...(prev.why_choose_reasons || []), newReason],
    }));
  };

  const handleRemoveReason = async (idx: number) => {
    const ok = await confirm({
      title: 'Hapus Kartu',
      message: 'Hapus kartu keunggulan ini?',
      confirmText: 'Hapus',
      isDestructive: true,
    });
    if (ok) {
      setFormData((prev) => ({
        ...prev,
        why_choose_reasons: prev.why_choose_reasons.filter((_, i) => i !== idx),
      }));
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Kelola Halaman About">
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-500">Memuat konten About...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Kelola Halaman About">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-900">Kelola Konten Halaman About</h1>
            <p className="text-xs text-slate-500 mt-0.5">Ubah teks, gambar slider, poin keunggulan, dan kartu Why Choose.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200">
              <button
                type="button"
                onClick={() => setLang('id')}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                  lang === 'id' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                  lang === 'en' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                En
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>

        {/* Clean Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('who_we_are')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-colors ${
              activeTab === 'who_we_are'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Who We Are & Slider
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('why_choose')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-colors ${
              activeTab === 'why_choose'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Why Choose Askara
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-colors ${
              activeTab === 'hero'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            Hero Header
          </button>
        </div>

        {/* TAB 1: WHO WE ARE */}
        {activeTab === 'who_we_are' && (
          <div className="space-y-6">
            {/* Section 1: Intro Text */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                Teks Who We Are ({lang === 'id' ? 'Bahasa Indonesia' : 'English'})
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tag / Badge ({lang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={lang === 'id' ? formData.who_we_are_tag_id || '' : formData.who_we_are_tag_en || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [lang === 'id' ? 'who_we_are_tag_id' : 'who_we_are_tag_en']: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-md bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
                    placeholder={lang === 'id' ? 'TENTANG KAMI' : 'WHO WE ARE'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Heading ({lang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={lang === 'id' ? formData.who_we_are_heading_id || '' : formData.who_we_are_heading_en || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [lang === 'id' ? 'who_we_are_heading_id' : 'who_we_are_heading_en']: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-md bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
                    placeholder="Judul utama Who We Are"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paragraf 1 ({lang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={lang === 'id' ? formData.who_we_are_p1_id || '' : formData.who_we_are_p1_en || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [lang === 'id' ? 'who_we_are_p1_id' : 'who_we_are_p1_en']: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-md bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none resize-none"
                  placeholder="Deskripsi awal..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paragraf 2 ({lang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={lang === 'id' ? formData.who_we_are_p2_id || '' : formData.who_we_are_p2_en || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [lang === 'id' ? 'who_we_are_p2_id' : 'who_we_are_p2_en']: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-md bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none resize-none"
                  placeholder="Deskripsi lanjutan..."
                />
              </div>
            </div>

            {/* Section 2: Multi-Image Slider (Clean Linear Layout) */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                    Gambar Slider Who We Are ({formData.who_we_are_images?.length || 0})
                  </h2>
                  <p className="text-xs text-slate-500">Kelola gambar dan caption yang akan tampil sebagai slider/carousel di halaman About.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Slide
                </button>
              </div>

              <div className="flex items-start gap-2 px-3 py-2 rounded bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Tips Gambar Slider:</span> Gunakan format <strong>PNG transparan</strong> atau foto resolusi tajam berasio <strong>4:3 atau 16:10</strong> agar gambar mengisi area tampilan dengan elegan.
                </div>
              </div>

              <div className="space-y-4">
                {formData.who_we_are_images?.map((slide, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between"
                  >
                    {/* Left: Thumbnail & Upload */}
                    <div className="flex items-center gap-3.5 shrink-0">
                      <div className="w-24 h-24 rounded-md bg-white border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden shadow-2xs relative">
                        <img
                          src={resolveImageUrl(slide.image)}
                          alt="Thumbnail"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-800 block">
                          Slide #{idx + 1}
                        </span>

                        <input
                          ref={(el) => {
                            fileInputRefs.current[idx] = el;
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadImage(idx, e)}
                          className="hidden"
                        />

                        <button
                          type="button"
                          disabled={uploadingIdx === idx}
                          onClick={() => fileInputRefs.current[idx]?.click()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors disabled:opacity-50"
                        >
                          <UploadCloud className="w-3 h-3 text-brand-500" />
                          {uploadingIdx === idx ? 'Uploading...' : 'Upload Foto'}
                        </button>
                      </div>
                    </div>

                    {/* Middle: URL & Captions */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Caption (Bahasa ID)
                          </label>
                          <input
                            type="text"
                            value={slide.caption_id || ''}
                            onChange={(e) => {
                              const updated = [...formData.who_we_are_images];
                              updated[idx] = { ...updated[idx], caption_id: e.target.value };
                              setFormData({ ...formData, who_we_are_images: updated });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded bg-white border border-slate-200 focus:border-brand-500 outline-none"
                            placeholder="e.g. BioSystems Y15 Analyzer"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Caption (English EN)
                          </label>
                          <input
                            type="text"
                            value={slide.caption_en || ''}
                            onChange={(e) => {
                              const updated = [...formData.who_we_are_images];
                              updated[idx] = { ...updated[idx], caption_en: e.target.value };
                              setFormData({ ...formData, who_we_are_images: updated });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded bg-white border border-slate-200 focus:border-brand-500 outline-none"
                            placeholder="e.g. BioSystems Y15 Analyzer"
                          />
                        </div>
                      </div>

                      {/* Quick Presets row */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] font-semibold text-slate-400 mr-1">Preset:</span>
                        {PRESETS.map((p) => (
                          <button
                            key={p.path}
                            type="button"
                            onClick={() => {
                              const updated = [...formData.who_we_are_images];
                              updated[idx] = { ...updated[idx], image: p.path };
                              setFormData({ ...formData, who_we_are_images: updated });
                            }}
                            className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                              slide.image === p.path
                                ? 'bg-brand-50 border-brand-400 text-brand-700 font-bold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex md:flex-col items-center gap-1 shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSlide(idx, 'up')}
                        className="p-1.5 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                        title="Geser ke atas"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === formData.who_we_are_images.length - 1}
                        onClick={() => handleMoveSlide(idx, 'down')}
                        className="p-1.5 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                        title="Geser ke bawah"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(idx)}
                        className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                        title="Hapus slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Checklist Bullet Points */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    Poin Checklist Keunggulan ({lang.toUpperCase()})
                  </h2>
                  <p className="text-xs text-slate-500">Daftar poin dengan ikon centang di bawah Who We Are.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Poin
                </button>
              </div>

              <div className="space-y-2">
                {(lang === 'id' ? formData.who_we_are_points_id : formData.who_we_are_points_en)?.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const targetKey = lang === 'id' ? 'who_we_are_points_id' : 'who_we_are_points_en';
                        const updated = [...(formData[targetKey] || [])];
                        updated[idx] = e.target.value;
                        setFormData({ ...formData, [targetKey]: updated });
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-md bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WHY CHOOSE ASKARA */}
        {activeTab === 'why_choose' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Judul Bagian Why Choose ({lang.toUpperCase()})
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Badge ({lang.toUpperCase()})</label>
                  <input
                    type="text"
                    value={lang === 'id' ? formData.why_choose_badge_id || '' : formData.why_choose_badge_en || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [lang === 'id' ? 'why_choose_badge_id' : 'why_choose_badge_en']: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-md bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Heading ({lang.toUpperCase()})</label>
                  <input
                    type="text"
                    value={lang === 'id' ? formData.why_choose_heading_id || '' : formData.why_choose_heading_en || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [lang === 'id' ? 'why_choose_heading_id' : 'why_choose_heading_en']: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-md bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Reason Cards */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                    Kartu Alasan Keunggulan ({formData.why_choose_reasons?.length || 0})
                  </h2>
                  <p className="text-xs text-slate-500">Pilih ikon, judul, dan deskripsi untuk setiap kartu alasan.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddReason}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Kartu
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {formData.why_choose_reasons?.map((reason, idx) => {
                  const CurrentIcon = ICON_OPTIONS.find((i) => i.name === reason.icon)?.icon || ShieldCheck;
                  return (
                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-white text-brand-600 border border-slate-200 flex items-center justify-center">
                            <CurrentIcon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">Kartu #{idx + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveReason(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Icon selector dropdown/grid */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Pilih Ikon</label>
                        <div className="flex flex-wrap gap-1">
                          {ICON_OPTIONS.map((opt) => {
                            const I = opt.icon;
                            const isSelected = reason.icon === opt.name;
                            return (
                              <button
                                key={opt.name}
                                type="button"
                                onClick={() => {
                                  const updated = [...formData.why_choose_reasons];
                                  updated[idx] = { ...updated[idx], icon: opt.name };
                                  setFormData({ ...formData, why_choose_reasons: updated });
                                }}
                                className={`p-1 rounded border transition-colors ${
                                  isSelected
                                    ? 'bg-brand-500 text-white border-brand-500'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                                title={opt.label}
                              >
                                <I className="w-3.5 h-3.5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Judul ({lang.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={lang === 'id' ? reason.title_id || '' : reason.title_en || ''}
                          onChange={(e) => {
                            const updated = [...formData.why_choose_reasons];
                            updated[idx] = {
                              ...updated[idx],
                              [lang === 'id' ? 'title_id' : 'title_en']: e.target.value,
                            };
                            setFormData({ ...formData, why_choose_reasons: updated });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded bg-white border border-slate-200 focus:border-brand-500 outline-none"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Deskripsi ({lang.toUpperCase()})
                        </label>
                        <textarea
                          rows={2}
                          value={lang === 'id' ? reason.desc_id || '' : reason.desc_en || ''}
                          onChange={(e) => {
                            const updated = [...formData.why_choose_reasons];
                            updated[idx] = {
                              ...updated[idx],
                              [lang === 'id' ? 'desc_id' : 'desc_en']: e.target.value,
                            };
                            setFormData({ ...formData, why_choose_reasons: updated });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded bg-white border border-slate-200 focus:border-brand-500 outline-none resize-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HERO HEADER */}
        {activeTab === 'hero' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Teks Hero Header ({lang.toUpperCase()})
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Badge ({lang.toUpperCase()})</label>
              <input
                type="text"
                value={lang === 'id' ? formData.hero_badge_id || '' : formData.hero_badge_en || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [lang === 'id' ? 'hero_badge_id' : 'hero_badge_en']: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-md bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Utama ({lang.toUpperCase()})</label>
              <input
                type="text"
                value={lang === 'id' ? formData.hero_title_id || '' : formData.hero_title_en || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [lang === 'id' ? 'hero_title_id' : 'hero_title_en']: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-md bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subjudul ({lang.toUpperCase()})</label>
              <textarea
                rows={3}
                value={lang === 'id' ? formData.hero_subtitle_id || '' : formData.hero_subtitle_en || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [lang === 'id' ? 'hero_subtitle_id' : 'hero_subtitle_en']: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-md bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
