# CODING_GUIDELINES.md

Standar koding proyek **SMK N1 Sigumpar Microservice** — hasil analisis codebase aktif di branch `main`.

---

## 1. BACKEND — Standar Umum

### Bahasa & Module System
- **CommonJS** (`require` / `module.exports`) — bukan ES6 `import/export`
- **async/await** dengan `try/catch` — semua operasi DB harus async

### Struktur Entry Point (`src/index.js`)

Urutan wajib:

```javascript
const express = require("express");
const helmet  = require("helmet");
const morgan  = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");

const app  = express();
const PORT = process.env.PORT || <port_default>;

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "<nama-service>", timestamp: new Date().toISOString() });
});

// Mount routes
app.use("/api/<resource>", require("./routes/<resource>Routes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' tidak ditemukan` });
});

// Error handler — SELALU paling akhir
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => console.log(`<Service> running on port ${PORT}`));
```

> **Catatan penting:** CORS **tidak** diaktifkan di service. Nginx/API Gateway yang menangani CORS.

---

## 2. BACKEND — Controller

### Format Response JSON Standar

| Situasi | Format |
|---------|--------|
| GET list | `res.json({ success: true, data: result.rows })` |
| GET single / POST / PUT | `res.json({ success: true, data: result.rows[0] })` |
| POST created | `res.status(201).json({ success: true, data: result.rows[0] })` |
| Not found | `res.status(404).json({ success: false, message: "..." })` |
| Error | `next(err)` — jangan pernah `res.status(500)` langsung |

### Template Controller

```javascript
const pool = require("../config/db");

const getAll = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM <tabel> ORDER BY id DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  const { field1, field2 } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO <tabel> (field1, field2) VALUES ($1, $2) RETURNING *",
      [field1, field2]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAll, create };
```

**Aturan:**
- Selalu gunakan **parameterized query** (`$1`, `$2`, ...) — tidak boleh string interpolasi
- Gunakan `RETURNING *` pada INSERT/UPDATE untuk mengembalikan record tanpa SELECT terpisah
- Destructuring `req.body` di baris pertama fungsi

---

## 3. BACKEND — Routes

### Template Routes

```javascript
const express    = require("express");
const router     = express.Router();
const verifyToken = require("../middleware/auth");
const ctrl       = require("../controllers/<resource>Controller");

router.use(verifyToken); // Terapkan auth ke semua route di bawah

router.get("/",       ctrl.getAll);
router.get("/:id",    ctrl.getById);
router.post("/",      ctrl.create);
router.put("/:id",    ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
```

**Aturan:**
- Mount di `index.js` dengan prefix: `app.use("/api/<service>/<resource>", routes)`
- Route di dalam file menggunakan path **pendek tanpa prefix** (`/`, `/:id`)
- Untuk file upload: tambahkan `upload.single("fieldname")` sebelum controller method

---

## 4. BACKEND — Middleware

### Auth Middleware (`src/middleware/auth.js`)

Dua varian yang digunakan:

| Varian | Dipakai di | Cara kerja |
|--------|-----------|------------|
| `verifyToken` (full verify) | auth-service, student-service, vocational-service | Verifikasi JWT via JWKS Keycloak (RS256) |
| `extractIdentity` (decode only) | academic-service | Decode JWT tanpa verifikasi — mengandalkan Nginx upstream |

### Error Handler (`src/middleware/errorHandler.js`)

```javascript
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = { errorHandler, createError };
```

---

## 5. DATABASE — Manajemen Skema

### Pendekatan: `init.sql` murni (tanpa ORM/migrasi)

Setiap service memiliki satu file `init.sql` di root service-nya. File ini dieksekusi satu kali saat container pertama kali start.

**Aturan skema:**
- Selalu gunakan `CREATE TABLE IF NOT EXISTS` — aman dijalankan berulang
- Primary key: `SERIAL PRIMARY KEY` untuk auto-increment integer
- Foreign key antar tabel dalam service yang sama: gunakan `REFERENCES <tabel>(id) ON DELETE CASCADE`
- **Foreign key lintas service: DILARANG** — simpan ID-nya saja sebagai kolom biasa
- Timestamp standar: `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- Untuk record yang perlu update: tambahkan `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

**Contoh tabel standar:**

```sql
CREATE TABLE IF NOT EXISTS <nama_tabel> (
    id          SERIAL PRIMARY KEY,
    nama        VARCHAR(100) NOT NULL,
    keterangan  TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Konfigurasi Koneksi DB (`src/config/db.js`)

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  user:     process.env.DB_USER     || "<service>_user",
  host:     process.env.DB_HOST     || "localhost",
  database: process.env.DB_NAME     || "<service>_db",
  password: process.env.DB_PASSWORD || undefined,
  port:     5432,
});

module.exports = pool;
```

> `password: undefined` (bukan `null`) agar library `pg` tidak menolak koneksi saat password kosong.

---

## 6. DOCKER — Konfigurasi Service

### `start.sh` — Standar Startup Script

```bash
#!/bin/bash
service postgresql start

until sudo -u postgres pg_isready -q; do
  echo "Menunggu PostgreSQL siap..."
  sleep 1
done

# Patch pg_hba.conf ke trust agar Node.js bisa connect tanpa password
PG_HBA=$(sudo -u postgres psql -At -c "SHOW hba_file;" 2>/dev/null)
if [ -n "$PG_HBA" ]; then
  sed -i 's/host\s\+all\s\+all\s\+127\.0\.0\.1\/32\s\+scram-sha-256/host all all 127.0.0.1\/32 trust/' "$PG_HBA"
  sed -i 's/host\s\+all\s\+all\s\+::1\/128\s\+scram-sha-256/host all all ::1\/128 trust/' "$PG_HBA"
  sudo -u postgres psql -c "SELECT pg_reload_conf();" || true
fi

sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || true
sudo -u postgres psql -d $DB_NAME -f ./init.sql || true

npm run dev
```

> **Penting:** Simpan `start.sh` dengan line ending **LF** (bukan CRLF). Di VSCode: klik "CRLF" di status bar → pilih "LF".

### `docker-compose.yml` — Environment Variables

YAML anchor (`<<: *service-template`) **tidak** menggabungkan `environment:` — ia **menimpa**. Karena itu setiap service wajib mendefinisikan semua env yang diperlukan secara eksplisit di blok-nya sendiri:

```yaml
vocational-service:
  <<: *service-template
  environment:
    - PORT=3007
    - DB_NAME=vocational_db
    - DB_USER=postgres
    - DB_PASSWORD=          # String kosong, bukan dihapus
    - DATABASE_URL=postgres://postgres@localhost:5432/vocational_db
```

> **Volume database:** Proyek ini tidak menggunakan named volume per service. Data PostgreSQL di dalam container bersifat **ephemeral** — reset saat container di-recreate. Ini disengaja untuk kemudahan development.

---

## 7. FRONTEND — Standar

### HTTP Client

Gunakan instance Axios terpusat di `src/api/axiosInstance.js`:

```javascript
import axios from "axios";
import keycloak from "../keycloak";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001",
});

// Request interceptor: auto-refresh token Keycloak
api.interceptors.request.use(async (config) => {
  await keycloak.updateToken(30);
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});

export default api;
```

**Aturan:**
- Semua pemanggilan API **harus** menggunakan instance ini, bukan `axios` langsung
- Kelompokkan endpoint per domain di folder `src/api/` (contoh: `academicApi.js`, `vocationApi.js`)

### State Management

Gunakan **custom hooks** — tidak ada Redux/Zustand:

```javascript
// src/hooks/useSubmissions.js
import { useState, useCallback } from "react";
import { getSubmissions, createSubmission } from "../api/vocationApi";

export function useSubmissions() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try   { setData(await getSubmissions()); }
    catch (err) { setError(err); }
    finally { setLoading(false); }
  }, []);

  return { data, loading, error, load };
}
```

### Notifikasi

Gunakan `react-hot-toast` dengan pattern `toast.promise()`:

```javascript
toast.promise(
  createSubmission(formData),
  { loading: "Menyimpan...", success: "Berhasil!", error: "Gagal menyimpan." }
);
```

### Styling

- **Tailwind CSS** — tidak ada CSS-in-JS atau SCSS
- Komponen UI reusable ada di `src/components/ui/`

---

## 8. RINGKASAN QUICK REFERENCE

| Aspek | Standar |
|-------|---------|
| Module system | CommonJS (`require`/`module.exports`) |
| DB query | Parameterized `$1, $2` — wajib, no interpolasi |
| Response format | `{ success: true/false, data: ..., message: ... }` |
| Error propagation | `next(err)` ke errorHandler middleware |
| DB skema | `init.sql` dengan `CREATE TABLE IF NOT EXISTS` |
| FK lintas service | **Dilarang** — simpan ID saja |
| Auth | Keycloak JWT, verifikasi via JWKS |
| Frontend HTTP | Axios instance terpusat dengan token interceptor |
| Frontend state | Custom hooks, bukan Redux/Zustand |
| Line endings | **LF** pada semua file `.sh` |
| CORS | Ditangani Nginx, dinonaktifkan di service |
