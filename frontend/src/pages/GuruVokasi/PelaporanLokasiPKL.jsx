import AppLayout from "@/Layouts/app-layout";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function PelaporanLokasiPKL() {
  const { auth } = usePage().props;
  const user = auth?.user;

  const [formData, setFormData] = useState({
    namaSiswa: "",
    namaPerusahaan: "",
    bidangUsaha: "",
    alamat: "",
    judulPenempatan: "",
    deskripsiPekerjaan: "",
    pembimbingIndustri: "",
    kontakPembimbing: "",
    tanggal: new Date().toISOString().split("T")[0],
    foto: null,
  });

  const [history, setHistory] = useState([
    {
      id: 1,
      namaSiswa: "Budi Santoso",
      namaPerusahaan: "PT. Teknologi Maju",
      bidangUsaha: "IT",
      alamat: "Medan",
      judulPenempatan: "Junior Web Developer",
      deskripsiPekerjaan:
        "Membantu pengembangan modul frontend aplikasi internal perusahaan menggunakan React.",
      pembimbingIndustri: "Heru Darmawan",
      kontakPembimbing: "0812-3456-7890",
      tanggal: "2024-03-01",
      foto: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "foto") {
      setFormData((prev) => ({ ...prev, foto: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newData = {
      id: Date.now(),
      ...formData,
      foto: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200",
    };
    setHistory([newData, ...history]);
    alert("Laporan Penempatan Lokasi & Tugas PKL Berhasil Disimpan!");
  };

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = history.slice(startIndex, startIndex + itemsPerPage);

  return (
    <AppLayout title="Pelaporan Lokasi PKL">
      <Head title="Pelaporan Lokasi PKL" />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-20">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            PELAPORAN DETAIL PENEMPATAN PKL
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
            Guru Vokasi: {user?.name}
          </p>
        </div>

        {/* FORM INPUT LENGKAP */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="p-2 bg-blue-600 rounded-lg text-white font-bold">
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
                  d="M19 21V5a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Informasi Lokasi & Pekerjaan
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Nama Siswa
              </label>
              <input
                type="text"
                name="namaSiswa"
                placeholder="Nama Siswa"
                value={formData.namaSiswa}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                name="namaPerusahaan"
                placeholder="PT. ..."
                value={formData.namaPerusahaan}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Alamat Singkat
              </label>
              <input
                type="text"
                name="alamat"
                placeholder="Kota / Kab"
                value={formData.alamat}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Tanggal
              </label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Judul Penempatan / Posisi
              </label>
              <input
                type="text"
                name="judulPenempatan"
                placeholder="Contoh: Teknisi Jaringan / Admin"
                value={formData.judulPenempatan}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Deskripsi Utama Pekerjaan
              </label>
              <input
                type="text"
                name="deskripsiPekerjaan"
                placeholder="Tugas utama siswa..."
                value={formData.deskripsiPekerjaan}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Pembimbing Industri
              </label>
              <input
                type="text"
                name="pembimbingIndustri"
                placeholder="Nama Atasan"
                value={formData.pembimbingIndustri}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Kontak Pembimbing
              </label>
              <input
                type="text"
                name="kontakPembimbing"
                placeholder="WhatsApp"
                value={formData.kontakPembimbing}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-2xl font-bold py-3 px-4 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Foto Lokasi
              </label>
              <input
                type="file"
                name="foto"
                onChange={handleChange}
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-2 text-[10px] font-bold text-slate-400 file:bg-blue-50 file:border-0 file:rounded-full file:px-3 file:text-blue-600 file:font-black"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg uppercase text-xs tracking-widest"
              >
                Simpan Laporan
              </button>
            </div>
          </form>
        </div>

        {/* TABLE RIWAYAT LENGKAP */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-blue-50 bg-blue-50/30 flex justify-between items-center">
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">
              Daftar Penempatan & Tugas PKL
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-blue-50/50">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest w-16 text-center">
                    No
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">
                    Foto
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    Siswa & Lokasi
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    Judul & Deskripsi Tugas
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">
                    Pembimbing
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-6 text-center text-sm font-bold text-blue-200">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="w-20 h-14 rounded-xl overflow-hidden shadow-md border-2 border-white mx-auto">
                        <img
                          src={item.foto}
                          alt="Lokasi"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-black text-slate-800 uppercase text-xs">
                        {item.namaSiswa}
                      </p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                        {item.namaPerusahaan}
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase italic mt-0.5">
                        {item.alamat}
                      </p>
                    </td>
                    <td className="px-6 py-6 max-w-xs">
                      <p className="font-bold text-slate-700 text-[11px] uppercase underline decoration-blue-200 underline-offset-4">
                        {item.judulPenempatan}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                        {item.deskripsiPekerjaan}
                      </p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <p className="font-bold text-slate-700 text-[10px] uppercase">
                        {item.pembimbingIndustri}
                      </p>
                      <p className="text-[9px] font-bold text-blue-400 mt-1">
                        {item.kontakPembimbing}
                      </p>
                    </td>
                    <td className="px-6 py-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {item.tanggal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-slate-50 border-t border-blue-50 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === 1 ? "bg-gray-100 text-gray-300" : "bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white shadow-sm"}`}
              >
                Sebelumnya
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === totalPages || totalPages === 0 ? "bg-gray-100 text-gray-300" : "bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white shadow-sm"}`}
              >
                Selanjutnya
              </button>
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Hal {currentPage} dari {totalPages || 1}
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
