FROM node:20-alpine

WORKDIR /app

# Install dependencies dulu (cache layer)
COPY package*.json ./
RUN npm install

# Copy seluruh source code
COPY . .

# Expose port dev server Vite
EXPOSE 5173

# Jalankan dev server (BUKAN build)
# VITE_ env vars dibaca saat runtime, bukan saat build
CMD ["npm", "run", "dev"]
