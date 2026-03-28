import AppLayout from "@/Layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

export default function DetailLokasiPKL() {
  // Data dummy untuk detail lokasi
  const data = {
    namaPerusahaan: "PT. Teknologi Maju",
    alamat: "Jl. Merdeka No. 123, Medan, Sumatera Utara",
    pembimbingIndustri: "Bpk. Heru Darmawan",
    kontak: "0812-3456-7890",
    bidangUsaha: "Software Development",
    siswa: [
      { id: 1, nama: "Budi Santoso", nis: "2122001", status: "Aktif" },
      { id: 2, nama: "Ani Wijaya", nis: "2122002", status: "Aktif" },
    ],
    dokumentasi: "foto_kantor.jpg",
  };

  return (
    <AppLayout title="Detail Lokasi PKL">
      <Head title="Detail Lokasi PKL" />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-20">
        {/* Header & Tombol Kembali */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              DETAIL LOKASI PKL
            </h1>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
              Informasi Lengkap Penempatan Siswa
            </p>
          </div>
          <Link
            href="/lokasi-pkl"
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-2.5 px-6 rounded-xl transition text-[10px] uppercase tracking-widest border border-slate-200"
          >
            Kembali
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri - Informasi Perusahaan */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Nama Perusahaan
                </label>
                <p className="text-xl font-black text-slate-800 uppercase">
                  {data.namaPerusahaan}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Bidang Usaha
                </label>
                <p className="font-bold text-slate-700">{data.bidangUsaha}</p>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Alamat Lengkap
                </label>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {data.alamat}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Pembimbing Industri
                </label>
                <p className="font-bold text-slate-800 uppercase">
                  {data.pembimbingIndustri}
                </p>
                <p className="text-blue-600 font-bold text-xs mt-1">
                  {data.kontak}
                </p>
              </div>
            </div>

            {/* Dokumentasi Preview */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Foto Lokasi
              </label>
              <div className="aspect-video bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Kolom Kanan - Daftar Siswa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden h-full">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Siswa Terdaftar di Lokasi Ini
                </h3>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {data.siswa.length} Orang
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-slate-50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">
                        No
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Informasi Siswa
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Status PKL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.siswa.map((siswa, index) => (
                      <tr
                        key={siswa.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-6 text-center text-sm font-bold text-slate-300">
                          {index + 1}
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-black text-slate-800 uppercase text-xs tracking-tight">
                            {siswa.nama}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                            NIS: {siswa.nis}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {siswa.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
