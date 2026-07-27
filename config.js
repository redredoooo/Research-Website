(function () {
  window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
  const isLocalHost = typeof window !== 'undefined' && /127\.0\.0\.1|localhost/.test(window.location.hostname);
  const fallbackBackendHost = isLocalHost
    ? '127.0.0.1:3000'
    : window.location.hostname.replace(/^research-website/, 'research-group-backend');
  const fallbackBackendUrl = `https://${fallbackBackendHost}`;
  window.__APP_CONFIG__.backendUrl = window.__APP_CONFIG__.backendUrl || (window.__ENV__ && window.__ENV__.BACKEND_URL) || (isLocalHost ? 'http://127.0.0.1:3000' : fallbackBackendUrl);
  window.__APP_CONFIG__.dataSource = window.__APP_CONFIG__.dataSource || 'supabase';
  window.__APP_CONFIG__.supabaseUrl = window.__APP_CONFIG__.supabaseUrl || (window.__ENV__ && window.__ENV__.SUPABASE_URL) || 'https://nsdmvgrbzvapavoljzni.supabase.co';
  window.__APP_CONFIG__.supabaseAnonKey = window.__APP_CONFIG__.supabaseAnonKey || (window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY) || '';
})();

window.__APP_CONFIG__.instructions = 'Set SUPABASE_URL and SUPABASE_ANON_KEY in your deployment environment or assign them to window.__ENV__ before loading this script.';
