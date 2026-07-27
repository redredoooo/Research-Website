const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const corsOptions = {
  origin: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

const port = process.env.PORT || 3000;
const supabaseUrl = process.env.SUPABASE_URL || 'https://nsdmvgrbzvapavoljzni.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZG12Z3JienZhcGF2b2xqem5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE3MTY1NCwiZXhwIjoyMTAwNzQ3NjU0fQ.yoeoPajw4e20VILyS5GP-ltQAeIVwwOf2IgfxEYRuas';
const configuredAuth = {
  username: process.env.RESEARCH_LOGIN_USERNAME || process.env.LOGIN_USERNAME || '',
  password: process.env.RESEARCH_LOGIN_PASSWORD || process.env.LOGIN_PASSWORD || '',
  email: process.env.RESEARCH_LOGIN_EMAIL || process.env.LOGIN_EMAIL || ''
};
// Load configured members from a single JSON env var if present, otherwise
// fall back to the individual env vars / built-in defaults above.
function loadConfiguredMembersFromEnv() {
  const raw = process.env.RESEARCH_CREDENTIALS || process.env.RESEARCH_MEMBERS || '';
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((m) => ({
          username: String(m.username || m.user || m.username).trim(),
          password: String(m.password || m.pass || '').trim(),
          email: String(m.email || m.mail || '').trim(),
          fullName: String(m.fullName || m.full_name || m.name || m.user || m.username || '').trim(),
          role: m.role || 'Member',
          isAdmin: Boolean(m.isAdmin || m.is_admin)
        })).filter((mem) => mem.username && mem.password);
      }
    } catch (err) {
      console.warn('[env] failed to parse RESEARCH_CREDENTIALS JSON, falling back', err?.message || err);
    }
  }

  // Legacy per-member env var fallbacks and defaults
  return [
    {
      username: process.env.RESEARCH_MEMBER_R_SABLANG_USERNAME || process.env.RESEARCH_LOGIN_USERNAME || process.env.LOGIN_USERNAME || 'R.Sablang',
      password: process.env.RESEARCH_MEMBER_R_SABLANG_PASSWORD || process.env.RESEARCH_LOGIN_PASSWORD || process.env.LOGIN_PASSWORD || 'Redgelson Sablang',
      email: process.env.RESEARCH_MEMBER_R_SABLANG_EMAIL || process.env.RESEARCH_LOGIN_EMAIL || process.env.LOGIN_EMAIL || 'redgelson@sablang.test',
      fullName: 'Redgelson Sablang',
      role: 'Researcher',
      isAdmin: true
    },
    {
      username: process.env.RESEARCH_MEMBER_M_MSULIT_USERNAME || 'M.M.Sulit',
      password: process.env.RESEARCH_MEMBER_M_MSULIT_PASSWORD || 'Mary Margarette Sulit',
      email: process.env.RESEARCH_MEMBER_M_MSULIT_EMAIL || 'mary@sulit.test',
      fullName: 'Mary Margarette Sulit',
      role: 'Research Leader',
      isAdmin: true
    },
    {
      username: process.env.RESEARCH_MEMBER_B_JVALENCIA_USERNAME || 'B.J.Valencia',
      password: process.env.RESEARCH_MEMBER_B_JVALENCIA_PASSWORD || 'Baron James Valencia',
      email: process.env.RESEARCH_MEMBER_B_JVALENCIA_EMAIL || 'baron@valencia.test',
      fullName: 'Baron James Valencia',
      role: 'Researcher',
      isAdmin: false
    },
    {
      username: process.env.RESEARCH_MEMBER_A_LSANTOS_USERNAME || 'A.L.Santos',
      password: process.env.RESEARCH_MEMBER_A_LSANTOS_PASSWORD || 'Ashanti Lhane Santos',
      email: process.env.RESEARCH_MEMBER_A_LSANTOS_EMAIL || 'ashanti@santos.test',
      fullName: 'Ashanti Lhane Santos',
      role: 'Researcher',
      isAdmin: false
    },
    {
      username: process.env.RESEARCH_MEMBER_A_SAROMO_USERNAME || 'A.Saromo',
      password: process.env.RESEARCH_MEMBER_A_SAROMO_PASSWORD || 'Alyana Saromo',
      email: process.env.RESEARCH_MEMBER_A_SAROMO_EMAIL || 'alyana@saromo.test',
      fullName: 'Alyana Saromo',
      role: 'Researcher',
      isAdmin: false
    },
    {
      username: process.env.RESEARCH_MEMBER_A_SAHAGUN_USERNAME || 'A.Sahagun',
      password: process.env.RESEARCH_MEMBER_A_SAHAGUN_PASSWORD || 'Alcher Sahagun',
      email: process.env.RESEARCH_MEMBER_A_SAHAGUN_EMAIL || 'alcher@sahagun.test',
      fullName: 'Alcher Sahagun',
      role: 'Researcher',
      isAdmin: false
    }
  ].filter((member) => member.username && member.password);
}

const configuredMembers = loadConfiguredMembersFromEnv();
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const memberEmails = {
  'R.Sablang': 'redgelson@sablang.test',
  'M.M.Sulit': 'mary@sulit.test',
  'B.J.Valencia': 'baron@valencia.test',
  'A.L.Santos': 'ashanti@santos.test',
  'A.Saromo': 'alyana@saromo.test',
  'A.Sahagun': 'alcher@sahagun.test'
};

function resolveEmail(identifier) {
  return memberEmails[identifier] || identifier;
}

function hasConfiguredAuth() {
  return configuredMembers.length > 0;
}

async function authenticateWithConfiguredCredentials(identifier, password) {
  const normalizedIdentifier = String(identifier || '').trim();
  const normalizedPassword = String(password || '').trim();

  // Match against any configured member list entry
  const matchedMember = configuredMembers.find((member) => {
    return (
      normalizedIdentifier === member.username ||
      normalizedIdentifier === member.email ||
      normalizedIdentifier === member.fullName
    );
  });

  if (!matchedMember) {
    // If no env-based member matched, fall back to single configured admin (if present)
    if (configuredAuth.username && configuredAuth.password) {
      if (normalizedIdentifier === configuredAuth.username || normalizedIdentifier === configuredAuth.email) {
        if (normalizedPassword === configuredAuth.password) {
          const user = {
            id: 'env-configured-auth',
            email: configuredAuth.email || `${configuredAuth.username}@render.local`,
            user_metadata: {
              full_name: configuredAuth.username,
              role: 'Admin',
              isAdmin: true
            }
          };
          return { data: { user, session: { access_token: 'env-configured-session', token_type: 'bearer' } }, error: null };
        }
        return { data: null, error: new Error('Invalid credentials.') };
      }
    }
    return { data: null, error: null };
  }

  if (normalizedPassword !== matchedMember.password) {
    return { data: null, error: new Error('Invalid credentials.') };
  }

  const user = {
    id: `env-configured-auth-${matchedMember.username}`,
    email: matchedMember.email || `${matchedMember.username}@render.local`,
    user_metadata: {
      full_name: matchedMember.fullName || matchedMember.username,
      role: matchedMember.role || 'Member',
      isAdmin: Boolean(matchedMember.isAdmin)
    }
  };

  return { data: { user, session: { access_token: 'env-configured-session', token_type: 'bearer' } }, error: null };
}

function mapPayload(type, item) {
  if (type === 'posts') {
    return {
      id: item.id,
      title: item.title,
      body: item.body,
      category: item.category,
      link: item.link,
      attachmentLabel: item.attachment_label || item.attachmentLabel,
      attachmentData: item.attachment_data || item.attachmentData,
      fileName: item.file_name || item.fileName,
      authorUsername: item.author_username || item.authorUsername,
      authorName: item.author_name || item.authorName,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt
    };
  }

  if (type === 'documents') {
    return {
      id: item.id,
      title: item.title,
      body: item.body,
      category: item.category,
      link: item.link,
      markdown: item.markdown,
      attachmentLabel: item.attachment_label || item.attachmentLabel,
      attachmentData: item.attachment_data || item.attachmentData,
      fileName: item.file_name || item.fileName,
      authorUsername: item.author_username || item.authorUsername,
      authorName: item.author_name || item.authorName,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt
    };
  }

  return {
    id: item.id,
    title: item.title,
    body: item.body,
    status: item.status,
    progress: item.progress,
    link: item.link,
    authorUsername: item.author_username || item.authorUsername,
    authorName: item.author_name || item.authorName,
    createdAt: item.created_at || item.createdAt,
    updatedAt: item.updated_at || item.updatedAt
  };
}

function mapInsertPayload(type, payload) {
  if (type === 'posts') {
    return {
      id: payload.id,
      title: payload.title,
      body: payload.body,
      category: payload.category,
      link: payload.link,
      attachment_label: payload.attachmentLabel || payload.attachment_label,
      attachment_data: payload.attachmentData || payload.attachment_data,
      file_name: payload.fileName || payload.file_name,
      author_username: payload.authorUsername || payload.author_username,
      author_name: payload.authorName || payload.author_name,
      created_at: payload.createdAt || payload.created_at,
      updated_at: payload.updatedAt || payload.updated_at
    };
  }

  if (type === 'documents') {
    return {
      id: payload.id,
      title: payload.title,
      body: payload.body,
      category: payload.category,
      link: payload.link,
      markdown: payload.markdown,
      attachment_label: payload.attachmentLabel || payload.attachment_label,
      attachment_data: payload.attachmentData || payload.attachment_data,
      file_name: payload.fileName || payload.file_name,
      author_username: payload.authorUsername || payload.author_username,
      author_name: payload.authorName || payload.author_name,
      created_at: payload.createdAt || payload.created_at,
      updated_at: payload.updatedAt || payload.updated_at
    };
  }

  return {
    id: payload.id,
    title: payload.title,
    body: payload.body,
    status: payload.status,
    progress: payload.progress,
    link: payload.link,
    author_username: payload.authorUsername || payload.author_username,
    author_name: payload.authorName || payload.author_name,
    created_at: payload.createdAt || payload.created_at,
    updated_at: payload.updatedAt || payload.updated_at
  };
}

async function ensureMemberUsers() {
  const members = [
    { username: 'R.Sablang', email: 'redgelson@sablang.test', password: 'Redgelson Sablang', full_name: 'Redgelson Sablang', role: 'Researcher', isAdmin: true },
    { username: 'M.M.Sulit', email: 'mary@sulit.test', password: 'Mary Margarette Sulit', full_name: 'Mary Margarette Sulit', role: 'Research Leader', isAdmin: true },
    { username: 'B.J.Valencia', email: 'baron@valencia.test', password: 'Baron James Valencia', full_name: 'Baron James Valencia', role: 'Researcher', isAdmin: false },
    { username: 'A.L.Santos', email: 'ashanti@santos.test', password: 'Ashanti Lhane Santos', full_name: 'Ashanti Lhane Santos', role: 'Researcher', isAdmin: false },
    { username: 'A.Saromo', email: 'alyana@saromo.test', password: 'Alyana Saromo', full_name: 'Alyana Saromo', role: 'Researcher', isAdmin: false },
    { username: 'A.Sahagun', email: 'alcher@sahagun.test', password: 'Alcher Sahagun', full_name: 'Alcher Sahagun', role: 'Researcher', isAdmin: false }
  ];

  for (const member of members) {
    try {
      await supabase.auth.admin.createUser({
        email: member.email,
        password: member.password,
        email_confirm: true,
        user_metadata: { full_name: member.full_name, role: member.role, isAdmin: member.isAdmin }
      });
      // Try to upsert into credentials table so backend can read centralized credentials
      try {
        await supabase.from('profiles').upsert({
          username: member.username,
          email: member.email,
          full_name: member.full_name,
          role: member.role,
          is_admin: member.isAdmin
        }, { onConflict: ['username', 'email'] });
      } catch (upsertErr) {
        if (!/does not exist|relation .* does not exist/i.test(upsertErr?.message || '')) {
          console.error('[auth] failed to upsert profile', member.username, upsertErr.message);
        } else {
          console.warn('[auth] profiles table not present; skipping upsert. Run migration to create it.');
        }
      }
    } catch (error) {
      if (!/already|duplicate|exists/i.test(error?.message || '')) {
        console.error('Failed to ensure member', member.username, error.message);
      }
    }
  }
}

async function seedProfilesTable() {
  // Try to seed profiles table (non-fatal if table doesn't exist)
  const seeds = [
    { username: 'R.Sablang', email: 'redgelson@sablang.test', full_name: 'Redgelson Sablang', role: 'Researcher', is_admin: true },
    { username: 'M.M.Sulit', email: 'mary@sulit.test', full_name: 'Mary Margarette Sulit', role: 'Research Leader', is_admin: true },
    { username: 'B.J.Valencia', email: 'baron@valencia.test', full_name: 'Baron James Valencia', role: 'Researcher', is_admin: false }
  ];
  try {
    await supabase.from('profiles').upsert(seeds, { onConflict: ['username', 'email'] });
    console.info('[auth] seeded profiles table (if present)');
  } catch (err) {
    if (/does not exist|relation .* does not exist/i.test(err?.message || '')) {
      console.warn('[auth] profiles table not found; run server/migrations/002_create_profiles.sql in Supabase to create it');
    } else {
      console.error('[auth] error seeding profiles table', err.message || err);
    }
  }
}

async function authenticateWithSupabase(identifier, password) {
  const email = resolveEmail(identifier);
  console.debug('[auth] attempting signInWithPassword for', email);
  // First, attempt to read username→email mapping from the 'profiles' table.
  try {
    const { data: profileData, error: profileErr } = await supabase.from('profiles').select('*').eq('username', identifier).maybeSingle();
    if (!profileErr && profileData) {
      // Attempt to sign in via Supabase Auth using the mapped email and provided password
      const retry = await supabase.auth.signInWithPassword({ email: profileData.email, password });
      if (retry.error) {
        console.error('[auth] signInWithPassword failed for', profileData.email, '-', retry.error.message || retry.error);
        return retry;
      }
      console.debug('[auth] signInWithPassword success for', profileData.email);
      return retry;
    }
  } catch (err) {
    if (/does not exist|relation .* does not exist/i.test(err?.message || '')) {
      console.warn('[auth] profiles table not present; falling back to default behavior');
    } else {
      console.error('[auth] error querying profiles table', err.message || err);
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) {
    console.debug('[auth] signInWithPassword success for', email);
    return { data, error: null };
  }
  console.debug('[auth] signInWithPassword error for', email, '-', error?.message || error);

  const member = [
    { username: 'R.Sablang', email: 'redgelson@sablang.test', password: 'Redgelson Sablang', full_name: 'Redgelson Sablang', role: 'Researcher', isAdmin: true },
    { username: 'M.M.Sulit', email: 'mary@sulit.test', password: 'Mary Margarette Sulit', full_name: 'Mary Margarette Sulit', role: 'Research Leader', isAdmin: true },
    { username: 'B.J.Valencia', email: 'baron@valencia.test', password: 'Baron James Valencia', full_name: 'Baron James Valencia', role: 'Researcher', isAdmin: false },
    { username: 'A.L.Santos', email: 'ashanti@santos.test', password: 'Lhane Santos', full_name: 'Lhane Santos', role: 'Researcher', isAdmin: false },
    { username: 'A.Saromo', email: 'alyana@saromo.test', password: 'Alyana Saromo', full_name: 'Alyana Saromo', role: 'Researcher', isAdmin: false },
    { username: 'A.Sahagun', email: 'alcher@sahagun.test', password: 'Alcher Sahagun', full_name: 'Alcher Sahagun', role: 'Researcher', isAdmin: false }
  ].find((entry) => entry.username === identifier);

  if (member) {
    try {
      await supabase.auth.admin.createUser({
        email: member.email,
        password: member.password,
        email_confirm: true,
        user_metadata: { full_name: member.full_name, role: member.role, isAdmin: member.isAdmin }
      });
    } catch (creationError) {
      if (!/already|duplicate|exists/i.test(creationError?.message || '')) {
        console.error('[auth] Failed to create member user', member.username, creationError.message);
      }
    }

    const retry = await supabase.auth.signInWithPassword({ email: member.email, password: member.password });
    if (retry.error) {
      console.error('[auth] retry signInWithPassword failed for', member.email, '-', retry.error.message || retry.error);
      return retry;
    }
    console.debug('[auth] retry signInWithPassword success for', member.email);
    return retry;
  }

  return { data: null, error };
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', project: supabaseUrl });
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required.' });
  }

  console.info('[auth] login attempt for identifier:', identifier);
  const configuredResult = await authenticateWithConfiguredCredentials(identifier, password);
  if (configuredResult.error || configuredResult.data) {
    if (configuredResult.error) {
      console.error('[auth] configured credentials login failed for', identifier, '-', configuredResult.error.message);
      return res.status(401).json({ error: configuredResult.error.message });
    }

    const { data } = configuredResult;
    return res.json({
      user: {
        id: data.user?.id,
        username: identifier,
        fullName: data.user?.user_metadata?.full_name || identifier,
        email: data.user?.email,
        role: data.user?.user_metadata?.role || 'Member',
        isAdmin: Boolean(data.user?.user_metadata?.isAdmin)
      },
      session: data.session
    });
  }

  const { data, error } = await authenticateWithSupabase(identifier, password);

  if (error) {
    console.error('[auth] login failed for', identifier, '-', error?.message || error);
  }

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({
    user: {
      id: data.user?.id,
      username: identifier,
      fullName: data.user?.user_metadata?.full_name || identifier,
      email: data.user?.email,
      role: data.user?.user_metadata?.role || 'Member',
      isAdmin: Boolean(data.user?.user_metadata?.isAdmin)
    },
    session: data.session
  });
});

app.post('/api/auth/logout', async (_req, res) => {
  await supabase.auth.signOut();
  res.json({ ok: true });
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token.' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({ user: data.user });
});

app.get('/api/content/:type', async (req, res) => {
  const table = req.params.type;
  const allowed = ['posts', 'documents', 'projects'];
  if (!allowed.includes(table)) {
    return res.status(400).json({ error: 'Unsupported content type.' });
  }

  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json((data || []).map((item) => mapPayload(table, item)));
});

app.post('/api/content/:type', async (req, res) => {
  const table = req.params.type;
  const allowed = ['posts', 'documents', 'projects'];
  if (!allowed.includes(table)) {
    return res.status(400).json({ error: 'Unsupported content type.' });
  }

  const { data, error } = await supabase.from(table).insert(mapInsertPayload(table, req.body)).select('*').single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(mapPayload(table, data));
});

app.put('/api/content/:type/:id', async (req, res) => {
  const table = req.params.type;
  const allowed = ['posts', 'documents', 'projects'];
  if (!allowed.includes(table)) {
    return res.status(400).json({ error: 'Unsupported content type.' });
  }

  const { data, error } = await supabase.from(table).update(mapInsertPayload(table, { ...req.body, id: req.params.id })).eq('id', req.params.id).select('*').single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(mapPayload(table, data));
});

app.delete('/api/content/:type/:id', async (req, res) => {
  const table = req.params.type;
  const allowed = ['posts', 'documents', 'projects'];
  if (!allowed.includes(table)) {
    return res.status(400).json({ error: 'Unsupported content type.' });
  }

  const { error } = await supabase.from(table).delete().eq('id', req.params.id);
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

async function start() {
  await ensureMemberUsers();
  await seedProfilesTable();
  app.listen(port, () => {
    console.log(`Research backend listening on port ${port}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = {
  app,
  authenticateWithConfiguredCredentials
};
