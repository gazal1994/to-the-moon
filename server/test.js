const https = require('https');
const http = require('http');

// Test the health endpoint
function testHealthEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('=== Health Check Response ===');
      console.log('Status Code:', res.statusCode);
      console.log('Response:', JSON.parse(data));
    });
  });

  req.on('error', (error) => {
    console.error('Health check failed:', error.message);
  });

  req.end();
}

// Test the root endpoint
function testRootEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n=== Root Endpoint Response ===');
      console.log('Status Code:', res.statusCode);
      console.log('Response:', JSON.parse(data));
    });
  });

  req.on('error', (error) => {
    console.error('Root endpoint test failed:', error.message);
  });

  req.end();
}

// Run tests
console.log('Testing Aqra Server...\n');
testHealthEndpoint();
setTimeout(() => testRootEndpoint(), 1000);