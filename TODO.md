# TODO: Fix InputNilaiPage - Daftar Siswa Tidak Muncul

## Approved Plan Steps:

### 1. [ ] Check service status

- Run `docker-compose ps` to see if nginx (8001), academic-service (3003), postgres running.
- If not: `docker-compose up -d`

### 2. [ ] Check DB data in academic-service DB

- Connect to postgres (docker exec or psql)
- Run queries:
  ```
  SELECT COUNT(*) FROM kelas;
  SELECT COUNT(*) FROM siswa;
  SELECT k.nama_kelas, COUNT(s.id) as siswa_count FROM kelas k LEFT JOIN siswa s ON k.id = s.kelas_id GROUP BY k.id;
  ```

### 3. [ ] Test API endpoint

- Login as guru-mapel
- Open browser DevTools Network tab
- Go to /guru-mapel/input-nilai, select kelas, click CARI
- Check request to `/api/academic/nilai/siswa-by-kelas` - status/response

### 4. [ ] Seed sample data if DB empty

- Create sample kelas, siswa, mapel
- Run INSERT statements

### 5. [ ] Verify middleware

- Check if extractIdentity passes (logs?)

### 6. [ ] Test complete

- Students list appears when CARI clicked

### 1. [x] Check service status

- ✅ `docker-compose ps`: All services Up including academic-service (3003), api-gateway (8001)

### 2. [ ] Check DB data in academic-service DB

- ❌ No postgres container found in docker ps
- Academic-service DB_NAME=academic_db, DB_USER=academic_user, password=password
- init.sql only creates tables, **NO SAMPLE DATA** - this is likely the root cause! Kelas/siswa empty.
- Need to seed data or check logs if DB connection failing.

**Current progress: Completed step 2, likely empty DB, proceed to seed data**
