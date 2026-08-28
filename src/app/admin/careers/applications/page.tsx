'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api } from '@/lib/api';
import { formatErrorMessage } from '@/lib/errorHandler';
import { CareerApplication, Career } from '@/types';
import ApplicationDetailModal from '@/components/admin/ApplicationDetailModal';
import {
  Search,
  Download,
  Eye,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';

export default function AdminCareerApplicationsPage() {
  const { toast } = useUI();

  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [careerFilter, setCareerFilter] = useState('all');

  // Application Detail Modal State
  const [selectedApplication, setSelectedApplication] = useState<CareerApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsData, careersData] = await Promise.all([
        api.admin.getAdminApplications(),
        api.admin.getAdminCareers(),
      ]);
      setApplications(appsData);
      setCareers(careersData);
    } catch (err) {
      console.error('Failed to load applications', err);
      toast(formatErrorMessage(err, 'Failed to load candidate applications list.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      'Are you sure you want to delete this candidate application? The CV document will be permanently removed from Supabase Storage.'
    );
    if (!confirmed) return;

    try {
      await api.admin.deleteApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      if (selectedApplication?.id === appId) {
        setIsModalOpen(false);
        setSelectedApplication(null);
      }
      toast('Application and CV deleted from Supabase Storage.', 'success');
    } catch (err) {
      toast(formatErrorMessage(err, 'Failed to delete application.'), 'error');
    }
  };

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchQuery === '' ||
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.career_title && app.career_title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesCareer =
      careerFilter === 'all' ||
      (careerFilter === 'none' && !app.career_id) ||
      String(app.career_id) === careerFilter;

    return matchesSearch && matchesStatus && matchesCareer;
  });

  const countByStatus = {
    all: applications.length,
    submitted: applications.filter((a) => a.status === 'submitted').length,
    reviewing: applications.filter((a) => a.status === 'reviewing').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <AdminLayout title="Candidate Applications">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/careers"
                className="text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Career Vacancies</span>
              </Link>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Candidate Applications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review incoming candidate CVs and update applicant recruitment stages
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              statusFilter === 'all'
                ? 'bg-brand-50/80 border-brand-300 ring-1 ring-brand-400'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-slate-500 font-medium block">Total Applicants</span>
            <span className="text-lg font-extrabold text-slate-900 mt-1 block">
              {countByStatus.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('submitted')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              statusFilter === 'submitted'
                ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-blue-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Submitted
            </span>
            <span className="text-lg font-extrabold text-blue-700 mt-1 block">
              {countByStatus.submitted}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('reviewing')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              statusFilter === 'reviewing'
                ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              In Review
            </span>
            <span className="text-lg font-extrabold text-amber-700 mt-1 block">
              {countByStatus.reviewing}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('shortlisted')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              statusFilter === 'shortlisted'
                ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Shortlisted
            </span>
            <span className="text-lg font-extrabold text-emerald-700 mt-1 block">
              {countByStatus.shortlisted}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('rejected')}
            className={`p-3.5 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
              statusFilter === 'rejected'
                ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-rose-600 font-medium flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Not Selected
            </span>
            <span className="text-lg font-extrabold text-rose-700 mt-1 block">
              {countByStatus.rejected}
            </span>
          </button>
        </div>

        {/* Search & Filters Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, email, or role..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={careerFilter}
              onChange={(e) => setCareerFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-md border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Job Positions</option>
              {careers.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.job_title_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Applications Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading candidate applications...</p>
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Candidate</th>
                    <th className="px-5 py-3.5">Target Position</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedApplication(app);
                        setIsModalOpen(true);
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {app.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                              {app.full_name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{app.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">
                          {app.career_title || 'General Position'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <p className="font-mono text-[11px]">{app.phone}</p>
                      </td>

                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {app.created_at
                          ? new Date(app.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>

                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleStatusChange(app.id, e.target.value as CareerApplication['status'])
                          }
                          className={`px-2.5 py-1 rounded-sm text-[11px] font-bold border transition-colors focus:outline-none ${
                            app.status === 'shortlisted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : app.status === 'reviewing'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : app.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="reviewing">In Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Not Selected</option>
                        </select>
                      </td>

                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={app.cv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Download CV Document"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApplication(app);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No Candidate Applications Found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No applicant submissions match your selected filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* Candidate Detail Modal with Next & Prev */}
        <ApplicationDetailModal
          application={selectedApplication}
          applicationsList={filteredApplications}
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
