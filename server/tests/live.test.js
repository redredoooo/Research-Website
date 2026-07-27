const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

function request(method, pathName, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({ hostname: '127.0.0.1', port: 3000, path: pathName, method, headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {} }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (error) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('backend health and auth flow work end to end', async () => {
  const server = spawn(process.execPath, ['index.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  try {
    for (let i = 0; i < 30; i += 1) {
      try {
        const health = await request('GET', '/health');
        if (health.statusCode === 200) {
          break;
        }
      } catch (error) {
        // retry
      }
      await wait(500);
    }

    const health = await request('GET', '/health');
    assert.equal(health.statusCode, 200);
    assert.equal(health.body.status, 'ok');

    const login = await request('POST', '/api/auth/login', { identifier: 'R.Sablang', password: 'Redgelson Sablang' });
    assert.equal(login.statusCode, 200);
    assert.equal(login.body.user.username, 'R.Sablang');
    assert.equal(login.body.user.isAdmin, true);

    const posts = await request('GET', '/api/content/posts');
    assert.equal(posts.statusCode, 200);
    assert.ok(Array.isArray(posts.body));
  } finally {
    server.kill('SIGTERM');
  }
});
