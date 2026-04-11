import React, { useEffect, useState } from 'react';
import { academicApi } from '../../api/academicApi';
import { PageHeader, Panel, SimpleTable } from '../../components/role/RolePage';
import { extractArray } from '../../utils/apiUtils';

export default function RekapNilaiWaliPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await academicApi.getNilai({});
        setRows(extractArray(res));
      } catch {
        setRows([]);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Rekap Nilai" subtitle="Ringkasan performa akademik siswa per mata pelajaran" />
      <Panel title="Daftar Rekap Nilai">
        <SimpleTable
          data={rows}
          columns={[
            { key: 'no',           label: 'No',         render: (_, i) => i + 1 },
            { key: 'nama_lengkap', label: 'Nama Siswa' },
            { key: 'nama_kelas',   label: 'Kelas' },
            { key: 'nama_mapel',   label: 'Mapel' },
            { key: 'nilai_akhir',  label: 'Nilai Akhir', render: r => <span className="text-blue-600 font-bold">{r.nilai_akhir ?? '-'}</span> },
          ]}
          empty="Belum ada data nilai."
        />
      </Panel>
    </div>
  );
}