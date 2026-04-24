FROM node:20

RUN apt-get update && apt-get install -y postgresql postgresql-contrib sudo

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Hapus node_modules yang ikut ter-copy dari Windows, pakai yang di-install tadi
RUN rm -rf node_modules && npm install

RUN chmod +x start.sh

EXPOSE 3007

CMD ["./start.sh"]