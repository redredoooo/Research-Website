(function () {
  const CACHE_PREFIX = 'research-group-cache:';

  function read(key, fallback = null) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function remove(key) {
    localStorage.removeItem(CACHE_PREFIX + key);
  }

  function snapshot() {
    const entries = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key.startsWith(CACHE_PREFIX)) {
        entries.push({ key, value: read(key.replace(CACHE_PREFIX, ''), null) });
      }
    }
    return entries;
  }

  window.cacheApi = {
    read,
    write,
    remove,
    snapshot
  };
})();
