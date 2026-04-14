const axios = require('axios');

async function testDashboard() {
  try {
    console.log('Testing dashboard endpoint...');
    const response = await axios.get('http://localhost:8001/api/academic/dashboard');
    console.log('Dashboard response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing dashboard:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDashboard();