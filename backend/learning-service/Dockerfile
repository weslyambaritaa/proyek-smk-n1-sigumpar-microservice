FROM node:20

# Instal PostgreSQL dan sudo
RUN apt-get update && apt-get install -y postgresql postgresql-contrib sudo

WORKDIR /app

# Copy hanya package.json (bukan lock file) lalu install fresh
COPY package.json ./
RUN npm install --legacy-peer-deps

# Salin kode aplikasi dan script
COPY . .

# Berikan izin eksekusi pada script
RUN chmod +x start.sh

EXPOSE 3006

CMD ["./start.sh"]
