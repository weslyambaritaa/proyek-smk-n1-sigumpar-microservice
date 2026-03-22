FROM node:20

# Instal PostgreSQL dan sudo
RUN apt-get update && apt-get install -y postgresql postgresql-contrib sudo

WORKDIR /app

# Salin package json dan instal dependensi
COPY package*.json ./
RUN npm install

# Salin kode aplikasi, script start.sh, dan init.sql
COPY . .

# Berikan izin eksekusi pada script
RUN chmod +x start.sh

# Expose port (sesuaikan dengan port service masing-masing)
# Contoh untuk student-service adalah 3005
EXPOSE 3001

CMD ["./start.sh"]