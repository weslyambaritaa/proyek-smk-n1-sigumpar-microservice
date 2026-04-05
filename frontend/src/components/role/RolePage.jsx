import React from 'react';

export function PageHeader({ title, subtitle, badge }) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-5xl font-bold text-slate-900 tracking-tight uppercase">{title}</h1>
      {subtitle && <p className="text-slate-500 mt-3 text-lg tracking-wide uppercase">{subtitle}</p>}
      {badge && <div className="inline-flex mt-4 rounded-full bg-blue-100 text-blue-700 px-5 py-2 text-sm font-semibold">{badge}</div>}
    </div>
  );
}

export function Panel({ title, actions, children, className='' }) {
  return (
    <div className={`bg-white rounded-[28px] shadow-[0_14px_30px_rgba(15,79,134,0.08)] border border-slate-100 ${className}`}>
      {(title || actions) && (
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-8">{children}</div>
    </div>
  );
}

export function StatCard({ label, value, tone='blue' }) {
  const tones = {
    blue: 'text-blue-600 border-blue-500',
    green: 'text-green-600 border-green-500',
    yellow: 'text-amber-500 border-amber-400',
    red: 'text-red-500 border-red-400',
  };
  return (
    <div className={`bg-white rounded-[24px] p-8 border-b-4 ${tones[tone] || tones.blue} shadow-sm`}>
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">{label}</div>
      <div className="text-6xl font-bold">{value}</div>
    </div>
  );
}

export function SimpleTable({ columns, data, empty='Belum ada data.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
          <tr>{columns.map((col) => <th key={col.key} className="px-4 py-4">{col.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length ? data.map((row, idx) => (
            <tr key={row.id || idx} className="text-slate-700">
              {columns.map((col) => <td key={col.key} className="px-4 py-5 align-top">{col.render ? col.render(row, idx) : row[col.key]}</td>)}
            </tr>
          )) : <tr><td className="px-4 py-10 text-center text-slate-400" colSpan={columns.length}>{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">{label}</div>
      {children}
    </label>
  );
}

export const inputClass = 'w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
export const primaryButton = 'rounded-2xl bg-blue-600 text-white px-6 py-3 font-bold uppercase tracking-[0.15em] hover:bg-blue-700';
export const secondaryButton = 'rounded-2xl bg-slate-100 text-slate-600 px-6 py-3 font-bold uppercase tracking-[0.15em]';
