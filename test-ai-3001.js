const fetch = require('node-fetch');

async function testAIAPI() {
  console.log('开始测试AI解卦API (端口3001)...');
  
  const requestBody = {
    prompt: '请解读乾卦（☰☰）的含义，包括卦象、卦辞和爻辞的解释',
    apiKey: 'sk-2661c12166e0409299a5384132eaa855'
  };
  
  console.log('请求体:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch('http://localhost:3001/api/ai/interpret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('原始响应:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('✅ JSON解析成功:', responseJson);
      
      if (responseJson.interpretation) {
        console.log('🎉 AI解卦成功!');
        console.log('解卦结果:', responseJson.interpretation.substring(0, 200) + '...');
      } else if (responseJson.error) {
        console.log('❌ API返回错误:', responseJson.error);
      }
    } catch (parseError) {
      console.log('❌ JSON解析失败:', parseError.message);
    }
    
  } catch (error) {
    console.log('❌ 网络请求失败:', error.message);
    console.log('错误详情:', error);
  }
}

testAIAPI();