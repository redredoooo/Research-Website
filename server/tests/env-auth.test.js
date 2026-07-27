const test = require('node:test');
const assert = require('node:assert/strict');
const { authenticateWithConfiguredCredentials } = require('../index');

test('environment credentials authenticate before Supabase flow', async () => {
  process.env.RESEARCH_LOGIN_USERNAME = 'render-admin';
  process.env.RESEARCH_LOGIN_PASSWORD = 'render-secret';
  process.env.RESEARCH_LOGIN_EMAIL = 'admin@example.com';

  try {
    const success = await authenticateWithConfiguredCredentials('render-admin', 'render-secret');
    assert.equal(success.error, null);
    assert.equal(success.data.user.user_metadata.full_name, 'render-admin');

    const failure = await authenticateWithConfiguredCredentials('render-admin', 'wrong-password');
    assert.equal(failure.data, null);
    assert.equal(failure.error.message, 'Invalid credentials.');
  } finally {
    delete process.env.RESEARCH_LOGIN_USERNAME;
    delete process.env.RESEARCH_LOGIN_PASSWORD;
    delete process.env.RESEARCH_LOGIN_EMAIL;
  }
});
