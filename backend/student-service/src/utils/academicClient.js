const axios = require("axios");

const academicClient = axios.create({
  baseURL: process.env.ACADEMIC_SERVICE_URL || "http://academic-service:3003",
  timeout: 10000,
});

module.exports = academicClient;
