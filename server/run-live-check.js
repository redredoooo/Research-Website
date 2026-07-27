const { spawn } = require('node:child_process');
const path = require('node:path');
const http = require('node:http');

function request(method, pathname, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({ hostname: '127.0.0.1', port: 3000, path: pathname, method, headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {} }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function waitForServer() {
  for (let i = 0; i < 20; i += 1) {
    try {
      const res = await request('GET', '/health');
      if (res.statusCode === 200) return res;
    } catch (error) {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('server did not come up');
}

(async () => {
  const server = spawn(process.execPath, ['index.js'], {
    cwd: path.join(__dirname),
    stdio: 'inherit'
  });
  try {
    const health = await waitForServer();
    const login = await request('POST', '/api/auth/login', { identifier: 'R.Sablang', password: 'Redgelson Sablang' });
    const posts = await request('GET', '/api/content/posts');
    console.log(JSON.stringify({ health, login, posts }, null, 2));
  } finally {
    server.kill('SIGTERM');
  }
})();
