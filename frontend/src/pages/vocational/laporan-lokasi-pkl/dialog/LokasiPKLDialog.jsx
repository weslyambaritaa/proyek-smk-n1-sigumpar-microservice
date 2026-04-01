import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { vocationalApi } from '../../../../api/vocationalApi';
import { academicApi } from '../../../../api/academicApi';
import toast from 'react-hot-toast'; // <-- Import toast di sini

const LokasiPKLDialog = ({ isOpen, onClose, onSuccess, selectedData }) => {
    // Inisialisasi state dengan nilai default yang aman
    const [formData, setFormData] = useState({ 
        siswa_id: '', 
        nama_perusahaan: '', 
        alamat: '' 
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [allSiswa, setAllSiswa] = useState([]); 
    const [siswaOptions, setSiswaOptions] = useState([]); 
    const [showDropdown, setShowDropdown] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    // Fetch semua data siswa SATU KALI saat dialog dibuka
    useEffect(() => {
        if (isOpen) {
            const fetchSiswa = async () => {
                setLoadingSearch(true);
                try {
                    const res = await academicApi.getAllSiswa(); 
                    setAllSiswa(Array.isArray(res.data) ? res.data : []);
                } catch (error) {
                    console.error("Gagal mengambil data siswa:", error);
                    setAllSiswa([]);
                } finally {
                    setLoadingSearch(false);
                }
            };
            
            if (allSiswa.length === 0) {
                fetchSiswa();
            }
        }
    }, [isOpen]); 

    // Sinkronisasi data saat mode Edit atau Tambah Baru
    useEffect(() => {
        if (isOpen) {
            if (selectedData) {
                setFormData({
                    siswa_id: selectedData.siswa_id || '',
                    nama_perusahaan: selectedData.nama_perusahaan || '',
                    alamat: selectedData.alamat || ''
                });
                setSearchTerm(selectedData.siswa_nama || `ID Siswa: ${selectedData.siswa_id}`);
            } else {
                setFormData({ siswa_id: '', nama_perusahaan: '', alamat: '' });
                setSearchTerm('');
            }
            setSiswaOptions([]);
            setShowDropdown(false);
        }
    }, [isOpen, selectedData]);

    // Fungsi pencarian siswa (FILTER LOKAL)
    const handleSearchSiswa = (val) => {
        setSearchTerm(val);
        
        if (val.length > 1) {
            const filteredSiswa = allSiswa.filter(siswa => {
                const namaMatch = siswa?.nama_lengkap?.toLowerCase().includes(val.toLowerCase()) || 
                                  siswa?.nama?.toLowerCase().includes(val.toLowerCase());
                const kelasMatch = siswa?.nama_kelas?.toLowerCase().includes(val.toLowerCase()) ||
                                   siswa?.kelas?.toLowerCase().includes(val.toLowerCase());
                return namaMatch || kelasMatch;
            });
            
            setSiswaOptions(filteredSiswa);
            setShowDropdown(filteredSiswa.length > 0);
        } else {
            setSiswaOptions([]);
            setShowDropdown(false);
        }
    };

    const selectSiswa = (siswa) => {
        setFormData((prev) => ({ ...prev, siswa_id: siswa.id }));
        const nama = siswa.nama_lengkap || siswa.nama;
        const kelas = siswa.nama_kelas || siswa.kelas || '-';
        
        setSearchTerm(`${nama} (${kelas})`);
        setShowDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi sebelum kirim
        if (!formData.siswa_id) {
            toast.error("Silakan pilih siswa dari hasil pencarian terlebih dahulu.");
            return;
        }

        // Gunakan Promise agar toast bisa mendeteksi status loading, success, dan error
        const actionPromise = selectedData 
            ? vocationalApi.updateLaporanPKL(selectedData.id, formData)
            : vocationalApi.createLaporanPKL(formData);

        toast.promise(actionPromise, {
            loading: selectedData ? "Menyimpan perubahan..." : "Menambahkan lokasi PKL...",
            success: selectedData ? "Data berhasil diperbarui!" : "Lokasi PKL berhasil ditambahkan!",
            error: "Terjadi kesalahan saat menyimpan data."
        })
        .then(() => {
            onSuccess(); // Refresh tabel di halaman utama
            onClose();   // Tutup modal
        })
        .catch((err) => {
            console.error("Gagal simpan:", err);
        });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={selectedData ? "Edit Lokasi PKL" : "Tambah Lokasi PKL"}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Bagian Pencarian Siswa */}
                <div className="relative">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Cari Siswa (Nama/Kelas)</label>
                    <Input 
                        value={searchTerm} 
                        onChange={(e) => handleSearchSiswa(e.target.value)} 
                        placeholder="Ketik minimal 2 huruf..."
                        autoComplete="off"
                        required
                    />
                    
                    {/* Dropdown Hasil Pencarian */}
                    {showDropdown && (
                        <ul className="absolute z-[100] w-full bg-white border border-gray-200 rounded shadow-xl max-h-56 overflow-y-auto mt-1 py-1">
                            {siswaOptions.map((s) => (
                                <li 
                                    key={s.id} 
                                    onClick={() => selectSiswa(s)} 
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 text-sm transition-colors"
                                >
                                    <div className="font-semibold text-gray-800">{s.nama_lengkap || s.nama}</div>
                                    <div className="text-xs text-gray-500">Kelas: {s.nama_kelas || s.kelas || '-'} | NISN: {s.nisn || '-'}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {loadingSearch && (
                        <div className="absolute right-3 top-9">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                    )}
                </div>

                <Input 
                    label="Nama Perusahaan / Mitra"
                    placeholder="Contoh: PT. Maju Bersama"
                    value={formData.nama_perusahaan}
                    onChange={(e) => setFormData({...formData, nama_perusahaan: e.target.value})}
                    required
                />

                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1 text-gray-700">Alamat PKL</label>
                    <textarea 
                        className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        rows="3"
                        placeholder="Masukkan alamat lengkap perusahaan..."
                        value={formData.alamat}
                        onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-6">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" variant="primary">
                        {selectedData ? "Simpan Perubahan" : "Tambah Laporan"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default LokasiPKLDialog;