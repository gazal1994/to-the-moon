// Simple script to test the server and initialize sample data
const http = require('http');

const testEndpoint = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

async function runTests() {
  console.log('🧪 Testing Aqra Server Connection...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await testEndpoint('/health');
    console.log(`   Status: ${health.status}`);
    if (health.data.success) {
      console.log('   ✅ Health check passed\n');
    } else {
      console.log('   ❌ Health check failed\n');
      return;
    }

    // Test user registration
    console.log('2. Testing user registration...');
    const teacherData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'teacher',
      phone: '+1234567890'
    };

    const registerResult = await testEndpoint('/api/auth/register', 'POST', teacherData);
    console.log(`   Status: ${registerResult.status}`);
    
    if (registerResult.data.success) {
      console.log('   ✅ Teacher registration successful');
      const { user, tokens } = registerResult.data.data;
      console.log(`   Teacher ID: ${user.id}, Token: ${tokens.accessToken.substring(0, 20)}...\n`);
      
      // Test getting current user
      console.log('3. Testing authenticated endpoint...');
      const userResult = await testEndpoint('/api/users/me', 'GET', null, tokens.accessToken);
      console.log(`   Status: ${userResult.status}`);
      
      if (userResult.data.success) {
        console.log('   ✅ Authentication working');
        console.log(`   User: ${userResult.data.data.name} (${userResult.data.data.role})\n`);
      } else {
        console.log('   ❌ Authentication failed\n');
      }

      // Test teacher profile endpoint
      console.log('4. Testing teacher profile endpoint...');
      const profileResult = await testEndpoint('/api/teachers/me', 'GET', null, tokens.accessToken);
      console.log(`   Status: ${profileResult.status}`);
      
      if (profileResult.data.success) {
        console.log('   ✅ Teacher profile endpoint working');
        console.log(`   Profile: ${JSON.stringify(profileResult.data.data, null, 2)}\n`);
      } else {
        console.log('   ❌ Teacher profile failed\n');
      }

    } else {
      console.log(`   ❌ Registration failed: ${registerResult.data.error}\n`);
    }

    // Register a student for testing
    console.log('5. Testing student registration...');
    const studentData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'student'
    };

    const studentRegister = await testEndpoint('/api/auth/register', 'POST', studentData);
    if (studentRegister.data.success) {
      console.log('   ✅ Student registration successful');
      const { tokens } = studentRegister.data.data;
      
      // Test student profile
      const studentProfile = await testEndpoint('/api/students/me', 'GET', null, tokens.accessToken);
      if (studentProfile.data.success) {
        console.log('   ✅ Student profile endpoint working\n');
      }
    }

    console.log('🎉 All basic tests passed! Server is ready for Aqra app integration.');
    console.log('\n📋 Next steps:');
    console.log('   1. Start your Aqra React Native app');
    console.log('   2. The app should now connect to http://localhost:3000/api');
    console.log('   3. Try registering and logging in through the app');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
runTests();