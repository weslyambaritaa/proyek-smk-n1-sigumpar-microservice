import { Head } from "@inertiajs/react";
import WakepsekLayout from "@/Layouts/WakepsekLayout";

const perangkatList = [
  { nama: "RPP Semester Ganjil", status: "Lengkap" },
  { nama: "Silabus Kelas X", status: "Belum Lengkap" },
  { nama: "Budi Materi Pembelajaran", status: "Lengkap" },
];

export default function DetailPembelajaran() {
  return (
    <WakepsekLayout title="Sistem Pengecekan Perangkat Pembelajaran">
      <Head title="Wakepsek-Detail Pembelajaran" />
      <div style={{ backgroundColor: "white", padding: 24, borderRadius: 6 }}>
        <h2 style={{ marginTop: 0, fontSize: 18, color: "#333" }}>
          Detail Perangkat Pembelajaran Guru
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 28 }}>👤</span>
          <div>
            <p style={{ margin: 0, fontSize: 14 }}>
              Nama Guru: Wesly Pasaribu, S.Pd
            </p>
            <p style={{ margin: 0, fontSize: 14 }}>NIP: 11S23047</p>
          </div>
        </div>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>
          Daftar Perangkat Pembelajaran
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 1fr",
            backgroundColor: "#dce8f5",
            padding: "10px 16px",
            borderRadius: 4,
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          <span>Nama Guru</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Aksi</span>
        </div>
        {perangkatList.map((item, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr",
              padding: "12px 16px",
              borderBottom: "1px solid #eee",
              alignItems: "center",
              fontSize: 14,
            }}
          >
            <span>{item.nama}</span>
            <span
              style={{
                color: item.status === "Lengkap" ? "green" : "red",
                fontWeight: "600",
              }}
            >
              {item.status}
            </span>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                style={{
                  backgroundColor: "#5b8dd9",
                  color: "white",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Lihat
              </button>
              <button
                style={{
                  backgroundColor: "#e04040",
                  color: "white",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </WakepsekLayout>
  );
}
