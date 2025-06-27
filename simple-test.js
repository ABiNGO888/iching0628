const http = require('http');

// 简单的HTTP GET请求测试服务器是否运行
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`响应体: ${chunk.substring(0, 200)}...`);
  });
  
  res.on('end', () => {
    console.log('✅ 服务器正在运行');
  });
});

req.on('error', (e) => {
  console.error(`❌ 请求遇到问题: ${e.message}`);
});

req.end();