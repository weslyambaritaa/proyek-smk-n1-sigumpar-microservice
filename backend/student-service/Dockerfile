# Gunakan image Node.js versi LTS yang ringan (Alpine = ~50MB vs full ~900MB)
FROM node:24-alpine

# Label metadata
LABEL maintainer="praktikum@delcom.org"
LABEL description="Users Microservice"

# Set working directory di dalam container
WORKDIR /app

# Copy package files terlebih dahulu (SEBELUM source code)
# Docker melakukan layer caching — jika package.json tidak berubah,
# layer npm install akan digunakan dari cache, mempercepat build
COPY package*.json ./

# Install dependencies production saja (tidak perlu devDependencies di container)
RUN npm ci --only=production

# Copy seluruh source code ke working directory
COPY . .

# Expose port yang digunakan service (dokumentasi, tidak membuka port secara otomatis)
EXPOSE 3008

# Jalankan aplikasi saat container start
CMD ["node", "src/index.js"]