const http = require('http');

const body = JSON.stringify({ identifier: 'R.Sablang', password: 'Redgelson Sablang' });
const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let data = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(JSON.stringify({ statusCode: res.statusCode, body: JSON.parse(data) }, null, 2));
  });
});

req.on('error', (error) => {
  console.error(JSON.stringify({ error: error.message }));
  process.exit(1);
});
req.write(body);
req.end();
