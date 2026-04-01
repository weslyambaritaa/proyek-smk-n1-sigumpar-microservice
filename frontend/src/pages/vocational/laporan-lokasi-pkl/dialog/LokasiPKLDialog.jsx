import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { vocationalApi } from '../../../../api/vocationalApi';

const LokasiPKLDialog = ({ isOpen, onClose, onSuccess, selectedData }) => {
    const [formData, setFormData] = useState({ siswa_id: '', nama_perusahaan: '', alamat: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [siswaOptions, setSiswaOptions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (selectedData) {
            setFormData(selectedData);
            setSearchTerm(`ID: ${selectedData.siswa_id}`); // Atau nama jika BE join data
        } else {
            setFormData({ siswa_id: '', nama_perusahaan: '', alamat: '' });
            setSearchTerm('');
        }
    }, [selectedData]);

    const handleSearchSiswa = async (val) => {
        setSearchTerm(val);
        if (val.length > 1) {
            try {
                const res = await vocationalApi.searchSiswa(val);
                setSiswaOptions(res.data);
                setShowDropdown(true);
            } catch (err) { console.error(err); }
        } else {
            setSiswaOptions([]);
            setShowDropdown(false);
        }
    };

    const selectSiswa = (siswa) => {
        setFormData({ ...formData, siswa_id: siswa.id });
        setSearchTerm(`${siswa.nama} (${siswa.kelas})`);
        setShowDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedData) {
                await vocationalApi.updateLaporanPKL(selectedData.id, formData);
            } else {
                await vocationalApi.createLaporanPKL(formData);
            }
            onSuccess();
            onClose();
        } catch (err) { alert("Gagal menyimpan data"); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={selectedData ? "Edit Lokasi PKL" : "Tambah Lokasi PKL"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <label className="block text-sm font-medium mb-1">Cari Siswa</label>
                    <Input 
                        value={searchTerm} 
                        onChange={(e) => handleSearchSiswa(e.target.value)} 
                        placeholder="Ketik nama atau kelas..."
                        required
                    />
                    {showDropdown && siswaOptions.length > 0 && (
                        <ul className="absolute z-50 w-full bg-white border rounded shadow-lg max-h-40 overflow-auto mt-1">
                            {siswaOptions.map(s => (
                                <li key={s.id} onClick={() => selectSiswa(s)} className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-sm">
                                    {s.nama} - <span className="text-gray-500">{s.kelas}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <Input 
                    label="Nama Perusahaan / Mitra"
                    value={formData.nama_perusahaan}
                    onChange={(e) => setFormData({...formData, nama_perusahaan: e.target.value})}
                    required
                />
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Alamat PKL</label>
                    <textarea 
                        className="border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="3"
                        value={formData.alamat}
                        onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                        required
                    ></textarea>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" onClick={onClose}>Batal</Button>
                    <Button type="submit">Simpan</Button>
                </div>
            </form>
        </Modal>
    );
};

export default LokasiPKLDialog;