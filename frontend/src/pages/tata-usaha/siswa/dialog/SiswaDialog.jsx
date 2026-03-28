import React, { useState, useEffect } from 'react';
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import { academicApi } from "../../../../api/academicApi";

const SiswaDialog = ({ isOpen, onClose, onSuccess, selectedSiswa }) => {
    const [formData, setFormData] = useState({ nisn: '', nama_lengkap: '', kelas_id: '' });
    const [listKelas, setListKelas] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchKelas();
            if (selectedSiswa) setFormData(selectedSiswa);
            else setFormData({ nisn: '', nama_lengkap: '', kelas_id: '' });
        }
    }, [isOpen, selectedSiswa]);

    const fetchKelas = async () => {
        try {
            const res = await academicApi.getAllKelas();
            setListKelas(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedSiswa) await academicApi.updateSiswa(selectedSiswa.id, formData);
            else await academicApi.createSiswa(formData);
            onSuccess();
            onClose();
        } catch (err) { alert("Gagal menyimpan data"); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={selectedSiswa ? "Edit Siswa" : "Tambah Siswa"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="NISN" value={formData.nisn} onChange={(e) => setFormData({...formData, nisn: e.target.value})} required />
                <Input label="Nama Lengkap" value={formData.nama_lengkap} onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})} required />
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kelas</label>
                    <select 
                        className="mt-1 block w-full border rounded-md p-2"
                        value={formData.kelas_id}
                        onChange={(e) => setFormData({...formData, kelas_id: e.target.value})}
                        required
                    >
                        <option value="">Pilih Kelas</option>
                        {listKelas.map(k => (
                            <option key={k.id} value={k.id}>{k.tingkat} - {k.nama_kelas}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Batal</Button>
                    <Button type="submit">Simpan</Button>
                </div>
            </form>
        </Modal>
    );
};

export default SiswaDialog;