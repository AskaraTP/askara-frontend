'use client';

import React from 'react';

interface SpecTableProps {
  specifications: string | null | undefined;
}

export default function SpecTable({ specifications }: SpecTableProps) {
  if (!specifications) return null;

  const lines = specifications.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);

  const rows = lines.map((line) => {
    const parts = line.split('|');
    if (parts.length >= 2) {
      return { key: parts[0].trim(), value: parts.slice(1).join('|').trim() };
    }
    return { key: line.trim(), value: '' };
  });

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
              <td className="py-3 px-5 font-semibold text-slate-800 w-1/3 align-top border-r border-slate-200">
                {row.key}
              </td>
              <td className="py-3 px-5 text-slate-600 leading-relaxed align-top">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
