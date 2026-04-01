import React, { useState, useEffect } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import Button from '../../../components/ui/Button';
import LokasiPKLDialog from './dialog/LokasiPKLDialog';

const LaporanLokasiPKLPage = () => {
    // State untuk menyimpan data tabel
    const [data, setData] = useState([]);
    
    // State untuk mengontrol buka/tutup Modal Dialog (PENTING)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // State untuk menyimpan data yang sedang diedit (PENTING)
    const [selectedData, setSelectedData] = useState(null);

    const loadData = async () => {
    try {
        const res = await vocationalApi.getAllLaporanPKL();
        // Memastikan data yang di-set ke state selalu berbentuk Array
        if (res && res.data && Array.isArray(res.data)) {
            setData(res.data);
        } else {
            setData([]);
        }
    } catch (err) { 
        console.error("Error load data", err);
        setData([]); 
    }
    };

    useEffect(() => { 
        loadData(); 
    }, []);

    const handleEdit = (item) => {
        setSelectedData(item); // Masukkan data item ke state agar muncul di form dialog
        setIsDialogOpen(true); // Buka dialog
    };

    const handleDelete = async (id) => {
        if (window.confirm("Hapus laporan ini?")) {
            try {
                await vocationalApi.deleteLaporanPKL(id);
                loadData();
            } catch (err) {
                alert("Gagal menghapus data");
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Laporan Lokasi PKL</h1>
                {/* Tombol Tambah: Reset selectedData menjadi null agar form kosong */}
                <Button onClick={() => { setSelectedData(null); setIsDialogOpen(true); }}>
                    + Tambah Lokasi
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Siswa ID</th>
                            <th className="p-4 font-semibold text-gray-600">Perusahaan</th>
                            <th className="p-4 font-semibold text-gray-600">Alamat</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4 font-mono text-sm">{item.siswa_id}</td>
                                <td className="p-4 font-medium">{item.nama_perusahaan}</td>
                                <td className="p-4 text-gray-600">{item.alamat}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <Button variant="secondary" onClick={() => handleEdit(item)}>Edit</Button>
                                    <Button variant="danger" onClick={() => handleDelete(item.id)}>Hapus</Button>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-400">Belum ada data lokasi PKL.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Komponen Dialog */}
            <LokasiPKLDialog 
                isOpen={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)} 
                onSuccess={loadData}
                selectedData={selectedData}
            />
        </div>
    );
};

export default LaporanLokasiPKLPage;