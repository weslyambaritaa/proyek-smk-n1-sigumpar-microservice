FROM node:20

# Install PostgreSQL dan sudo
RUN apt-get update && apt-get install -y postgresql postgresql-contrib sudo && apt-get clean

WORKDIR /app

# Salin package json dan install dependensi
COPY package*.json ./
RUN npm install

# Salin seluruh kode aplikasi
COPY . .

# Berikan izin eksekusi pada script
RUN chmod +x start.sh

# Expose port vocational-service
EXPOSE 3007

CMD ["./start.sh"]
