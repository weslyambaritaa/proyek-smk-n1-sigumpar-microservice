import { Head, useForm } from "@inertiajs/react";
import WakepsekLayout from "@/Layouts/WakepsekLayout";

export default function FormInstruksi() {
  const { data, setData, post, processing } = useForm({
    nama_guru: "",
    jenis: "Notifikasi",
    pesan: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post("/wakepsek/form-instruksi/send");
  };

  return (
    <WakepsekLayout title="Sistem Pengecekan Perangkat Pembelajaran">
      <Head title="Wakepsek-Form Instruksi" />
      <div
        style={{
          backgroundColor: "white",
          padding: 24,
          borderRadius: 6,
          maxWidth: 760,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 18, color: "#333" }}>
          Form Notofikasi/Instruksi
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              Nama Guru
            </label>
            <input
              type="text"
              placeholder="Masukan nama guru"
              value={data.nama_guru}
              onChange={(e) => setData("nama_guru", e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 14,
                border: "1px solid #ccc",
                borderRadius: 4,
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              Jenis Notifikasi/Instruksi
            </label>
            <select
              value={data.jenis}
              onChange={(e) => setData("jenis", e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 14,
                border: "1px solid #ccc",
                borderRadius: 4,
                backgroundColor: "white",
                boxSizing: "border-box",
              }}
            >
              <option value="Notifikasi">Notifikasi</option>
              <option value="Instruksi">Instruksi</option>
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              Pesan
            </label>
            <textarea
              placeholder="Tulis pesan disini"
              value={data.pesan}
              onChange={(e) => setData("pesan", e.target.value)}
              rows={7}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 14,
                border: "1px solid #ccc",
                borderRadius: 4,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={processing}
            style={{
              backgroundColor: "#5b8dd9",
              color: "white",
              border: "none",
              padding: "10px 22px",
              fontSize: 14,
              borderRadius: 4,
              cursor: "pointer",
              opacity: processing ? 0.7 : 1,
            }}
          >
            Kirim Notifikasi/instruksi
          </button>
        </form>
      </div>
    </WakepsekLayout>
  );
}
