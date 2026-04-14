# ── Stage 1: Build ────────────────────────────────────────────
# Gunakan Node untuk build aplikasi React menjadi file statis
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files dan install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code dan build untuk production
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────
# Gunakan Nginx ringan untuk serve file statis hasil build
# Multi-stage build membuat final image jauh lebih kecil (~50MB)
FROM nginx:alpine

# Copy hasil build dari stage sebelumnya
COPY --from=builder /app/dist /usr/share/nginx/html

# Konfigurasi Nginx untuk React Router (SPA)
# Tanpa ini, refresh halaman akan return 404
RUN echo 'server { \
  listen 5173; \
  location / { \
    root /usr/share/nginx/html; \
    try_files $uri $uri/ /index.html; \
  } \
  location /realms { \
    proxy_pass http://keycloak:8080; \
    proxy_set_header Host $host; \
    proxy_set_header X-Real-IP $remote_addr; \
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
    proxy_set_header X-Forwarded-Proto $scheme; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]