import AppLayout from "@/Layouts/app-layout";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function PelaporanProgresPKL() {
  const { auth } = usePage().props;
  const user = auth?.user;

  const [formData, setFormData] = useState({
    siswaId: "",
    tanggal: new Date().toISOString().split("T")[0],
    judul: "",
    deskripsi: "",
    nilai: "",
    foto: null,
  });

  const [progresHistory, setProgresHistory] = useState([
    {
      id: 1,
      namaSiswa: "Budi Santoso",
      tanggal: "2024-03-01",
      judul: "Instalasi Server",
      deskripsi: "Melakukan instalasi OS Linux Ubuntu Server di ruang NOC.",
      nilai: 85,
      foto: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=200",
    },
    {
      id: 2,
      namaSiswa: "Ani Wijaya",
      tanggal: "2024-03-05",
      judul: "Maintenance Jaringan",
      deskripsi: "Pengecekan kabel FO dan switch di lantai 2.",
      nilai: 90,
      foto: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=200",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Laporan Progres & Nilai Berhasil Dikirim!");
  };

  const totalPages = Math.ceil(progresHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = progresHistory.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <AppLayout title="Pelaporan Progres & Nilai PKL">
      <Head title="Pelaporan Progres PKL" />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-20">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            PELAPORAN PROGRES & NILAI PKL
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
            Monitoring & Penilaian Harian Siswa Vokasi
          </p>
        </div>

        {/* FORM INPUT PROGRES & NILAI */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                ></path>
              </svg>
            </div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Catat Laporan & Beri Nilai Progres
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Pilih Siswa
              </label>
              <select
                name="siswaId"
                value={formData.siswaId}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Siswa...</option>
                <option value="1">Budi Santoso</option>
                <option value="2">Ani Wijaya</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Tanggal
              </label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Nilai Progres (0-100)
              </label>
              <input
                type="number"
                name="nilai"
                placeholder="Contoh: 85"
                value={formData.nilai}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Judul Pekerjaan
              </label>
              <input
                type="text"
                name="judul"
                placeholder="Judul singkat progres..."
                value={formData.judul}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Deskripsi Pekerjaan
              </label>
              <textarea
                name="deskripsi"
                rows="2"
                placeholder="Detail pekerjaan yang dilakukan siswa..."
                value={formData.deskripsi}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4"
                required
              ></textarea>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Upload Foto Bukti
              </label>
              <input
                type="file"
                name="foto"
                onChange={handleChange}
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-2 text-[10px] font-bold text-slate-400"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase text-xs tracking-widest"
              >
                Kirim Laporan & Nilai
              </button>
            </div>
          </form>
        </div>

        {/* TABLE HISTORI DENGAN WARNA & DESKRIPSI LENGKAP */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-blue-50 bg-blue-50/30 flex justify-between items-center">
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">
              Histori Laporan & Penilaian
            </h3>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
              {progresHistory.length} Laporan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-blue-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest text-center w-32">
                    Foto
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    Informasi Siswa
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    Judul & Deskripsi Pekerjaan
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">
                    Tanggal
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">
                    Nilai
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="w-24 h-16 rounded-xl overflow-hidden shadow-sm border-2 border-white mx-auto">
                        <img
                          src={item.foto}
                          alt="Bukti"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 uppercase text-xs">
                        {item.namaSiswa}
                      </p>
                      <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                        Siswa Vokasi
                      </p>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="font-bold text-slate-700 text-xs uppercase underline decoration-blue-200 underline-offset-4 mb-2">
                        {item.judul}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        {item.deskripsi}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      {item.tanggal}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`text-sm font-black px-3 py-1 rounded-lg border-2 ${
                          item.nilai >= 85
                            ? "bg-green-50 border-green-100 text-green-600"
                            : item.nilai >= 75
                              ? "bg-blue-50 border-blue-100 text-blue-600"
                              : "bg-rose-50 border-rose-100 text-rose-600"
                        }`}
                      >
                        {item.nilai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentPage === 1 ? "bg-gray-100 text-gray-300" : "bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white shadow-sm"}`}
            >
              Sebelumnya
            </button>
            <span className="text-[10px] font-black text-slate-400 uppercase">
              Hal {currentPage} dari {totalPages || 1}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentPage === totalPages || totalPages === 0 ? "bg-gray-100 text-gray-300" : "bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white shadow-sm"}`}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
