# Inter-Service Communication

Panduan untuk komunikasi antar microservices dalam proyek SMK Sigumpar.

## Overview

Setiap service dapat berkomunikasi dengan service lainnya melalui `ServiceClient` yang telah disediakan. `ServiceClient` menyediakan:

- ✅ **HTTP Calls** dengan axios
- ✅ **Retry Mechanism** untuk network/server errors
- ✅ **Environment-based URLs** untuk fleksibilitas
- ✅ **Predefined Methods** untuk operasi umum
- ✅ **Error Handling** yang konsisten

## Setup

### 1. Environment Variables

Setiap service sudah dikonfigurasi dengan environment variables untuk service URLs:

```bash
ACADEMIC_SERVICE_URL=http://academic-service:3003
AUTH_SERVICE_URL=http://auth-service:3005
LEARNING_SERVICE_URL=http://learning-service:3006
STUDENT_SERVICE_URL=http://student-service:3004
VOCATIONAL_SERVICE_URL=http://vocational-service:3007
ASSET_SERVICE_URL=http://asset-service:3008
```

### 2. Import ServiceClient

```javascript
const serviceClient = require('../utils/serviceClient');
```

## Penggunaan

### Generic Method

```javascript
// Panggil service lain dengan method apapun
const result = await serviceClient.callService(
  'academic',           // nama service
  '/api/academic/kelas', // endpoint
  'GET',                // HTTP method
  {                     // options
    params: { kelas_id: 1 },
    headers: { Authorization: authToken }
  }
);
```

### Predefined Methods

#### Academic Service
```javascript
// Ambil data siswa (dengan filter kelas opsional)
const siswa = await serviceClient.getSiswa(kelasId, authToken);

// Ambil data kelas
const kelas = await serviceClient.getKelas(authToken);

// Cari guru
const guru = await serviceClient.getGuru('nama_guru', authToken);

// Buat kelas baru
const newKelas = await serviceClient.createKelas({
  nama_kelas: 'X RPL 1',
  tingkat: 'X',
  wali_kelas_id: 'uuid-user'
}, authToken);
```

#### Auth Service
```javascript
// Cari wali kelas
const waliKelas = await serviceClient.searchWaliKelas('john', authToken);

// Ambil user berdasarkan role
const users = await serviceClient.getUsersByRole('guru-mapel', authToken);
```

#### Learning Service
```javascript
// Ambil statistik kepsek
const statistik = await serviceClient.getKepsekStatistik(authToken);
```

#### Student Service
```javascript
// Ambil data parenting wali kelas
const parenting = await serviceClient.getParentingData(waliId, authToken);

// Buat data parenting baru
const newParenting = await serviceClient.createParentingData({
  kelas_id: 1,
  agenda: 'Rapat Orang Tua',
  ringkasan: 'Diskusi tentang prestasi siswa'
}, authToken);
```

#### Vocational Service
```javascript
// Ambil data PKL siswa
const pklData = await serviceClient.getPKLData(siswaId, authToken);
```

#### Asset Service
```javascript
// Upload file
const uploadResult = await serviceClient.uploadFile(formData, authToken);
```

## Contoh Implementasi

### Di Controller

```javascript
// controllers/kelasController.js
const serviceClient = require('../utils/serviceClient');

exports.createKelas = async (req, res) => {
  const { nama_kelas, tingkat, wali_kelas_id } = req.body;
  const authToken = req.headers.authorization;

  try {
    // Validasi wali kelas exists di auth service
    if (wali_kelas_id) {
      const waliData = await serviceClient.getUsersByRole('wali-kelas', authToken);
      const isValidWali = waliData.some(user => user.id === wali_kelas_id);
      if (!isValidWali) {
        return res.status(400).json({ error: 'Wali kelas tidak valid' });
      }
    }

    // Buat kelas
    const kelas = await Kelas.create({ nama_kelas, tingkat, wali_kelas_id });

    // Jika ada siswa di kelas ini, update vocational service
    const siswa = await serviceClient.getSiswa(kelas.id, authToken);
    if (siswa.length > 0) {
      // Notify vocational service tentang perubahan kelas
      await serviceClient.callService('vocational', '/api/vocational/notify-kelas-change', 'POST', {
        data: { kelas_id: kelas.id, siswa_count: siswa.length },
        headers: { Authorization: authToken }
      });
    }

    res.status(201).json({ success: true, data: kelas });
  } catch (error) {
    console.error('Error creating kelas:', error);
    res.status(500).json({ error: 'Gagal membuat kelas' });
  }
};
```

### Di Routes

```javascript
// routes/academicRoutes.js
const serviceClient = require('../utils/serviceClient');

router.get('/dashboard', extractIdentity, async (req, res) => {
  try {
    const authToken = req.headers.authorization;

    // Ambil data dari multiple services
    const [kelas, siswa, statistik] = await Promise.all([
      serviceClient.getKelas(authToken),
      serviceClient.getSiswa(null, authToken),
      serviceClient.getKepsekStatistik(authToken)
    ]);

    res.json({
      kelas: kelas.length,
      siswa: siswa.length,
      statistik
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil dashboard data' });
  }
});
```

## Error Handling

ServiceClient sudah dilengkapi dengan:

- **Automatic Retry**: 3 kali retry untuk network/server errors
- **Exponential Backoff**: Delay yang meningkat untuk retry
- **Error Logging**: Log error ke console
- **Graceful Degradation**: Return empty array/object jika service gagal

## Best Practices

1. **Gunakan Auth Token**: Selalu sertakan `Authorization` header
2. **Handle Errors**: Selalu wrap dalam try-catch
3. **Use Parallel Calls**: Gunakan `Promise.all()` untuk multiple calls
4. **Validate Data**: Pastikan data dari service lain valid
5. **Circuit Breaker**: Untuk production, tambahkan circuit breaker pattern

## Troubleshooting

### Service Tidak Dapat Dihubungi
- Cek container status: `docker ps`
- Cek logs: `docker logs <service-name>`
- Cek network: `docker network ls`

### Authentication Errors
- Pastikan token valid dan belum expired
- Cek role permissions di service target

### Timeout Errors
- Increase timeout di ServiceClient constructor
- Cek performance service target

## Development

Untuk development lokal tanpa Docker:

```bash
# Set environment variables
export ACADEMIC_SERVICE_URL=http://localhost:3003
export AUTH_SERVICE_URL=http://localhost:3005
# ... other services

# Run services individually
npm run dev
```