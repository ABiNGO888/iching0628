const fetch = require('node-fetch');

async function testAIDivination() {
  try {
    console.log('开始测试AI解卦功能...');
    
    // 直接测试AI解卦API（跳过登录）
    console.log('\n测试AI解卦API（无认证模式）...');
    
    const testPrompt = '请解读乾卦（☰☰）的含义，包括卦象、卦辞和爻辞的解释';
    
    console.log('请求URL: http://localhost:3000/api/ai/interpret');
    console.log('请求内容:', {
      prompt: testPrompt,
      apiKey: 'sk-2661c12166e0409299a5384132eaa855'
    });
    
    const response = await fetch('http://localhost:3000/api/ai/interpret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: testPrompt,
        apiKey: 'sk-2661c12166e0409299a5384132eaa855'
      })
    });
    
    console.log('\n响应状态:', response.status);
    console.log('响应状态文本:', response.statusText);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('\n原始响应内容:');
    console.log(responseText);
    
    // 尝试解析JSON
    if (responseText) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('\n✅ 成功解析JSON响应:');
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (jsonData.interpretation) {
          console.log('\n🎉 AI解卦成功！');
          console.log('解卦结果预览:', jsonData.interpretation.substring(0, 300) + '...');
          if (jsonData.remainingCredits !== undefined) {
            console.log('剩余积分:', jsonData.remainingCredits);
          }
        } else if (jsonData.error) {
          console.log('\n❌ AI解卦失败:', jsonData.error);
          if (jsonData.needsPayment) {
            console.log('需要付费:', jsonData.needsPayment);
          }
        }
      } catch (parseError) {
        console.log('\n❌ JSON解析失败:', parseError.message);
        console.log('响应可能是HTML或其他格式');
      }
    } else {
      console.log('\n❌ 响应为空');
    }
    
  } catch (error) {
    console.error('\n❌ 网络请求失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testAIDivination();