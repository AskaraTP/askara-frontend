'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { TableSkeletonRows } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { Career } from '@/types';
import { Plus, Edit2, Trash2, Briefcase, MapPin, ExternalLink, Eye, Users, FileText } from 'lucide-react';

export default function AdminCareersPage() {
  const { toast, confirm } = useUI();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAdminCareers();
      setCareers(data);
    } catch (err: any) {
      toast(err.message || 'Failed to load careers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (career: Career) => {
    try {
      const nextState = !career.is_active;
      setCareers((prev) =>
        prev.map((c) => (c.id === career.id ? { ...c, is_active: nextState } : c))
      );
      await api.admin.updateCareer(career.id, { is_active: nextState });
      toast(nextState ? 'Position marked as Active' : 'Position marked as Closed', 'info');
    } catch (err: any) {
      toast(err.message || 'Error updating position status', 'error');
      loadData();
    }
  };

  const handleDelete = async (career: Career) => {
    const ok = await confirm({
      title: 'Delete Job Vacancy',
      message: `Are you sure you want to delete "${career.job_title_en}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteCareer(career.id);
        toast('Job position successfully deleted', 'success');
        loadData();
      } catch (err: any) {
        toast(err.message || 'Error deleting career', 'error');
      }
    }
  };

  return (
    <AdminLayout title="Career Opportunities">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">Open Vacancies & Recruitment</h2>
            <p className="text-xs text-slate-500">Manage job postings, requirements, and candidate submissions</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/careers/applications"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition-colors shadow-xs"
            >
              <Users className="w-4 h-4 text-brand-600" />
              <span>Candidate Applications</span>
            </Link>

            <Link
              href="/admin/careers/create"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vacancy</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Job Position</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <TableSkeletonRows rows={4} cols={6} />
                ) : careers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      No open job vacancies found.
                    </td>
                  </tr>
                ) : (
                  careers.map((career) => (
                    <tr key={career.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <Link
                              href={`/admin/careers/detail?id=${career.id}`}
                              className="text-xs font-bold leading-tight hover:text-brand-600 transition-colors"
                            >
                              {career.job_title_en}
                            </Link>
                            <p className="text-[11px] text-slate-500 font-normal mt-0.5">{career.job_title_id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 text-xs font-medium">
                        {career.department_en || 'Sales & Support'}
                      </td>

                      <td className="py-3 px-3 text-slate-600 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {career.location_en}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {career.employment_type_en}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(career)}
                          title="Click to toggle position status"
                          className="inline-flex items-center"
                        >
                          {career.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-slate-100 text-slate-500 text-[11px] font-medium hover:bg-slate-200 transition-colors cursor-pointer">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Closed
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/careers/detail?id=${career.id}`}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                            title="View Vacancy Details & Applicants"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                          {career.slug && (
                            <Link
                              href={`/career/${career.slug}`}
                              target="_blank"
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                              title="View Public Career Page"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/careers/edit?id=${career.id}`}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                            title="Edit Vacancy"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(career)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Position"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
