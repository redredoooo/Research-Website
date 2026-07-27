(function () {
  const STORAGE_KEY = 'research-group-content';

  function mapRemoteItem(item, type) {
    if (type === 'posts') {
      return {
        id: item.id,
        title: item.title,
        body: item.body,
        category: item.category,
        link: item.link,
        attachmentLabel: item.attachmentLabel || item.attachment_label,
        attachmentData: item.attachmentData || item.attachment_data,
        fileName: item.fileName || item.file_name,
        authorUsername: item.authorUsername || item.author_username,
        authorName: item.authorName || item.author_name,
        createdAt: item.createdAt || item.created_at,
        updatedAt: item.updatedAt || item.updated_at
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
        attachmentLabel: item.attachmentLabel || item.attachment_label,
        attachmentData: item.attachmentData || item.attachment_data,
        fileName: item.fileName || item.file_name,
        authorUsername: item.authorUsername || item.author_username,
        authorName: item.authorName || item.author_name,
        createdAt: item.createdAt || item.created_at,
        updatedAt: item.updatedAt || item.updated_at
      };
    }

    return {
      id: item.id,
      title: item.title,
      body: item.body,
      status: item.status,
      progress: item.progress,
      link: item.link,
      authorUsername: item.authorUsername || item.author_username,
      authorName: item.authorName || item.author_name,
      createdAt: item.createdAt || item.created_at,
      updatedAt: item.updatedAt || item.updated_at
    };
  }

  async function readFromBackend() {
    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (!backendUrl || !window.backendApi?.request) return null;

    try {
      const [posts, documents, projects] = await Promise.all([
        window.backendApi.request({ endpoint: '/api/content/posts' }),
        window.backendApi.request({ endpoint: '/api/content/documents' }),
        window.backendApi.request({ endpoint: '/api/content/projects' })
      ]);

      if (!Array.isArray(posts) || !Array.isArray(documents) || !Array.isArray(projects)) {
        return null;
      }

      return {
        posts: posts.map((item) => mapRemoteItem(item, 'posts')),
        documents: documents.map((item) => mapRemoteItem(item, 'documents')),
        projects: projects.map((item) => mapRemoteItem(item, 'projects'))
      };
    } catch (error) {
      return null;
    }
  }

  async function readFromSupabase() {
    if (!window.supabaseClient) return null;
    const [postsRes, docsRes, projectsRes] = await Promise.all([
      window.supabaseClient.from('posts').select('*').order('created_at', { ascending: false }),
      window.supabaseClient.from('documents').select('*').order('created_at', { ascending: false }),
      window.supabaseClient.from('projects').select('*').order('created_at', { ascending: false })
    ]);

    if (postsRes.error || docsRes.error || projectsRes.error) {
      return null;
    }

    return {
      posts: (postsRes.data || []).map((item) => mapRemoteItem(item, 'posts')),
      documents: (docsRes.data || []).map((item) => mapRemoteItem(item, 'documents')),
      projects: (projectsRes.data || []).map((item) => mapRemoteItem(item, 'projects'))
    };
  }

  function getDefaultState() {
    return {
      posts: [
        {
          id: 'post-1',
          title: 'New protocols now available',
          body: 'The lab has published a refined workflow for cohort analysis and secure data handoff.',
          category: 'announcement',
          link: 'https://example.org/protocols',
          attachmentLabel: 'Protocol bundle',
          authorUsername: 'B.J.Valencia',
          authorName: 'Baron James Valencia',
          createdAt: '2026-07-20T09:15:00.000Z',
          updatedAt: '2026-07-20T09:15:00.000Z'
        },
        {
          id: 'post-2',
          title: 'Resource spotlight: open microscopy dataset',
          body: 'A curated dataset was added to support comparative studies across seasonal samples.',
          category: 'resource',
          link: 'https://example.org/datasets',
          attachmentLabel: 'CSV archive',
          authorUsername: 'A.Saromo',
          authorName: 'Alyana Saromo',
          createdAt: '2026-07-24T14:00:00.000Z',
          updatedAt: '2026-07-24T14:00:00.000Z'
        }
      ],
      documents: [
        {
          id: 'doc-1',
          title: 'Lab guideline: sample intake protocol',
          body: 'These steps preserve integrity from intake to analysis and are reviewed monthly.',
          category: 'Protocol',
          link: 'https://example.org/intake',
          markdown: '# Sample intake\n- Review forms\n- Validate metadata\n- Lock observations',
          authorUsername: 'A.Sahagun',
          authorName: 'Alcher Sahagun',
          createdAt: '2026-07-18T10:00:00.000Z',
          updatedAt: '2026-07-18T10:00:00.000Z'
        },
        {
          id: 'doc-2',
          title: 'Meeting minutes: cross-team review',
          body: 'Highlights include publication milestone tracking and open questions for peer review.',
          category: 'Meeting',
          link: 'https://example.org/minutes',
          markdown: '## Review highlights\n- grant status confirmed\n- timeline shared',
          authorUsername: 'M.M.Sulit',
          authorName: 'Mary Margarette Sulit',
          createdAt: '2026-07-22T11:30:00.000Z',
          updatedAt: '2026-07-22T11:30:00.000Z'
        }
      ],
      projects: [
        {
          id: 'project-1',
          title: 'Cellular signal mapping',
          body: 'A multi-site study tracking signal variation under controlled contrast conditions.',
          status: 'Ongoing',
          progress: 64,
          link: 'https://example.org/project-signals',
          authorUsername: 'R.Sablang',
          authorName: 'Redgelson Sablang',
          createdAt: '2026-07-12T08:30:00.000Z',
          updatedAt: '2026-07-26T08:30:00.000Z'
        },
        {
          id: 'project-2',
          title: 'Peer review readiness pack',
          body: 'Documentation and evidence packaging for the upcoming publication review.',
          status: 'Under Review',
          progress: 82,
          link: 'https://example.org/review-pack',
          authorUsername: 'A.L.Santos',
          authorName: 'Ashanti Lhane',
          createdAt: '2026-07-10T12:00:00.000Z',
          updatedAt: '2026-07-25T12:00:00.000Z'
        }
      ]
    };
  }

  async function loadStateAsync() {
    const remoteState = await readFromBackend();
    if (remoteState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
      return remoteState;
    }

    const supabaseState = await readFromSupabase();
    if (supabaseState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(supabaseState));
      return supabaseState;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      const initial = getDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      const initial = getDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async function createPost(payload) {
    const state = loadState();
    const item = {
      id: `post-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.posts.unshift(item);
    saveState(state);

    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (backendUrl && window.backendApi?.request) {
      const remoteItem = await window.backendApi.request({ endpoint: '/api/content/posts', method: 'POST', body: item, fallbackValue: null });
      if (remoteItem) {
        state.posts = state.posts.filter((entry) => entry.id !== item.id);
        state.posts.unshift(mapRemoteItem(remoteItem, 'posts'));
        saveState(state);
        return state.posts[0];
      }
    }

    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('posts').insert({
        id: item.id,
        title: item.title,
        body: item.body,
        category: item.category,
        link: item.link,
        attachment_label: item.attachmentLabel,
        attachment_data: item.attachmentData,
        file_name: item.fileName,
        author_username: item.authorUsername,
        author_name: item.authorName,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      });
      if (error) {
        console.error(error);
      }
    }
    return item;
  }

  async function updatePost(id, payload) {
    const state = loadState();
    state.posts = state.posts.map((item) => item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item);
    saveState(state);

    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (backendUrl && window.backendApi?.request) {
      const remoteItem = await window.backendApi.request({ endpoint: `/api/content/posts/${id}`, method: 'PUT', body: { ...payload, id }, fallbackValue: null });
      if (remoteItem) {
        state.posts = state.posts.map((item) => item.id === id ? mapRemoteItem(remoteItem, 'posts') : item);
        saveState(state);
        return state.posts.find((item) => item.id === id);
      }
    }

    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('posts').update({
        title: payload.title,
        body: payload.body,
        category: payload.category,
        link: payload.link,
        attachment_label: payload.attachmentLabel,
        attachment_data: payload.attachmentData,
        file_name: payload.fileName,
        author_username: payload.authorUsername,
        author_name: payload.authorName,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) {
        console.error(error);
      }
    }
    return state.posts.find((item) => item.id === id);
  }

  async function deletePost(id) {
    const state = loadState();
    state.posts = state.posts.filter((item) => item.id !== id);
    saveState(state);

    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (backendUrl && window.backendApi?.request) {
      await window.backendApi.request({ endpoint: `/api/content/posts/${id}`, method: 'DELETE', fallbackValue: null });
    }

    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('posts').delete().eq('id', id);
      if (error) {
        console.error(error);
      }
    }
  }

  async function createDocument(payload) {
    const state = loadState();
    const item = {
      id: `doc-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.documents.unshift(item);
    saveState(state);

    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (backendUrl && window.backendApi?.request) {
      const remoteItem = await window.backendApi.request({ endpoint: '/api/content/documents', method: 'POST', body: item, fallbackValue: null });
      if (remoteItem) {
        state.documents = state.documents.filter((entry) => entry.id !== item.id);
        state.documents.unshift(mapRemoteItem(remoteItem, 'documents'));
        saveState(state);
        return state.documents[0];
      }
    }

    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('documents').insert({
        id: item.id,
        title: item.title,
        body: item.body,
        category: item.category,
        link: item.link,
        markdown: item.markdown,
        attachment_label: item.attachmentLabel,
        attachment_data: item.attachmentData,
        file_name: item.fileName,
        author_username: item.authorUsername,
        author_name: item.authorName,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      });
      if (error) {
        console.error(error);
      }
    }
    return item;
  }

  async function updateDocument(id, payload) {
    const state = loadState();
    state.documents = state.documents.map((item) => item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item);
    saveState(state);

    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (backendUrl && window.backendApi?.request) {
      const remoteItem = await window.backendApi.request({ endpoint: `/api/content/documents/${id}`, method: 'PUT', body: { ...payload, id }, fallbackValue: null });
      if (remoteItem) {
        state.documents = state.documents.map((item) => item.id === id ? mapRemoteItem(remoteItem, 'documents') : item);
        saveState(state);
        return state.documents.find((item) => item.id === id);
      }
    }

    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('documents').update({
        title: payload.title,
        body: payload.body,
        category: payload.category,
        link: payload.link,
        markdown: payload.markdown,
        attachment_label: payload.attachmentLabel,
        attachment_data: payload.attachmentData,
        file_name: payload.fileName,
        author_username: payload.authorUsername,
        author_name: payload.authorName,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) {
        console.error(error);
      }
    }
    return state.documents.find((item) => item.id === id);
  }

  async function deleteDocument(id) {
    const state = loadState();
    state.documents = state.documents.filter((item) => item.id !== id);
    saveState(state);

    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (backendUrl && window.backendApi?.request) {
      await window.backendApi.request({ endpoint: `/api/content/documents/${id}`, method: 'DELETE', fallbackValue: null });
    }

    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('documents').delete().eq('id', id);
      if (error) {
        console.error(error);
      }
    }
  }

  async function createProject(payload) {
    const state = loadState();
    const item = {
      id: `project-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.projects.unshift(item);
    saveState(state);

    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (backendUrl && window.backendApi?.request) {
      const remoteItem = await window.backendApi.request({ endpoint: '/api/content/projects', method: 'POST', body: item, fallbackValue: null });
      if (remoteItem) {
        state.projects = state.projects.filter((entry) => entry.id !== item.id);
        state.projects.unshift(mapRemoteItem(remoteItem, 'projects'));
        saveState(state);
        return state.projects[0];
      }
    }

    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('projects').insert({
        id: item.id,
        title: item.title,
        body: item.body,
        status: item.status,
        progress: item.progress,
        link: item.link,
        author_username: item.authorUsername,
        author_name: item.authorName,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      });
      if (error) {
        console.error(error);
      }
    }
    return item;
  }

  async function updateProject(id, payload) {
    const state = loadState();
    state.projects = state.projects.map((item) => item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item);
    saveState(state);

    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (backendUrl && window.backendApi?.request) {
      const remoteItem = await window.backendApi.request({ endpoint: `/api/content/projects/${id}`, method: 'PUT', body: { ...payload, id }, fallbackValue: null });
      if (remoteItem) {
        state.projects = state.projects.map((item) => item.id === id ? mapRemoteItem(remoteItem, 'projects') : item);
        saveState(state);
        return state.projects.find((item) => item.id === id);
      }
    }

    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('projects').update({
        title: payload.title,
        body: payload.body,
        status: payload.status,
        progress: payload.progress,
        link: payload.link,
        author_username: payload.authorUsername,
        author_name: payload.authorName,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) {
        console.error(error);
      }
    }
    return state.projects.find((item) => item.id === id);
  }

  async function deleteProject(id) {
    const state = loadState();
    state.projects = state.projects.filter((item) => item.id !== id);
    saveState(state);

    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (backendUrl && window.backendApi?.request) {
      await window.backendApi.request({ endpoint: `/api/content/projects/${id}`, method: 'DELETE', fallbackValue: null });
    }

    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('projects').delete().eq('id', id);
      if (error) {
        console.error(error);
      }
    }
  }

  async function getStateAsync() {
    return loadStateAsync();
  }

  function getState() {
    return loadState();
  }

  function getFeedItems() {
    const state = loadState();
    return [
      ...state.posts.map((item) => ({ ...item, type: 'post' })),
      ...state.documents.map((item) => ({ ...item, type: 'document' })),
      ...state.projects.map((item) => ({ ...item, type: 'project' }))
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  window.contentApi = {
    loadState,
    loadStateAsync,
    getState,
    getStateAsync,
    getFeedItems,
    createPost,
    updatePost,
    deletePost,
    createDocument,
    updateDocument,
    deleteDocument,
    createProject,
    updateProject,
    deleteProject
  };
})();
