const axios = require("axios");

const ACADEMIC_SERVICE_URL =
  process.env.ACADEMIC_SERVICE_URL || "http://academic-service:3003";

async function callAcademicService(endpoint, token, params = {}) {
  try {
    const response = await axios.get(`${ACADEMIC_SERVICE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error calling academic-service:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

module.exports = { callAcademicService };
