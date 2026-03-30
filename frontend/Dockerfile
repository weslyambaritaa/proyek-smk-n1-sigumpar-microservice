FROM node:20-alpine

WORKDIR /app

# Install dependencies dulu (cache layer)
COPY package*.json ./
RUN npm install

# Copy seluruh source code
COPY . .

# Expose port dev server Vite
EXPOSE 5173

# Jalankan dev server dengan host 0.0.0.0 sehingga dapat diakses dari container lain
# VITE_ env vars dibaca saat runtime, bukan saat build
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
