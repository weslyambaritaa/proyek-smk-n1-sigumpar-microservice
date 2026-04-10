import React, { useEffect, useState } from "react";
import { kepsekApi, learningApi } from "../../api/learningApi";
import {
  PageHeader,
  Panel,
  SimpleTable,
  StatCard,
} from "../../components/role/RolePage";

export default function KepsekDashboardPage() {
  const [dashboard, setDashboard] = useState({
    absensiGuru: 0,
    perangkat: 0,
    evaluasiSelesai: 0,
    rataSkor: 0,
  });
  const [perangkat, setPerangkat] = useState([]);

  // frontend/src/pages/kepala-sekolah/KepsekDashboardPage.jsx

  useEffect(() => {
    (async () => {
      try {
        const [d, p] = await Promise.all([
          kepsekApi.getKepsekDashboard(),
          learningApi.getAllPerangkat(),
        ]);

        // ✅ Map field dari backend ke state dashboard
        const raw = d.data.data;
        setDashboard({
          absensiGuru: raw.total_guru || 0,
          perangkat: raw.total_mapel || 0,
          evaluasiSelesai: raw.total_kelas || 0,
          rataSkor: raw.total_siswa || 0,
        });

        const rawPerangkat = p.data.data;
        setPerangkat(Array.isArray(rawPerangkat) ? rawPerangkat : []);
      } catch (e) {
        console.error("Dashboard error:", e);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Beranda Kepala Sekolah"
        subtitle="Pantau indikator utama sekolah dari satu layar"
        badge="Semester Ganjil 2024/2025"
      />
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          label="Absensi Guru"
          value={dashboard.absensiGuru}
          tone="green"
        />
        <StatCard label="Perangkat Ajar" value={dashboard.perangkat} />
        <StatCard
          label="Evaluasi Selesai"
          value={dashboard.evaluasiSelesai}
          tone="yellow"
        />
        <StatCard
          label="Rata-rata Skor"
          value={dashboard.rataSkor}
          tone="blue"
        />
      </div>
      <Panel title="Perangkat Ajar Terbaru">
        <SimpleTable
          data={perangkat.slice(0, 5)}
          columns={[
            { key: "no", label: "No", render: (_, i) => i + 1 },
            { key: "nama_dokumen", label: "Nama Dokumen" },
            { key: "jenis_dokumen", label: "Jenis" },
            { key: "tanggal_upload", label: "Tanggal" },
          ]}
        />
      </Panel>
    </div>
  );
}
// v2
