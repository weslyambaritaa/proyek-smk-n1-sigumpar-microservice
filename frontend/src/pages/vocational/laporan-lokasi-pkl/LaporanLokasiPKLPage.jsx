import React, { useState, useEffect, useRef } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import { academicApi } from '../../../api/academicApi'; // Import academicApi untuk mengambil nama siswa
import Button from '../../../components/ui/Button';
import LokasiPKLDialog from './dialog/LokasiPKLDialog';
import toast from 'react-hot-toast';

const LaporanLokasiPKLPage = () => {
    // State untuk menyimpan data tabel
    const [data, setData] = useState([]);
    
    // State untuk mengontrol buka/tutup Modal Dialog Form
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    // --- STATE UNTUK DELETE SHEET ---
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    // --- STATE UNTUK DROPDOWN MENU ---
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    // Fungsi untuk mengambil dan menggabungkan data PKL dengan Nama Siswa
    const loadData = async () => {
        try {
            // Jalankan kedua request secara paralel agar lebih cepat
            const [resPkl, resSiswa] = await Promise.all([
                vocationalApi.getAllLaporanPKL(),
                academicApi.getAllSiswa()
            ]);

            const pklData = (resPkl && resPkl.data && Array.isArray(resPkl.data)) ? resPkl.data : [];
            const siswaData = (resSiswa && resSiswa.data && Array.isArray(resSiswa.data)) ? resSiswa.data : [];

            // Gabungkan ID Siswa dengan Nama Lengkap
            const combinedData = pklData.map(pkl => {
                const siswa = siswaData.find(s => s.id === pkl.siswa_id);
                return {
                    ...pkl,
                    // Tambahkan properti siswa_nama agar bisa dirender di tabel & dialog
                    siswa_nama: siswa ? (siswa.nama_lengkap || siswa.nama) : `(ID: ${pkl.siswa_id})`
                };
            });

            setData(combinedData);
        } catch (err) { 
            console.error("Error load data", err);
            toast.error("Gagal memuat data laporan lokasi PKL");
            setData([]); 
        }
    };

    useEffect(() => { 
        loadData(); 
    }, []);

    // --- LOGIKA UNTUK MENUTUP MENU SAAT KLIK DI LUAR ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openMenuId]);

    const toggleMenu = (id) => {
        if (openMenuId === id) {
            setOpenMenuId(null);
        } else {
            setOpenMenuId(id);
        }
    };

    const handleEdit = (item) => {
        setSelectedData(item);
        setIsDialogOpen(true);
        setOpenMenuId(null); // Tutup menu setelah opsi dipilih
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setDeleteConfirmation(""); 
        setIsDeleteDialogOpen(true);
        setOpenMenuId(null); // Tutup menu setelah opsi dipilih
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        // Validasi input nama perusahaan
        if (deleteConfirmation !== itemToDelete.nama_perusahaan) {
            toast.error("Nama perusahaan tidak sesuai!");
            return;
        }

        const deletePromise = vocationalApi.deleteLaporanPKL(itemToDelete.id);

        toast
            .promise(deletePromise, {
                loading: "Menghapus data lokasi PKL...",
                success: `Data ${itemToDelete.nama_perusahaan} berhasil dihapus!`,
                error: "Gagal menghapus data.",
            })
            .then(() => {
                loadData();
                setIsDeleteDialogOpen(false);
                setItemToDelete(null);
            })
            .catch((err) => console.error(err));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Laporan Lokasi PKL</h1>
                <Button onClick={() => { setSelectedData(null); setIsDialogOpen(true); }}>
                    + Tambah Lokasi
                </Button>
            </div>

            {/* overflow-visible agar dropdown menu tidak terpotong oleh tabel */}
            <div className="bg-white rounded-lg shadow overflow-visible">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                        <tr>
                            {/* --- TAMBAH HEADER NAMA SISWA --- */}
                            <th className="px-6 py-4">Nama Siswa</th>
                            <th className="px-6 py-4">Perusahaan</th>
                            <th className="px-6 py-4">Alamat</th>
                            <th className="px-6 py-4 text-center w-20">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.length > 0 ? (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    {/* --- RENDER KOLOM NAMA SISWA --- */}
                                    <td className="px-6 py-4 font-semibold text-gray-900">{item.siswa_nama}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{item.nama_perusahaan}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.alamat}</td>
                                    
                                    {/* --- KOLOM TINDAKAN DENGAN MENU TITIK TIGA --- */}
                                    <td className="px-6 py-4 text-center relative" ref={openMenuId === item.id ? menuRef : null}>
                                        <button
                                            onClick={() => toggleMenu(item.id)}
                                            className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                            aria-label="Tampilkan opsi"
                                        >
                                            <span className="font-bold text-lg">⋮</span>
                                        </button>

                                        {/* --- DROPDOWN OPSI --- */}
                                        {openMenuId === item.id && (
                                            <div className="absolute right-6 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 animate-fade-in-down overflow-hidden">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(item)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 border-t border-gray-100"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                                    Belum ada data lokasi PKL.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Komponen Dialog Form Tambah/Edit */}
            <LokasiPKLDialog 
                isOpen={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)} 
                onSuccess={loadData}
                selectedData={selectedData}
            />

            {/* --- SHEET KONFIRMASI HAPUS --- */}
            {isDeleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-red-600">Hapus Lokasi PKL</h2>
                            <p className="text-sm text-gray-500 mt-1">Tindakan ini bersifat permanen.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="text-sm font-bold text-red-800 mb-2">Peringatan!</h3>
                                <p className="text-sm text-red-700">
                                    Data lokasi PKL ini akan dihapus dari sistem.
                                </p>
                                <ul className="list-disc list-inside mt-2 text-sm font-bold text-red-900">
                                    <li>Siswa: {itemToDelete?.siswa_nama}</li>
                                    <li>Mitra: {itemToDelete?.nama_perusahaan}</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ketik ulang <span className="text-black border-b-2 border-red-500">{itemToDelete?.nama_perusahaan}</span> untuk konfirmasi
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-red-200 focus:border-red-500 text-center font-mono"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="Ketik nama perusahaan..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                                Batal
                            </Button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteConfirmation !== itemToDelete?.nama_perusahaan}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors min-w-24 disabled:bg-red-300 disabled:cursor-not-allowed"
                            >
                                Tetap Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaporanLokasiPKLPage;