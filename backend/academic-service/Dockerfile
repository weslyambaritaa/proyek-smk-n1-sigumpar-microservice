FROM node:24-alpine

LABEL maintainer="praktikum@delcom.org"
LABEL description="Todos Microservice"

WORKDIR /app

COPY package*.json ./

# npm ci = install yang deterministik berdasarkan package-lock.json
# Lebih aman daripada npm install untuk production/CI
RUN npm ci --only=production

COPY . .

EXPOSE 3003

CMD ["node", "src/index.js"]