# FEATURE_CATALOG_MAIN.md

Katalog lengkap fitur & endpoint API di branch `main` — diorganisasikan per microservice.

> **Keterangan status:**
> - ✅ Berfungsi normal
> - ⚠️ Implementasi parsial / stub
> - ❌ Broken (service crash saat startup)

---

## 1. AUTH-SERVICE (Port 3005)

**Mount prefix:** `/api/auth`
**Status:** ✅

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/auth/verify` | Verifikasi token JWT untuk Nginx gateway | Keycloak DB (`user_entity`) |
| GET | `/api/auth/users/search` | Cari guru/pengguna berdasarkan role & keyword (dipakai untuk autocomplete di form) | Keycloak DB |
| GET | `/api/auth/` | Ambil semua pengguna yang terdaftar di Keycloak | Keycloak DB |

**Catatan:** Auth-service tidak memiliki database sendiri — semua data diambil langsung dari Keycloak melalui Admin API.

---

## 2. ACADEMIC-SERVICE (Port 3003)

**Mount prefix:** `/api/academic`
**Status:** ✅
**Static files:** `/api/academic/uploads` → file arsip surat

### Kelas

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/academic/kelas` | Daftar semua kelas, urut berdasarkan tingkat & nama | `kelas` |
| POST | `/api/academic/kelas` | Buat kelas baru (opsional: assign wali kelas) | `kelas` |
| PUT | `/api/academic/kelas/:id` | Update nama kelas, tingkat, atau wali kelas | `kelas` |
| DELETE | `/api/academic/kelas/:id` | Hapus kelas | `kelas` |

### Siswa

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/academic/siswa` | Daftar semua siswa beserta nama kelas (JOIN) | `siswa`, `kelas` |
| POST | `/api/academic/siswa` | Daftarkan siswa baru dengan NISN dan kelas | `siswa` |
| PUT | `/api/academic/siswa/:id` | Update data siswa | `siswa` |
| DELETE | `/api/academic/siswa/:id` | Hapus data siswa | `siswa` |

### Pengumuman

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/academic/pengumuman` | Daftar semua pengumuman, terbaru di atas | `pengumuman` |
| POST | `/api/academic/pengumuman` | Buat pengumuman baru | `pengumuman` |
| PUT | `/api/academic/pengumuman/:id` | Edit judul/isi pengumuman | `pengumuman` |
| DELETE | `/api/academic/pengumuman/:id` | Hapus pengumuman | `pengumuman` |

### Arsip Surat

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/academic/arsip-surat` | Daftar semua arsip surat, terbaru di atas | `arsip_surat` |
| POST | `/api/academic/arsip-surat` | Upload surat baru (multipart/form-data + file) | `arsip_surat` + filesystem |
| PUT | `/api/academic/arsip-surat/:id` | Update nomor surat atau ganti file | `arsip_surat` + filesystem |
| DELETE | `/api/academic/arsip-surat/:id` | Hapus record dan file fisiknya | `arsip_surat` + filesystem |

### Mata Pelajaran

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/academic/mapel` | Daftar mapel beserta info kelas & guru (JOIN) | `mata_pelajaran`, `kelas` |
| POST | `/api/academic/mapel` | Assign mapel baru ke kelas & guru | `mata_pelajaran` |
| PUT | `/api/academic/mapel/:id` | Update nama mapel, kelas, atau guru | `mata_pelajaran` |
| DELETE | `/api/academic/mapel/:id` | Hapus mapel | `mata_pelajaran` |

### Jadwal Mengajar

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/academic/jadwal` | Daftar jadwal mengajar, urut hari & jam (JOIN kelas) | `jadwal_mengajar`, `kelas` |
| POST | `/api/academic/jadwal` | Buat jadwal mengajar (guru, kelas, mapel, hari, jam) | `jadwal_mengajar` |
| PUT | `/api/academic/jadwal/:id` | Update detail jadwal | `jadwal_mengajar` |
| DELETE | `/api/academic/jadwal/:id` | Hapus jadwal | `jadwal_mengajar` |

### Jadwal Piket

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/academic/piket` | Daftar jadwal piket, urut tanggal | `jadwal_piket` |
| POST | `/api/academic/piket` | Buat jadwal piket guru | `jadwal_piket` |
| PUT | `/api/academic/piket/:id` | Update tanggal atau guru piket | `jadwal_piket` |
| DELETE | `/api/academic/piket/:id` | Hapus jadwal piket | `jadwal_piket` |

### Jadwal Upacara

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/academic/upacara` | Daftar jadwal upacara, terbaru di atas | `jadwal_upacara` |
| POST | `/api/academic/upacara` | Buat jadwal upacara beserta petugas | `jadwal_upacara` |
| PUT | `/api/academic/upacara/:id` | Update tanggal atau petugas upacara | `jadwal_upacara` |
| DELETE | `/api/academic/upacara/:id` | Hapus jadwal upacara | `jadwal_upacara` |

---

## 3. STUDENT-SERVICE (Port 3008)

**Mount prefix:** `/api/students`
**Status:** ⚠️ (implementasi minimal)

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/students/` | Daftar semua pengguna/siswa | `users` |
| POST | `/api/students/` | Buat record pengguna baru | `users` |
| GET | `/api/students/:id` | Ambil siswa berdasarkan ID | `users` |
| PUT | `/api/students/:id` | Update data siswa | `users` |
| DELETE | `/api/students/:id` | Hapus data siswa | `users` |

---

## 4. ASSET-SERVICE (Port 3004)

**Status:** ❌ Crash saat startup — `todoRoutes` tidak pernah di-import di `index.js`

**Route yang tersimpan di file routes (tidak aktif):**

| Method | Endpoint (planned) | Fungsi Bisnis | Storage |
|--------|-------------------|---------------|---------|
| GET | `/todos/` | Daftar aset dengan filter (userId, status, priority, search) | `todos.json` |
| POST | `/todos/` | Buat entri aset baru | `todos.json` |
| GET | `/todos/:id` | Ambil aset by ID | `todos.json` |
| PUT | `/todos/:id` | Update aset | `todos.json` |
| DELETE | `/todos/:id` | Hapus aset | `todos.json` |

> Data disimpan di file JSON (`src/data/todos.json`), bukan database.

---

## 5. LEARNING-SERVICE (Port 3006)

**Status:** ❌ Crash saat startup — `todoRoutes` tidak pernah di-import di `index.js`

**Route yang tersimpan di file routes (tidak aktif):**

| Method | Endpoint (planned) | Fungsi Bisnis | Storage |
|--------|-------------------|---------------|---------|
| GET | `/todos/` | Daftar materi pembelajaran | `todos.json` |
| POST | `/todos/` | Tambah materi baru | `todos.json` |
| GET | `/todos/:id` | Ambil materi by ID | `todos.json` |
| PUT | `/todos/:id` | Update materi | `todos.json` |
| DELETE | `/todos/:id` | Hapus materi | `todos.json` |

---

## 6. VOCATIONAL-SERVICE (Port 3007)

**Status (branch main, sebelum perbaikan):** ❌ Crash — boilerplate `todoRoutes` belum di-replace
**Status (setelah perbaikan di branch ini):** ✅

**Endpoint aktual setelah perbaikan:**

**Mount prefix:** `/api/pkl`

### PKL — Submissions

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/pkl/submissions` | Daftar semua pengajuan PKL, opsional filter nama siswa | `pkl_submissions` |
| POST | `/api/pkl/submissions` | Buat pengajuan PKL baru (siswa_id, nama_perusahaan, alamat) | `pkl_submissions` |
| PUT | `/api/pkl/submissions/:id/validate` | Validasi pengajuan: set status_validasi & status_persetujuan | `pkl_submissions` |

### PKL — Monitoring

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| POST | `/api/pkl/monitoring` | Catat kunjungan monitoring + upload dokumen | `pkl_monitoring` |
| GET | `/api/pkl/monitoring/:submission_id` | Ambil riwayat monitoring untuk satu submission | `pkl_monitoring` |

### PKL — Penilaian

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/pkl/penilaian/stats` | Statistik ringkasan penilaian PKL untuk dashboard | `pkl_penilaian`, `pkl_submissions` |
| POST | `/api/pkl/penilaian/upsert` | Input atau update nilai akhir PKL (upsert by submission_id) | `pkl_penilaian` |

**Mount prefix:** `/api/pramuka`

### Pramuka — Kelas

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/pramuka/kelas` | Daftar semua kelas pramuka | `kelas_pramuka` |
| GET | `/api/pramuka/kelas/:id` | Detail satu kelas pramuka | `kelas_pramuka` |
| POST | `/api/pramuka/kelas` | Buat kelas pramuka baru | `kelas_pramuka` |
| PUT | `/api/pramuka/kelas/:id` | Update kelas pramuka | `kelas_pramuka` |
| DELETE | `/api/pramuka/kelas/:id` | Hapus kelas pramuka | `kelas_pramuka` |

### Pramuka — Absensi

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/pramuka/absensi` | Daftar semua absensi pramuka | `absensi_pramuka` |
| GET | `/api/pramuka/absensi/:id` | Detail satu record absensi | `absensi_pramuka` |
| POST | `/api/pramuka/absensi` | Catat absensi pramuka | `absensi_pramuka` |
| PUT | `/api/pramuka/absensi/:id` | Update record absensi | `absensi_pramuka` |
| DELETE | `/api/pramuka/absensi/:id` | Hapus record absensi | `absensi_pramuka` |

### Pramuka — Laporan

| Method | Endpoint | Fungsi Bisnis | Tabel |
|--------|----------|---------------|-------|
| GET | `/api/pramuka/laporan` | Daftar semua laporan pramuka | `laporan_pramuka` |
| GET | `/api/pramuka/laporan/:id` | Detail satu laporan | `laporan_pramuka` |
| POST | `/api/pramuka/laporan` | Buat laporan pramuka baru | `laporan_pramuka` |
| PUT | `/api/pramuka/laporan/:id` | Update laporan | `laporan_pramuka` |
| DELETE | `/api/pramuka/laporan/:id` | Hapus laporan | `laporan_pramuka` |

---

## 7. FRONTEND — Inventaris Halaman

### Domain: Tata Usaha (Fully Implemented ✅)

Semua halaman menggunakan pola: tabel data + side-panel dialog untuk CRUD.

| Route | Komponen | Fungsi | API yang Dipanggil |
|-------|----------|--------|--------------------|
| `/` | `Dashboard.jsx` | Halaman selamat datang, info user & jam | — (dari Keycloak token) |
| `/academic/kelas` | `KelasPage.jsx` | CRUD kelas + assign wali kelas | `GET/POST/PUT/DELETE /api/academic/kelas`, `GET /api/auth/users/search` |
| `/academic/siswa` | `SiswaPage.jsx` | CRUD data siswa + assign kelas | `GET/POST/PUT/DELETE /api/academic/siswa`, `GET /api/academic/kelas` |
| `/academic/pengumuman` | `PengumumanPage.jsx` | CRUD pengumuman sekolah | `GET/POST/PUT/DELETE /api/academic/pengumuman` |
| `/academic/arsip-surat` | `ArsipSuratPage.jsx` | CRUD arsip surat + upload file | `GET/POST/PUT/DELETE /api/academic/arsip-surat` |
| `/academic/mapel` | `MapelPage.jsx` | CRUD mata pelajaran + assign guru | `GET/POST/PUT/DELETE /api/academic/mapel`, `GET /api/auth/users/search` |
| `/academic/jadwal` | `JadwalPage.jsx` | CRUD jadwal mengajar | `GET/POST/PUT/DELETE /api/academic/jadwal`, `GET /api/auth` |
| `/academic/piket` | `PiketPage.jsx` | CRUD jadwal piket guru | `GET/POST/PUT/DELETE /api/academic/piket`, `GET /api/auth` |
| `/academic/upacara` | `UpacaraPage.jsx` | CRUD jadwal upacara | `GET/POST/PUT/DELETE /api/academic/upacara` |

### Domain: Wakepsek (Stub / Mock ⚠️)

Halaman ini menggunakan layout Inertia.js terpisah (bukan React Router utama) dan berisi data hardcoded.

| File | Fungsi | Status |
|------|--------|--------|
| `wakepsek/Dashboard/DashboarPage.jsx` | Beranda waka, tampilkan pengumuman | Data hardcoded |
| `wakepsek/Daftar Guru/DaftarGuruPage.jsx` | Daftar guru + status upload dokumen | Data hardcoded |
| `wakepsek/Detail Pembelajaran/DetailPembelajaranPage.jsx` | Detail dokumen pembelajaran per guru | Data hardcoded |
| `wakepsek/Form Instruksi/FormInstruksi.jsx` | Form kirim instruksi ke guru | Form ada, backend tidak jelas |

### Nav Links Terdaftar tapi Belum Ada Halaman (❌ Not Implemented)

| Route | Role | Fungsi yang Direncanakan |
|-------|------|--------------------------|
| `/laporan-tahunan` | kepala-sekolah | Laporan tahunan sekolah |
| `/kurikulum` | waka-sekolah | Manajemen kurikulum |
| `/input-nilai` | guru-mapel | Input nilai siswa |
| `/presensi-kelas` | wali-kelas | Presensi kelas harian |
| `/nilai-pramuka` | pramuka | Input nilai kegiatan pramuka |
| `/proyek-vokasi` | vokasi | Manajemen proyek PKL/vokasi |

---

## Ringkasan Status Keseluruhan

| Microservice | Endpoint Aktif | Status |
|---|---|---|
| auth-service | 3 | ✅ |
| academic-service | 32 | ✅ |
| student-service | 5 | ⚠️ Minimal |
| asset-service | 0 | ❌ Crash |
| learning-service | 0 | ❌ Crash |
| vocational-service | 22 | ✅ (setelah perbaikan) |
| **Frontend pages** | **9 fully implemented** | ✅ |
| **Frontend pages stub** | **4 mock pages** | ⚠️ |
| **Frontend pages missing** | **6 nav links** | ❌ |
