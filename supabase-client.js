(function () {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.async = true;
  script.onload = () => {
    const supabaseUrl = window.__APP_CONFIG__?.supabaseUrl || '';
    const supabaseAnonKey = window.__APP_CONFIG__?.supabaseAnonKey || '';
    if (!supabaseUrl || !supabaseAnonKey) {
      window.supabaseClient = null;
      return;
    }
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  };
  document.head.appendChild(script);
})();
