import React from 'react';

const statusConfig = {
  'Menunggu Review': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
  'Perlu Direvisi':  { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500' },
  'Disetujui':       { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  'Hadir':           { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  'Sakit':           { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
  'Alpa':            { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
