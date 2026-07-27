const http = require('http');

function request(path, payload) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const req = http.request({ hostname: '127.0.0.1', port: 3000, path, method: payload ? 'POST' : 'GET', headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {} }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  const health = await request('/health');
  console.log('health', health.status, health.body);
  const login = await request('/api/auth/login', { identifier: 'R.Sablang', password: 'Redgelson Sablang' });
  console.log('login', login.status, login.body);
})();
