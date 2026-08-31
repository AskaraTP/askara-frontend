'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Save,
  Briefcase,
  FileText,
  CheckCircle2,
  Gift,
} from 'lucide-react';

function CareerEditForm() {
  const searchParams = useSearchParams();
  const careerIdParam = searchParams.get('id');
  const careerId = Number(careerIdParam);
  const router = useRouter();
  const { toast } = useUI();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    job_title_en: '',
    job_title_id: '',
    slug: '',
    department_en: '',
    department_id: '',
    location_en: '',
    location_id: '',
    employment_type_en: '',
    employment_type_id: '',
    experience_level_en: '',
    experience_level_id: '',
    salary_range: '',
    linkedin_url: '',
    description_en: '',
    description_id: '',
    responsibilities_en: '',
    responsibilities_id: '',
    requirements_en: '',
    requirements_id: '',
    benefits_en: '',
    benefits_id: '',
    is_active: true,
  });

  const generateSlug = () => {
    const combined = `${formData.job_title_en} ${formData.location_en || ''}`.trim();
    const slugified = combined
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, slug: slugified }));
  };

  useEffect(() => {
    async function loadCareer() {
      if (!careerId || isNaN(careerId)) {
        setLoading(false);
        return;
      }
      try {
        const career = await api.admin.getCareerById(careerId);
        if (career) {
          setFormData({
            job_title_en: career.job_title_en || '',
            job_title_id: career.job_title_id || career.job_title_en || '',
            slug: career.slug || '',
            department_en: career.department_en || (career as any).department || '',
            department_id: career.department_id || career.department_en || (career as any).department || '',
            location_en: career.location_en || (career as any).location || 'Jakarta, Indonesia',
            location_id: career.location_id || career.location_en || (career as any).location || 'Jakarta, Indonesia',
            employment_type_en: career.employment_type_en || (career as any).employment_type || 'Full-time',
            employment_type_id: career.employment_type_id || (career as any).employment_type || 'Penuh Waktu',
            experience_level_en: career.experience_level_en || (career as any).experience_level || '',
            experience_level_id: career.experience_level_id || career.experience_level_en || (career as any).experience_level || '',
            salary_range: career.salary_range || '',
            linkedin_url: '',
            description_en: career.description_en || (career as any).description || '',
            description_id: career.description_id || career.description_en || (career as any).description || '',
            responsibilities_en: career.responsibilities_en || (career as any).responsibilities || '',
            responsibilities_id: career.responsibilities_id || career.responsibilities_en || (career as any).responsibilities || '',
            requirements_en: career.requirements_en || (career as any).requirements || '',
            requirements_id: career.requirements_id || career.requirements_en || (career as any).requirements || '',
            benefits_en: career.benefits_en || (career as any).benefits || '',
            benefits_id: career.benefits_id || career.benefits_en || (career as any).benefits || '',
            is_active: career.is_active !== undefined ? career.is_active : true,
          });
        }
      } catch (err: any) {
        toast(err.message || 'Failed to load career position details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadCareer();
  }, [careerId, toast]);

  const handleAutoBulletKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    fieldKey: keyof typeof formData
  ) => {
    const value = formData[fieldKey] as string;
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;

      const textBeforeCursor = value.substring(0, selectionStart);
      const lastLineBreak = textBeforeCursor.lastIndexOf('\n');
      const currentLine = value.substring(lastLineBreak + 1, selectionStart);

      if (currentLine.trim() === '•' || currentLine.trim() === '-') {
        const newText = value.substring(0, lastLineBreak + 1) + value.substring(selectionEnd);
        setFormData((prev) => ({ ...prev, [fieldKey]: newText }));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = Math.max(0, lastLineBreak + 1);
        }, 0);
        return;
      }

      const bulletPrefix = '\n• ';
      const newText = value.substring(0, selectionStart) + bulletPrefix + value.substring(selectionEnd);
      setFormData((prev) => ({ ...prev, [fieldKey]: newText }));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + bulletPrefix.length;
      }, 0);
    }
  };

  const handleAutoBulletFocus = (fieldKey: keyof typeof formData) => {
    const value = formData[fieldKey] as string;
    if (!value || value.trim() === '') {
      setFormData((prev) => ({ ...prev, [fieldKey]: '• ' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerId) {
      toast('Invalid Career ID', 'error');
      return;
    }
    setSaving(true);

    try {
      await api.admin.updateCareer(careerId, {
        ...formData,
        job_title_id: formData.job_title_id || formData.job_title_en,
      });
      toast('Job vacancy updated successfully', 'success');
      router.push('/admin/careers');
    } catch (err: any) {
      toast(err.message || 'Error updating job vacancy', 'error');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Job Position">
        <div className="flex items-center justify-center py-20">
          <Spinner size="md" label="Loading position details..." />
        </div>
      </AdminLayout>
    );
  }

  if (!careerId) {
    return (
      <AdminLayout title="Position Not Found">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 max-w-md mx-auto mt-8">
          <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="text-sm font-bold text-slate-900">Career ID Missing</h2>
          <p className="text-xs text-slate-500">Please select a career vacancy to edit.</p>
          <Link
            href="/admin/careers"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Careers
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit Vacancy: ${formData.job_title_en || 'Career'}`}>
      <form onSubmit={handleSubmit} className="space-y-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/careers"
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {formData.job_title_en || 'Edit Position'}
              </h1>
              <p className="text-xs text-slate-500">
                ID #{careerId} • Update job specifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/admin/careers"
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-md bg-brand-50 text-brand-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Job Metadata & Classification</h2>
              <p className="text-xs text-slate-500">
                Titles, department, location, and employment type
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Job Title (English) *
              </label>
              <input
                type="text"
                required
                value={formData.job_title_en}
                onChange={(e) => setFormData({ ...formData, job_title_en: e.target.value })}
                placeholder="e.g. Senior Laboratory Application Specialist"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Job Title (Indonesian)
              </label>
              <input
                type="text"
                value={formData.job_title_id}
                onChange={(e) => setFormData({ ...formData, job_title_id: e.target.value })}
                placeholder="e.g. Spesialis Aplikasi Laboratorium Senior"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              SEO URL Slug (Clean Permalink)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. senior-laboratory-application-specialist-jakarta"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none font-mono"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 transition-colors"
                title="Generate SEO Slug from Title & Location"
              >
                Auto Generate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department / Division
              </label>
              <input
                type="text"
                value={formData.department_en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department_en: e.target.value,
                    department_id: e.target.value,
                  })
                }
                placeholder="Sales & Technical Support"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={formData.location_en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location_en: e.target.value,
                    location_id: e.target.value,
                  })
                }
                placeholder="Jakarta, Indonesia"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Employment Type
              </label>
              <select
                value={formData.employment_type_en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employment_type_en: e.target.value,
                    employment_type_id:
                      e.target.value === 'Full-time'
                        ? 'Penuh Waktu'
                        : e.target.value === 'Contract'
                          ? 'Kontrak'
                          : e.target.value === 'Internship'
                            ? 'Magang'
                            : 'Paruh Waktu',
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none bg-white font-medium"
              >
                <option value="Full-time">Full-time (Penuh Waktu)</option>
                <option value="Contract">Contract (Kontrak)</option>
                <option value="Internship">Internship (Magang)</option>
                <option value="Part-time">Part-time (Paruh Waktu)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Experience Level
              </label>
              <input
                type="text"
                value={formData.experience_level_en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience_level_en: e.target.value,
                    experience_level_id: e.target.value,
                  })
                }
                placeholder="e.g. 2-5 Years Experience / Mid-Senior"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimated Salary / Range (Optional)
              </label>
              <input
                type="text"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                placeholder="e.g. IDR 8,000,000 - 12,000,000"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
              />
              <span>Active Job Opening (Visible on Career Page)</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-md bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Role Summary & Description</h2>
              <p className="text-xs text-slate-500">Bilingual position summary and team overview</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Job Overview (EN)
              </label>
              <textarea
                rows={4}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="We are looking for a motivated Application Specialist to join our analytical laboratory team..."
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Job Overview (ID)
              </label>
              <textarea
                rows={4}
                value={formData.description_id}
                onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                placeholder="Kami membuka kesempatan bagi Spesialis Aplikasi Laboratorium untuk bergabung..."
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Responsibilities & Requirements
              </h2>
              <p className="text-xs text-slate-500">Key skill candidate must have</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Key Responsibilities (EN)
              </label>
              <textarea
                rows={5}
                value={formData.responsibilities_en}
                onChange={(e) => setFormData({ ...formData, responsibilities_en: e.target.value })}
                onKeyDown={(e) => handleAutoBulletKeyDown(e, 'responsibilities_en')}
                onFocus={() => handleAutoBulletFocus('responsibilities_en')}
                placeholder="• Provide technical support for laboratory equipment&#10;• Conduct product demonstrations and customer training"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Qualifications & Requirements (EN)
              </label>
              <textarea
                rows={5}
                value={formData.requirements_en}
                onChange={(e) => setFormData({ ...formData, requirements_en: e.target.value })}
                onKeyDown={(e) => handleAutoBulletKeyDown(e, 'requirements_en')}
                onFocus={() => handleAutoBulletFocus('requirements_en')}
                placeholder="• Bachelor's Degree in Chemistry, Food Tech, or Bio-Engineering&#10;• Minimum 2 years experience with analytical instruments"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-md bg-amber-50 text-amber-600">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Benefits & Employee Perks</h2>
              <p className="text-xs text-slate-500">
                Compensation package, insurance, and professional development
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Benefits & Offerings (EN)
              </label>
              <textarea
                rows={4}
                value={formData.benefits_en}
                onChange={(e) => setFormData({ ...formData, benefits_en: e.target.value })}
                onKeyDown={(e) => handleAutoBulletKeyDown(e, 'benefits_en')}
                onFocus={() => handleAutoBulletFocus('benefits_en')}
                placeholder="• Competitive salary & performance bonuses&#10;• BPJS Health & Employment Insurance"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Benefits & Offerings (ID)
              </label>
              <textarea
                rows={4}
                value={formData.benefits_id}
                onChange={(e) => setFormData({ ...formData, benefits_id: e.target.value })}
                onKeyDown={(e) => handleAutoBulletKeyDown(e, 'benefits_id')}
                onFocus={() => handleAutoBulletFocus('benefits_id')}
                placeholder="• Gaji kompetitif & bonus kinerja&#10;• BPJS Kesehatan & Ketenagakerjaan"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
          <Link
            href="/admin/careers"
            className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default function CareerEditPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout title="Edit Job Position">
          <div className="flex items-center justify-center py-20">
            <Spinner size="md" label="Loading..." />
          </div>
        </AdminLayout>
      }
    >
      <CareerEditForm />
    </Suspense>
  );
}
