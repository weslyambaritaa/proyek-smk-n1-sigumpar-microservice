import { Head } from "@inertiajs/react";
import WakepsekLayout from "@/Layouts/WakepsekLayout";

export default function Dashboard() {
  const pengumuman = [
    "Pengumuman Kenaikan Pangkat Guru Maret 2026",
    "Pembaruan Data Kepegawaian Semester Genap",
    "Imbauan Ketertiban dan Disiplin Sekolah",
  ];

  return (
    <WakepsekLayout>
      <Head title="Wakepsek-Dashboard" />
      <div style={{ display: "flex", gap: 20 }}>
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: 20,
            borderRadius: 6,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, color: "#333" }}>
            Selamat Datang Daniel Simamora!
          </h2>
        </div>
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: 20,
            borderRadius: 6,
          }}
        >
          <h3 style={{ marginTop: 0, fontSize: 16, color: "#333" }}>
            Pengumuman
          </h3>
          {pengumuman.map((item, i) => (
            <p key={i} style={{ margin: "6px 0", fontSize: 14, color: "#555" }}>
              {item}
            </p>
          ))}
        </div>
      </div>
    </WakepsekLayout>
  );
}
