import React, { useEffect, useMemo, useState } from 'react';
import { getAbsensiSiswa } from '../../api/absensiSiswaApi';
import { Field, PageHeader, Panel, SimpleTable, StatCard, inputClass, primaryButton } from '../../components/role/RolePage';
import { extractArray } from '../../utils/apiUtils';

export default function AbsensiWaliPage() {
  const [rows,    setRows]    = useState([]);
  const [search,  setSearch]  = useState('');
  const [tanggal, setTanggal] = useState('');

  const fetchData = async () => {
    try {
      const a = await getAbsensiSiswa({ tanggal: tanggal || undefined });
      setRows(extractArray(a));
    } catch {
      setRows([]);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() =>
    rows.filter(r =>
      (!search  || (r.nama_lengkap || '').toLowerCase().includes(search.toLowerCase())) &&
      (!tanggal || r.tanggal === tanggal)
    ),
    [rows, search, tanggal]
  );

  const stats = useMemo(() => ({
    hadir: filtered.filter(r => r.status === 'hadir').length,
    izin:  filtered.filter(r => r.status === 'izin').length,
    alpa:  filtered.filter(r => r.status === 'alpa').length,
  }), [filtered]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Absensi Siswa" subtitle="Laporan kehadiran seluruh siswa SMK N 1 Sigumpar" />

      <Panel>
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <Field label="Pilih Tanggal">
            <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Nama Siswa">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Masukkan nama siswa..." className={inputClass} />
          </Field>
          <button onClick={fetchData} className={primaryButton}>Cari</button>
        </div>
      </Panel>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Hadir" value={stats.hadir} tone="green" />
        <StatCard label="Izin"  value={stats.izin}  tone="yellow" />
        <StatCard label="Alpha" value={stats.alpa}  tone="red" />
      </div>

      <Panel
        title="Daftar Kehadiran Siswa"
        actions={<div className="text-sm font-semibold text-slate-400">{filtered.length} Total Data</div>}
      >
        <SimpleTable
          columns={[
            { key: 'no',           label: 'No',     render: (_, i) => i + 1 },
            { key: 'nama_lengkap', label: 'Nama Siswa' },
            { key: 'nama_kelas',   label: 'Kelas' },
            {
              key: 'status', label: 'Status',
              render: r => (
                <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${
                  r.status === 'hadir' ? 'bg-green-100 text-green-700' :
                  r.status === 'izin'  ? 'bg-amber-100 text-amber-700' :
                                         'bg-red-100 text-red-700'
                }`}>
                  {r.status}
                </span>
              ),
            },
          ]}
          data={filtered}
        />
      </Panel>
    </div>
  );
}