export default function MockupInputNilaiPKL() {
    const students = [
        {
            nisn: "0087612345",
            nama: "Aulia Rahman",
            kelas: "XI RPL 1",
            industri: "PT Digital Nusantara",
            pembimbing: "Budi Santoso",
            disiplin: 88,
            teknis: 90,
            komunikasi: 86,
            laporan: 89,
            presentasi: 87,
        },
        {
            nisn: "0087612346",
            nama: "Nabila Sari",
            kelas: "XI TKJ 2",
            industri: "CV Jaringan Cerdas",
            pembimbing: "Rina Wulandari",
            disiplin: 92,
            teknis: 94,
            komunikasi: 90,
            laporan: 91,
            presentasi: 93,
        },
        {
            nisn: "0087612347",
            nama: "Fikri Maulana",
            kelas: "XI TBSM 1",
            industri: "Bengkel Prima Motor",
            pembimbing: "Agus Setiawan",
            disiplin: 85,
            teknis: 88,
            komunikasi: 82,
            laporan: 84,
            presentasi: 83,
        },
    ];

    const finalScore = (s) =>
        Math.round(
            s.disiplin * 0.15 +
                s.teknis * 0.35 +
                s.komunikasi * 0.15 +
                s.laporan * 0.2 +
                s.presentasi * 0.15,
        );

    const grade = (score) => {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "E";
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800">
            <div className="flex min-h-screen">
                <aside className="w-72 bg-sky-900 text-white p-6 flex flex-col">
                    <div className="mb-8">
                        <div className="text-sm opacity-80">Pengguna Aktif</div>
                        <div className="mt-2 text-xl font-semibold">
                            Ivana Pasaribu (DEMO)
                        </div>
                        <div className="text-sm text-sky-100">Guru Vokasi</div>
                    </div>

                    <nav className="space-y-2">
                        <div className="rounded-2xl px-4 py-3 hover:bg-sky-800/70 cursor-pointer">
                            Beranda
                        </div>
                        <div className="rounded-2xl px-4 py-3 hover:bg-sky-800/70 cursor-pointer">
                            Pelaporan Lokasi PKL
                        </div>
                        <div className="rounded-2xl px-4 py-3 hover:bg-sky-800/70 cursor-pointer">
                            Pelaporan Progres PKL
                        </div>
                        <div className="rounded-2xl bg-white text-sky-900 px-4 py-3 font-semibold shadow">
                            Input Nilai PKL
                        </div>
                    </nav>

                    <div className="mt-auto pt-8 text-xs text-sky-100/80">
                        Sistem Monitoring PKL / Magang SMK
                    </div>
                </aside>

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Input Nilai PKL
                                </h1>
                                <p className="text-slate-600 mt-2">
                                    Halaman ini digunakan Guru Vokasi untuk
                                    menginput, meninjau, dan finalisasi nilai
                                    siswa peserta PKL / magang.
                                </p>
                            </div>
                            <button className="rounded-2xl bg-sky-900 text-white px-5 py-3 shadow hover:opacity-95">
                                Simpan Semua Nilai
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
                                <div className="text-sm text-slate-500">
                                    Total Siswa PKL
                                </div>
                                <div className="text-3xl font-bold mt-2">
                                    36
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
                                <div className="text-sm text-slate-500">
                                    Nilai Sudah Diisi
                                </div>
                                <div className="text-3xl font-bold mt-2">
                                    28
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
                                <div className="text-sm text-slate-500">
                                    Menunggu Finalisasi
                                </div>
                                <div className="text-3xl font-bold mt-2">6</div>
                            </div>
                            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
                                <div className="text-sm text-slate-500">
                                    Rata-rata Nilai
                                </div>
                                <div className="text-3xl font-bold mt-2">
                                    88
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Tahun Ajaran
                                    </label>
                                    <select className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white">
                                        <option>2025/2026</option>
                                        <option>2024/2025</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Semester
                                    </label>
                                    <select className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white">
                                        <option>Genap</option>
                                        <option>Ganjil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Jurusan
                                    </label>
                                    <select className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white">
                                        <option>Semua Jurusan</option>
                                        <option>RPL</option>
                                        <option>TKJ</option>
                                        <option>TBSM</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Kelas
                                    </label>
                                    <select className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white">
                                        <option>Semua Kelas</option>
                                        <option>XI RPL 1</option>
                                        <option>XI TKJ 2</option>
                                        <option>XI TBSM 1</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Status
                                    </label>
                                    <select className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white">
                                        <option>Semua Status</option>
                                        <option>Belum Dinilai</option>
                                        <option>Draft</option>
                                        <option>Terverifikasi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Cari Siswa
                                    </label>
                                    <input
                                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                        placeholder="Nama / NISN"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-lg">
                                        Daftar Penilaian Siswa PKL
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Komponen nilai dapat disesuaikan dengan
                                        kebijakan sekolah.
                                    </p>
                                </div>
                                <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm">
                                    Export Rekap
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1200px] text-sm">
                                    <thead className="bg-slate-50">
                                        <tr className="text-left text-slate-600">
                                            <th className="px-4 py-3 font-semibold">
                                                Siswa
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Kelas
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Tempat PKL
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Pembimbing
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Disiplin
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Teknis
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Komunikasi
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Laporan
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Presentasi
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Nilai Akhir
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Grade
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((s, idx) => {
                                            const score = finalScore(s);
                                            return (
                                                <tr
                                                    key={idx}
                                                    className="border-t border-slate-200 align-top"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="font-semibold">
                                                            {s.nama}
                                                        </div>
                                                        <div className="text-slate-500 text-xs">
                                                            NISN {s.nisn}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {s.kelas}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {s.industri}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {s.pembimbing}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            defaultValue={
                                                                s.disiplin
                                                            }
                                                            className="w-20 rounded-lg border border-slate-300 px-2 py-2"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            defaultValue={
                                                                s.teknis
                                                            }
                                                            className="w-20 rounded-lg border border-slate-300 px-2 py-2"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            defaultValue={
                                                                s.komunikasi
                                                            }
                                                            className="w-20 rounded-lg border border-slate-300 px-2 py-2"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            defaultValue={
                                                                s.laporan
                                                            }
                                                            className="w-20 rounded-lg border border-slate-300 px-2 py-2"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            defaultValue={
                                                                s.presentasi
                                                            }
                                                            className="w-20 rounded-lg border border-slate-300 px-2 py-2"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="font-semibold">
                                                            {score}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="inline-flex rounded-full bg-sky-100 text-sky-800 px-3 py-1 font-medium">
                                                            {grade(score)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="inline-flex rounded-full bg-amber-100 text-amber-800 px-3 py-1 font-medium">
                                                            Draft
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex gap-2">
                                                            <button className="rounded-lg bg-sky-900 text-white px-3 py-2 text-xs">
                                                                Simpan
                                                            </button>
                                                            <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs">
                                                                Detail
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
                                <h3 className="font-semibold text-lg">
                                    Catatan Guru Vokasi
                                </h3>
                                <textarea
                                    className="mt-4 w-full min-h-[160px] rounded-2xl border border-slate-300 p-4"
                                    placeholder="Tambahkan catatan umum penilaian, rekomendasi, atau evaluasi untuk siswa..."
                                />
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
                                <h3 className="font-semibold text-lg">
                                    Bobot Penilaian
                                </h3>
                                <div className="mt-4 space-y-3 text-sm">
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                        <span>Disiplin</span>
                                        <span className="font-semibold">
                                            15%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                        <span>Kompetensi Teknis</span>
                                        <span className="font-semibold">
                                            35%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                        <span>Komunikasi</span>
                                        <span className="font-semibold">
                                            15%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                        <span>Laporan PKL</span>
                                        <span className="font-semibold">
                                            20%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                        <span>Presentasi / Ujian</span>
                                        <span className="font-semibold">
                                            15%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
