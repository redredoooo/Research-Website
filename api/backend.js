(function () {
  const STORAGE_PREFIX = 'research-group';
  const defaultConfig = {
    backendUrl: '',
    dataSource: 'local',
    supabaseUrl: '',
    supabaseAnonKey: ''
  };

  function getConfig() {
    return { ...defaultConfig, ...(window.__APP_CONFIG__ || {}) };
  }

  function readJson(key, fallback = null) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + ':' + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + ':' + key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function removeJson(key) {
    localStorage.removeItem(STORAGE_PREFIX + ':' + key);
  }

  async function request({ endpoint, method = 'GET', body = null, fallbackValue = null }) {
    const config = getConfig();
    if (!config.backendUrl) {
      return fallbackValue;
    }

    try {
      const response = await fetch(`${config.backendUrl}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!response.ok) throw new Error('Request failed');
      return await response.json();
    } catch (error) {
      return fallbackValue;
    }
  }

  window.backendApi = {
    getConfig,
    readJson,
    writeJson,
    removeJson,
    request
  };
})();
