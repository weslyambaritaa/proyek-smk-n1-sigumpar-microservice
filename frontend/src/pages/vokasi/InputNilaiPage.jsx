import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { vocationalApi } from "../../api/vocationalApi";

const InputNilaiPage = ({ pklId }) => {
  const [formData, setFormData] = useState({
    nilai_angka: "",
    predikat: "",
    keterangan: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vocationalApi.inputNilai({ pkl_id: pklId, ...formData });
      alert("Nilai Berhasil Disimpan!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Input Nilai Akhir PKL</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nilai Angka"
          type="number"
          value={formData.nilai_angka}
          onChange={(e) =>
            setFormData({ ...formData, nilai_angka: e.target.value })
          }
        />
        <Input
          label="Predikat (A/B/C)"
          value={formData.predikat}
          onChange={(e) =>
            setFormData({ ...formData, predikat: e.target.value })
          }
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Keterangan Tambahan"
          onChange={(e) =>
            setFormData({ ...formData, keterangan: e.target.value })
          }
        />
        <Button type="submit">Simpan Nilai Akhir</Button>
      </form>
    </div>
  );
};

export default InputNilaiPage;
