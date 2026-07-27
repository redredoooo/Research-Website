const { createClient } = require('@supabase/supabase-js');

(async () => {
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZG12Z3JienZhcGF2b2xqem5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE3MTY1NCwiZXhwIjoyMTAwNzQ3NjU0fQ.yoeoPajw4e20VILyS5GP-ltQAeIVwwOf2IgfxEYRuas';
  const client = createClient('https://nsdmvgrbzvapavoljzni.supabase.co', key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const email = 'redgelson@sablang.test';
  const password = 'Redgelson Sablang';
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  console.log(JSON.stringify({ data: data?.user ? { id: data.user.id, email: data.user.email } : null, error: error?.message || null }, null, 2));
})();
