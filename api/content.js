(function () {
  const STORAGE_KEY = 'research-group-content';

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

  function createPost(payload) {
    const state = loadState();
    const item = {
      id: `post-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.posts.unshift(item);
    saveState(state);
    return item;
  }

  function updatePost(id, payload) {
    const state = loadState();
    state.posts = state.posts.map((item) => item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item);
    saveState(state);
    return state.posts.find((item) => item.id === id);
  }

  function deletePost(id) {
    const state = loadState();
    state.posts = state.posts.filter((item) => item.id !== id);
    saveState(state);
  }

  function createDocument(payload) {
    const state = loadState();
    const item = {
      id: `doc-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.documents.unshift(item);
    saveState(state);
    return item;
  }

  function updateDocument(id, payload) {
    const state = loadState();
    state.documents = state.documents.map((item) => item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item);
    saveState(state);
    return state.documents.find((item) => item.id === id);
  }

  function deleteDocument(id) {
    const state = loadState();
    state.documents = state.documents.filter((item) => item.id !== id);
    saveState(state);
  }

  function createProject(payload) {
    const state = loadState();
    const item = {
      id: `project-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.projects.unshift(item);
    saveState(state);
    return item;
  }

  function updateProject(id, payload) {
    const state = loadState();
    state.projects = state.projects.map((item) => item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item);
    saveState(state);
    return state.projects.find((item) => item.id === id);
  }

  function deleteProject(id) {
    const state = loadState();
    state.projects = state.projects.filter((item) => item.id !== id);
    saveState(state);
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
    getState,
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
