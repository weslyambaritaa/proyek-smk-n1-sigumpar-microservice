const axios = require("axios");

async function testAPI() {
  try {
    // Test GET grades
    console.log("Testing GET /api/grades...");
    const getResponse = await axios.get("http://localhost:8001/api/grades", {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyJ9.signature",
      },
    });
    console.log("GET Success:", getResponse.status, getResponse.data);

    // Test POST save grades
    console.log("Testing POST /api/grades/save...");
    const payload = {
      mapel: "Test",
      kelas: "XII RPL 1",
      tahunAjar: "2023/2024",
      grades: [
        {
          student_id: "1",
          student_name: "Test Student",
          nis: "12345",
          tugas: 80,
          kuis: 85,
          uts: 90,
          uas: 95,
          praktik: 88,
        },
      ],
    };
    const postResponse = await axios.post(
      "http://localhost:8001/api/grades/save",
      payload,
      {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyJ9.signature",
          "Content-Type": "application/json",
        },
      },
    );
    console.log("POST Success:", postResponse.status, postResponse.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response?.status,
      error.response?.data || error.message,
    );
  }
}

testAPI();
