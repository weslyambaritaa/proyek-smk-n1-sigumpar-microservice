import { Head, Link } from "@inertiajs/react";
import WakepsekLayout from "@/Layouts/WakepsekLayout";

const guruList = [
  { nama: "Ivana Pasaribu", status: "Lengkap" },
  { nama: "Wesly Ambarita", status: "Belum Lengkap" },
  { nama: "Daniel Simatupang", status: "Lengkap" },
];

export default function DaftarGuru() {
  return (
    <WakepsekLayout title="Sistem Pengecekan Perangkat Pembelajaran">
      <Head title="Wakepsek-Daftar Guru" />
      <div style={{ backgroundColor: "white", padding: 24, borderRadius: 6 }}>
        <h2 style={{ marginTop: 0, fontSize: 18, color: "#333" }}>
          Daftar Guru
        </h2>
        <p style={{ fontSize: 13, color: "#666", marginTop: -8 }}>
          Daftar semua guru dengan status unggahan perangkat pembelajaran
          masing-masing.
        </p>
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
          <span>Status Unggahan</span>
          <span style={{ textAlign: "right" }}>Aksi</span>
        </div>
        {guruList.map((guru, i) => (
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
            <span>{guru.nama}</span>
            <span style={{ fontWeight: "bold", color: "#333" }}>
              {guru.status}
            </span>
            <div style={{ textAlign: "right" }}>
              <Link
                href="/wakepsek/detail-pembelajaran"
                style={{
                  backgroundColor: "#5b8dd9",
                  color: "white",
                  padding: "6px 14px",
                  borderRadius: 4,
                  fontSize: 13,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Lihat detail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </WakepsekLayout>
  );
}
