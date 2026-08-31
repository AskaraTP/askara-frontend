'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api } from '@/lib/api';
import { formatErrorMessage } from '@/lib/errorHandler';
import { Career, CareerApplication } from '@/types';
import ApplicationDetailModal from '@/components/admin/ApplicationDetailModal';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  FileText,
  Download,
  Calendar,
  Eye,
} from 'lucide-react';

import { useDynamicId } from '@/hooks/useDynamicRouteParams';

interface CareerAdminDetailClientProps {
  params?: Promise<{
    id: string;
  }>;
}

export default function CareerDetailAdminClient({ params }: CareerAdminDetailClientProps) {
  const careerId = useDynamicId(params);
  const router = useRouter();

  const { toast } = useUI();

  const [career, setCareer] = useState<Career | null>(null);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingActive, setTogglingActive] = useState(false);

  // Application Detail Modal State
  const [selectedApplication, setSelectedApplication] = useState<CareerApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specLang, setSpecLang] = useState<'en' | 'id'>('en');

  useEffect(() => {
    async function loadData() {
      try {
        const [careerData, appsData] = await Promise.all([
          api.admin.getCareerById(careerId),
          api.admin.getAdminApplications({ careerId }),
        ]);
        setCareer(careerData);
        setApplications(appsData);
      } catch (err) {
        console.error('Failed to load career detail and applications', err);
        toast(formatErrorMessage(err, 'Failed to load career position details.'), 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [careerId, toast]);

  const handleToggleActive = async () => {
    if (!career || togglingActive) return;
    setTogglingActive(true);
    const newStatus = !career.is_active;

    try {
      await api.admin.updateCareer(career.id, { is_active: newStatus });
      setCareer((prev) => (prev ? { ...prev, is_active: newStatus } : null));
      toast(
        newStatus ? 'Position marked as active / hiring.' : 'Position marked as closed.',
        'success'
      );
    } catch (err) {
      toast(formatErrorMessage(err, 'Failed to update position status.'), 'error');
    } finally {
      setTogglingActive(false);
    }
  };

  const handleDeleteCareer = async () => {
    if (!career) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${career.job_title_en}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.admin.deleteCareer(career.id);
      toast('Career position deleted successfully.', 'success');
      router.push('/admin/careers');
    } catch (err) {
      toast(formatErrorMessage(err, 'Failed to delete career position.'), 'error');
    }
  };

  const handleStatusChange = async (appId: number, newStatus: CareerApplication['status']) => {
    try {
      await api.admin.updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
      if (selectedApplication && selectedApplication.id === appId) {
        setSelectedApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      toast('Candidate application status updated.', 'success');
    } catch (err) {
      toast(formatErrorMessage(err, 'Failed to update application status.'), 'error');
    }
  };

  const handleDeleteApplication = async (appId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this application? The candidate CV will also be deleted from Supabase Storage.'
    );
    if (!confirmed) return;

    try {
      await api.admin.deleteApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      if (selectedApplication?.id === appId) {
        setIsModalOpen(false);
        setSelectedApplication(null);
      }
      toast('Application and CV document removed from Supabase Storage.', 'success');
    } catch (err) {
      toast(formatErrorMessage(err, 'Failed to delete application.'), 'error');
    }
  };

  const handleOpenApplicationModal = (app: CareerApplication) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-28 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-100 rounded-xl lg:col-span-2" />
          <div className="h-80 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Briefcase className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Career Position Not Found</h2>
        <p className="text-xs text-slate-500">
          The career vacancy you requested does not exist or has been deleted.
        </p>
        <Link
          href="/admin/careers"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Careers List
        </Link>
      </div>
    );
  }

  const jobTitle =
    (specLang === 'en' ? career.job_title_en : career.job_title_id) ||
    career.job_title_en ||
    career.job_title_id ||
    '-';

  const department =
    (specLang === 'en' ? career.department_en : career.department_id) ||
    career.department_en ||
    career.department_id ||
    '-';

  const location =
    (specLang === 'en' ? career.location_en : career.location_id) ||
    career.location_en ||
    career.location_id ||
    '-';

  const employmentType =
    (specLang === 'en' ? career.employment_type_en : career.employment_type_id) ||
    career.employment_type_en ||
    career.employment_type_id ||
    '-';

  const experienceLevel =
    (specLang === 'en' ? career.experience_level_en : career.experience_level_id) ||
    career.experience_level_en ||
    career.experience_level_id ||
    '-';

  const desc =
    (specLang === 'en' ? career.description_en : career.description_id) ||
    (specLang === 'en' ? career.description_id : career.description_en) ||
    '';

  const resp =
    (specLang === 'en' ? career.responsibilities_en : career.responsibilities_id) ||
    (specLang === 'en' ? career.responsibilities_id : career.responsibilities_en) ||
    '';

  const reqs =
    (specLang === 'en' ? career.requirements_en : career.requirements_id) ||
    (specLang === 'en' ? career.requirements_id : career.requirements_en) ||
    '';

  const bens =
    (specLang === 'en' ? career.benefits_en : career.benefits_id) ||
    (specLang === 'en' ? career.benefits_id : career.benefits_en) ||
    '';

  return (
    <AdminLayout title="Career Position Details">
      <div className="space-y-8">
        {/* Top Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin/careers"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Vacancies</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {career.slug && (
              <a
                href={`/career/${career.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
            <Link
              href={`/admin/careers/${career.id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Vacancy</span>
            </Link>
            <button
              type="button"
              onClick={handleDeleteCareer}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Header Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                  {department}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs text-slate-500 font-mono">ID: #{career.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {jobTitle}
              </h1>
              {career.job_title_id && career.job_title_id !== career.job_title_en && (
                <p className="text-xs text-slate-500 font-medium">
                  {specLang === 'en' ? career.job_title_id : career.job_title_en}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={togglingActive}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-bold border transition-colors cursor-pointer ${
                  career.is_active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                title="Click to toggle active vacancy status"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    career.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{career.is_active ? 'Actively Hiring' : 'Position Closed'}</span>
              </button>
            </div>
          </div>

          {/* Quick Highlights Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Location
              </span>
              <p className="font-bold text-slate-800 truncate">{location}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Employment
              </span>
              <p className="font-bold text-slate-800 truncate">{employmentType}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Experience
              </span>
              <p className="font-bold text-slate-800 truncate">{experienceLevel}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Applicants
              </span>
              <p className="font-bold text-brand-600 truncate">{applications.length} Candidates</p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Received Applications (Daftar Pelamar) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Candidate Applications ({applications.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Review and download candidate resumes submitted for this role
                    </p>
                  </div>
                </div>
              </div>

              {applications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div
                        className="space-y-1.5 cursor-pointer flex-1 min-w-0"
                        onClick={() => handleOpenApplicationModal(app)}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm text-slate-900 hover:text-brand-600 transition-colors truncate">
                            {app.full_name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                              app.status === 'shortlisted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : app.status === 'reviewing'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : app.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>{app.email}</span>
                          <span>&bull;</span>
                          <span>{app.phone}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {app.created_at
                              ? new Date(app.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={app.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                          title="Download / View candidate CV"
                        >
                          <Download className="w-3.5 h-3.5 text-brand-600" />
                          <span>CV</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleOpenApplicationModal(app)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">No Applications Received Yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When candidates submit their CV for this role via the application form, their profile will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Job Description & Details Overview */}
          <div className="lg:col-span-5 space-y-6">
            {/* Job Overview Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Role Details & Specifications
                </h3>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSpecLang('en')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      specLang === 'en'
                        ? 'bg-white text-brand-600 shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecLang('id')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      specLang === 'id'
                        ? 'bg-white text-brand-600 shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ID
                  </button>
                </div>
              </div>

              {desc ? (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    About the Role
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {desc}
                  </p>
                </div>
              ) : null}

              {resp ? (
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Key Responsibilities
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {resp}
                  </p>
                </div>
              ) : null}

              {reqs ? (
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Requirements & Qualifications
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {reqs}
                  </p>
                </div>
              ) : null}

              {bens ? (
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Perks & Benefits
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {bens}
                  </p>
                </div>
              ) : null}

              {!desc && !resp && !reqs && !bens && !career.salary_range && (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-500">
                    No role specifications entered yet for this position.
                  </p>
                  <Link
                    href={`/admin/careers/${career.id}/edit`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Click here to add job descriptions & requirements</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Candidate Application Detail Modal with Next & Prev */}
        <ApplicationDetailModal
          application={selectedApplication}
          applicationsList={applications}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteApplication}
          onSelectApplication={(app) => setSelectedApplication(app)}
        />
      </div>
    </AdminLayout>
  );
}
