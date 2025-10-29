const axios = require('axios');

async function testAvailabilityAPI() {
  try {
    const teacherId = '1a8a6de9-7860-4083-bf33-676afc80fcb6'; // Ahmed Hassan's ID
    const url = `http://localhost:3000/api/teachers/${teacherId}/availability`;
    
    console.log('🔍 Testing API endpoint:', url);
    
    const response = await axios.get(url);
    
    console.log('\n✅ API Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Data keys:', Object.keys(response.data.data || {}));
    
    if (response.data.data && response.data.data.availability) {
      const availability = response.data.data.availability;
      console.log('\n📅 Availability:');
      console.log('Type:', typeof availability);
      console.log('Is Array:', Array.isArray(availability));
      console.log('Length:', availability.length);
      
      if (availability.length > 0) {
        console.log('\n✅ First 3 slots:');
        availability.slice(0, 3).forEach((slot, i) => {
          console.log(`  ${i + 1}.`, JSON.stringify(slot));
        });
      }
    } else {
      console.log('❌ No availability in response');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAvailabilityAPI();
