FROM node:20

RUN apt-get update && apt-get install -y postgresql postgresql-contrib sudo

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN rm -rf node_modules && npm install
RUN chmod +x start.sh

EXPOSE 3003

CMD ["./start.sh"]