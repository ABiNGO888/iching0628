const fetch = require('node-fetch');

async function testAIAPI() {
  try {
    console.log('开始测试AI解卦API...');
    
    const response = await fetch('http://localhost:3000/api/ai/interpret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: '请解读乾卦的含义',
        apiKey: 'sk-2661c12166e0409299a5384132eaa855'
      })
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    
    const data = await response.text();
    console.log('Response:', data);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const jsonData = JSON.parse(data);
        console.log('Parsed JSON:', jsonData);
      } catch (e) {
        console.log('Failed to parse JSON:', e.message);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAIAPI();