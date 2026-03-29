FROM node:20

# Instal PostgreSQL, sudo dan curl untuk healthcheck
RUN apt-get update && apt-get install -y postgresql postgresql-contrib sudo curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Salin package json dan instal dependensi
COPY package*.json ./
RUN npm install

# Salin kode aplikasi, script start.sh, dan init.sql
COPY . .

# Normalisasi line ending dan berikan hak eksekusi pada start.sh
RUN sed -i 's/\r$//' ./start.sh && chmod +x ./start.sh

# Expose port (sesuaikan dengan port service masing-masing)
# Contoh untuk student-service adalah 3005
EXPOSE 3008

CMD ["sh", "./start.sh"]