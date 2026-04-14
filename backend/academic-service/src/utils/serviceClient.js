// serviceClient.js - Client untuk komunikasi antar microservices
const axios = require("axios");

class ServiceClient {
  constructor() {
    this.services = {
      academic:
        process.env.ACADEMIC_SERVICE_URL || "http://academic-service:3003",
      auth: process.env.AUTH_SERVICE_URL || "http://auth-service:3005",
      learning:
        process.env.LEARNING_SERVICE_URL || "http://learning-service:3006",
      student: process.env.STUDENT_SERVICE_URL || "http://student-service:3004",
      vocational:
        process.env.VOCATIONAL_SERVICE_URL || "http://vocational-service:3007",
      asset: process.env.ASSET_SERVICE_URL || "http://asset-service:3008",
    };

    this.client = axios.create({
      timeout: 10000, // 10 detik timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor untuk retry mechanism
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config, response } = error;

        // Retry hanya untuk network errors atau 5xx errors
        if (!config || !config.retry) {
          config.retry = 3;
        }

        if (
          config.retry > 0 &&
          (!response || // Network error
            (response.status >= 500 && response.status < 600)) // Server error
        ) {
          config.retry -= 1;
          console.log(
            `Retrying request to ${config.url}, attempts left: ${config.retry}`,
          );

          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, 3 - config.retry) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));

          return this.client(config);
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Generic method untuk memanggil service lain
   * @param {string} serviceName - Nama service (academic, auth, dll)
   * @param {string} endpoint - Endpoint path (contoh: '/api/academic/siswa')
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {object} options - Options tambahan (data, headers, params)
   */
  async callService(serviceName, endpoint, method = "GET", options = {}) {
    const baseUrl = this.services[serviceName];
    if (!baseUrl) {
      throw new Error(`Service ${serviceName} tidak dikonfigurasi`);
    }

    const url = `${baseUrl}${endpoint}`;
    const config = {
      method,
      url,
      ...options,
    };

    try {
      const response = await this.client(config);
      return response.data;
    } catch (error) {
      console.error(`Error calling ${serviceName}${endpoint}:`, error.message);
      throw error;
    }
  }

  // ── AUTH SERVICE METHODS ──────────────────────────────────────────────────

  async searchWaliKelas(searchQuery, authToken) {
    return this.callService("auth", "/api/auth/users/search", "GET", {
      params: { q: searchQuery },
      headers: { Authorization: authToken },
    });
  }

  async getUsersByRole(role, authToken) {
    return this.callService("auth", `/api/auth/users/role/${role}`, "GET", {
      headers: { Authorization: authToken },
    });
  }

  // ── LEARNING SERVICE METHODS ──────────────────────────────────────────────

  async getKepsekStatistik(authToken) {
    return this.callService(
      "learning",
      "/api/learning/kepsek/statistik",
      "GET",
      {
        headers: { Authorization: authToken },
      },
    );
  }

  // ── STUDENT SERVICE METHODS ───────────────────────────────────────────────

  async getParentingData(waliId, authToken) {
    return this.callService(
      "student",
      `/api/student/wali/parenting?wali_id=${waliId}`,
      "GET",
      {
        headers: { Authorization: authToken },
      },
    );
  }

  async createParentingData(parentingData, authToken) {
    return this.callService("student", "/api/student/wali/parenting", "POST", {
      data: parentingData,
      headers: { Authorization: authToken },
    });
  }

  // ── VOCATIONAL SERVICE METHODS ────────────────────────────────────────────

  async getPKLData(siswaId, authToken) {
    return this.callService(
      "vocational",
      `/api/vocational/pkl/${siswaId}`,
      "GET",
      {
        headers: { Authorization: authToken },
      },
    );
  }

  // ── ASSET SERVICE METHODS ─────────────────────────────────────────────────

  async uploadFile(fileData, authToken) {
    return this.callService("asset", "/api/asset/upload", "POST", {
      data: fileData,
      headers: {
        Authorization: authToken,
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

module.exports = new ServiceClient();
