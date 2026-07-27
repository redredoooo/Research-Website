const teamMembers = [
  { username: 'R.Sablang', fullName: 'Redgelson Sablang', role: 'Researcher', initials: 'R.Sablang' },
  { username: 'M.M.Sulit', fullName: 'Mary Margarette Sulit', role: 'Research Lead', initials: 'M.M.Sulit' },
  { username: 'B.J.Valencia', fullName: 'Baron James Valencia', role: 'Researcher', initials: 'B.J.Valencia' },
  { username: 'A.L.Santos', fullName: 'Ashanti Lhane Santos', role: 'Researcher', initials: 'A.L.Santos' },
  { username: 'A.Saromo', fullName: 'Alyana Saromo', role: 'Researcher', initials: 'A.Saromo' },
  { username: 'A.Sahagun', fullName: 'Alcher Sahagun', role: 'Researcher', initials: 'A.Sahagun' }
];

const state = {
  activePage: 'home',
  contentFilter: 'all',
  docFilter: 'All',
  editingPostId: null,
  editingDocId: null,
  editingProjectId: null
};

window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
window.__APP_CONFIG__.backendUrl = window.__APP_CONFIG__.backendUrl || '';
window.__APP_CONFIG__.dataSource = window.__APP_CONFIG__.dataSource || 'local';
window.__APP_CONFIG__.supabaseUrl = window.__APP_CONFIG__.supabaseUrl || '';
window.__APP_CONFIG__.supabaseAnonKey = window.__APP_CONFIG__.supabaseAnonKey || '';

async function init() {
  bindEvents();
  cacheApi.write('app-state', { lastOpened: new Date().toISOString(), theme: 'light' });
  if (window.__APP_CONFIG__?.dataSource === 'supabase') {
    await contentApi.loadStateAsync();
  }
  render();
  if (!authApi.getCurrentUser()) {
    showToast('Guest mode enabled. Browse public research updates.');
  }
}

function bindEvents() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.id === 'openLogin') {
        openModal('authModal');
        return;
      }
      setActivePage(button.getAttribute('data-page'));
    });
  });

  document.getElementById('authTrigger').addEventListener('click', async () => {
    const currentUser = authApi.getCurrentUser();
    if (currentUser) {
      await authApi.logout();
      render();
      showToast('Signed out successfully.');
    } else {
      openModal('authModal');
    }
  });

  document.getElementById('closeAuthModal').addEventListener('click', () => closeModal('authModal'));
  document.getElementById('closeContentModal').addEventListener('click', () => closeModal('contentModal'));
  document.getElementById('closeDocModal').addEventListener('click', () => closeModal('docModal'));
  document.getElementById('closeProjectModal').addEventListener('click', () => closeModal('projectModal'));

  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const user = await authApi.login(username, password);
    if (!user) {
      showToast('Invalid credentials. Please try again with your member account.', 'error');
      return;
    }
    closeModal('authModal');
    render();
    showToast(`Welcome back, ${user.fullName}.`, 'success');
  });

  document.getElementById('createPostBtn').addEventListener('click', () => {
    if (!authApi.getCurrentUser()) {
      showToast('Please sign in to create content.', 'error');
      openModal('authModal');
      return;
    }
    resetPostForm();
    openModal('contentModal');
  });

  document.getElementById('postForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentUser = authApi.getCurrentUser();
    if (!currentUser) return;
    const fileData = await readSelectedFile('postFile');
    const payload = {
      title: document.getElementById('postTitle').value.trim(),
      body: document.getElementById('postBody').value.trim(),
      category: document.getElementById('postCategory').value,
      link: document.getElementById('postLink').value.trim(),
      attachmentLabel: document.getElementById('postAttachment').value.trim() || fileData?.name || '',
      attachmentData: fileData?.data || '',
      fileName: fileData?.name || '',
      authorUsername: currentUser.username,
      authorName: currentUser.fullName
    };
    if (state.editingPostId) {
      contentApi.updatePost(state.editingPostId, payload);
      showToast('Post updated.', 'success');
    } else {
      contentApi.createPost(payload);
      showToast('Post published to the content board.', 'success');
    }
    resetPostForm();
    closeModal('contentModal');
    render();
  });

  document.getElementById('createDocBtn').addEventListener('click', () => {
    if (!authApi.getCurrentUser()) {
      showToast('Please sign in to create documents.', 'error');
      openModal('authModal');
      return;
    }
    resetDocForm();
    openModal('docModal');
  });

  document.getElementById('docForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentUser = authApi.getCurrentUser();
    if (!currentUser) return;
    const fileData = await readSelectedFile('docFile');
    const payload = {
      title: document.getElementById('docTitle').value.trim(),
      body: document.getElementById('docBody').value.trim(),
      category: document.getElementById('docCategory').value,
      link: document.getElementById('docLink').value.trim(),
      markdown: document.getElementById('docMarkdown').value.trim(),
      attachmentLabel: fileData?.name || '',
      attachmentData: fileData?.data || '',
      fileName: fileData?.name || '',
      authorUsername: currentUser.username,
      authorName: currentUser.fullName
    };
    if (state.editingDocId) {
      contentApi.updateDocument(state.editingDocId, payload);
      showToast('Document updated.', 'success');
    } else {
      contentApi.createDocument(payload);
      showToast('Documentation entry created.', 'success');
    }
    resetDocForm();
    closeModal('docModal');
    render();
  });

  document.getElementById('createProjectBtn').addEventListener('click', () => {
    if (!authApi.getCurrentUser()) {
      showToast('Please sign in to add projects.', 'error');
      openModal('authModal');
      return;
    }
    resetProjectForm();
    openModal('projectModal');
  });

  document.getElementById('projectForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const currentUser = authApi.getCurrentUser();
    if (!currentUser) return;
    const payload = {
      title: document.getElementById('projectTitle').value.trim(),
      body: document.getElementById('projectBody').value.trim(),
      status: document.getElementById('projectStatus').value,
      progress: Number(document.getElementById('projectProgress').value),
      link: document.getElementById('projectLink').value.trim(),
      authorUsername: currentUser.username,
      authorName: currentUser.fullName
    };
    if (state.editingProjectId) {
      contentApi.updateProject(state.editingProjectId, payload);
      showToast('Project updated.', 'success');
    } else {
      contentApi.createProject(payload);
      showToast('Project added to the hub.', 'success');
    }
    resetProjectForm();
    closeModal('projectModal');
    render();
  });

  document.getElementById('contentFilter').addEventListener('change', (event) => {
    state.contentFilter = event.target.value;
    renderContentBoard();
  });

  document.getElementById('docFilter').addEventListener('change', (event) => {
    state.docFilter = event.target.value;
    renderDocs();
  });

  document.getElementById('globalSearch').addEventListener('input', (event) => {
    const term = event.target.value.toLowerCase();
    renderSearch(term);
  });
}

function render() {
  const currentUser = authApi.getCurrentUser();
  const feedItems = contentApi.getFeedItems();
  const stateData = contentApi.getState();
  const adminLabel = currentUser && authApi.isAdmin(currentUser) ? ' • Admin' : '';
  document.getElementById('authTrigger').textContent = currentUser ? `${currentUser.fullName}${adminLabel}` : 'Guest';
  document.getElementById('memberBadge').textContent = currentUser ? `Signed in as ${currentUser.fullName}${adminLabel}` : 'Guest mode';
  document.getElementById('pubCount').textContent = stateData.projects.length + 2;
  document.getElementById('grantCount').textContent = '4';
  document.getElementById('memberCount').textContent = teamMembers.length;
  document.getElementById('feedCount').textContent = `${feedItems.length} synchronized updates`;
  document.getElementById('authorCount').textContent = `${new Set(feedItems.map((item) => item.authorUsername)).size} tracked creators`;
  document.getElementById('postStat').textContent = `${stateData.posts.length} posts`;
  document.getElementById('docStat').textContent = `${stateData.documents.length} docs`;
  document.getElementById('projectStat').textContent = `${stateData.projects.length} active projects`;
  const cachedSnapshot = cacheApi.snapshot();
  document.getElementById('cacheStatus').textContent = cachedSnapshot.length ? `${cachedSnapshot.length} cached entries` : 'Stored locally';
  renderHome(feedItems);
  renderContentBoard();
  renderDocs();
  renderProjects();
  renderTeamRoster();
  renderRecentActivity(feedItems.slice(0, 4));
  updateActivePage();
}

function renderHome(feedItems) {
  const container = document.getElementById('liveFeed');
  container.innerHTML = feedItems.slice(0, 5).map((item) => renderFeedItem(item)).join('');
}

function renderContentBoard() {
  const container = document.getElementById('contentBoard');
  const stateData = contentApi.getState();
  const posts = stateData.posts.filter((post) => state.contentFilter === 'all' || post.category === state.contentFilter);
  container.innerHTML = posts.length ? posts.map((post) => renderPostItem(post)).join('') : '<div class="feed-item"><p class="muted">No posts yet for this filter.</p></div>';
}

function renderDocs() {
  const container = document.getElementById('docsList');
  const stateData = contentApi.getState();
  const docs = stateData.documents.filter((doc) => state.docFilter === 'All' || doc.category === state.docFilter);
  container.innerHTML = docs.length ? docs.map((doc) => renderDocItem(doc)).join('') : '<div class="feed-item"><p class="muted">No documents available.</p></div>';
}

function renderProjects() {
  const container = document.getElementById('projectsList');
  const stateData = contentApi.getState();
  container.innerHTML = stateData.projects.length ? stateData.projects.map((project) => renderProjectItem(project)).join('') : '<div class="feed-item"><p class="muted">No projects available.</p></div>';
}

function renderRecentActivity(feedItems) {
  const container = document.getElementById('recentActivity');
  container.innerHTML = feedItems.map((item) => renderFeedItem(item)).join('');
}

function renderTeamRoster() {
  const container = document.getElementById('teamRoster');
  container.innerHTML = teamMembers.map((member) => `
    <article class="team-item">
      <div class="team-meta">
        <div class="avatar">${member.initials}</div>
        <div>
          <h4>${member.fullName}</h4>
          <p class="muted">${member.role}</p>
        </div>
      </div>
      <span class="chip">Verified</span>
    </article>
  `).join('');
}

function renderFeedItem(item) {
  return `
    <article class="feed-item">
      <div class="badge-row">
        <span class="badge">${item.type === 'project' ? 'Project milestone' : item.type === 'document' ? 'Documentation' : 'Content board'}</span>
        <span class="badge">${item.category || item.status || 'Live'}</span>
      </div>
      <h4>${item.title}</h4>
      <p class="muted">${item.body}</p>
      ${item.link ? `<a class="action-link" href="${item.link}" target="_blank" rel="noreferrer">Open resource</a>` : ''}
      <div class="author-row">
        <span>Posted by: ${item.authorName}</span>
        <span>${new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
    </article>
  `;
}

function renderPostItem(post) {
  const currentUser = authApi.getCurrentUser();
  const isAdmin = authApi.isAdmin(currentUser);
  const canManage = currentUser && (isAdmin || currentUser.username === post.authorUsername);
  return `
    <article class="feed-item">
      <div class="badge-row"><span class="badge">${capitalize(post.category)}</span></div>
      <h4>${post.title}</h4>
      <p class="muted">${post.body}</p>
      ${post.link ? `<a class="action-link" href="${post.link}" target="_blank" rel="noreferrer">${post.attachmentLabel || 'Open resource'}</a>` : ''}
      <div class="author-row">
        <span>Created by: ${post.authorName}</span>
        <span>${new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      ${canManage ? `<div class="inline-actions"><button class="small-btn" data-action="edit-post" data-id="${post.id}">Edit</button><button class="small-btn" data-action="delete-post" data-id="${post.id}">Delete</button></div>` : ''}
    </article>
  `;
}

function renderDocItem(doc) {
  const currentUser = authApi.getCurrentUser();
  const isAdmin = authApi.isAdmin(currentUser);
  const canManage = currentUser && (isAdmin || currentUser.username === doc.authorUsername);
  return `
    <article class="doc-card">
      <div class="badge-row"><span class="badge">${doc.category}</span></div>
      <h4>${doc.title}</h4>
      <p class="muted">${doc.body}</p>
      ${doc.link ? `<a class="action-link" href="${doc.link}" target="_blank" rel="noreferrer">Open resource</a>` : ''}
      <div class="author-row">
        <span>Author: ${doc.authorName}</span>
        <span>${new Date(doc.updatedAt).toLocaleDateString()}</span>
      </div>
      ${canManage ? `<div class="inline-actions"><button class="small-btn" data-action="edit-doc" data-id="${doc.id}">Edit</button><button class="small-btn" data-action="delete-doc" data-id="${doc.id}">Delete</button></div>` : ''}
    </article>
  `;
}

function renderProjectItem(project) {
  const currentUser = authApi.getCurrentUser();
  const isAdmin = authApi.isAdmin(currentUser);
  const canManage = currentUser && (isAdmin || currentUser.username === project.authorUsername);
  return `
    <article class="project-card">
      <div class="badge-row"><span class="badge">${project.status}</span></div>
      <h4>${project.title}</h4>
      <p class="muted">${project.body}</p>
      <div class="badge-row"><span class="badge">Progress ${project.progress}%</span></div>
      ${project.link ? `<a class="action-link" href="${project.link}" target="_blank" rel="noreferrer">Linked documentation</a>` : ''}
      <div class="author-row">
        <span>Author: ${project.authorName}</span>
        <span>${new Date(project.updatedAt).toLocaleDateString()}</span>
      </div>
      ${canManage ? `<div class="inline-actions"><button class="small-btn" data-action="edit-project" data-id="${project.id}">Update</button><button class="small-btn" data-action="delete-project" data-id="${project.id}">Delete</button></div>` : ''}
    </article>
  `;
}

function renderSearch(term) {
  const feedItems = contentApi.getFeedItems().filter((item) => {
    const haystack = `${item.title} ${item.body} ${item.authorName} ${item.category || ''}`.toLowerCase();
    return haystack.includes(term);
  });
  document.getElementById('liveFeed').innerHTML = feedItems.slice(0, 5).map((item) => renderFeedItem(item)).join('');
}

function setActivePage(page) {
  state.activePage = page;
  updateActivePage();
}

function updateActivePage() {
  document.querySelectorAll('.page-section').forEach((section) => section.classList.toggle('active', section.id === `${state.activePage}Page`));
  document.querySelectorAll('.nav-pill, .mobile-nav-btn').forEach((button) => {
    const isActive = button.getAttribute('data-page') === state.activePage;
    button.classList.toggle('active', isActive);
  });
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  document.getElementById(id).setAttribute('aria-hidden', 'false');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.getElementById(id).setAttribute('aria-hidden', 'true');
}

function resetPostForm() {
  state.editingPostId = null;
  document.getElementById('postForm').reset();
  document.getElementById('editType').value = '';
  document.getElementById('editId').value = '';
  document.getElementById('modalTitle').textContent = 'Create a post';
}

function resetDocForm() {
  state.editingDocId = null;
  document.getElementById('docForm').reset();
  document.getElementById('docModalTitle').textContent = 'Add a document';
}

function readSelectedFile(inputId) {
  return new Promise((resolve) => {
    const input = document.getElementById(inputId);
    const file = input?.files?.[0];
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, data: reader.result });
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function resetProjectForm() {
  state.editingProjectId = null;
  document.getElementById('projectForm').reset();
  document.getElementById('projectModalTitle').textContent = 'Add a project';
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function attachInlineHandlers() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (action === 'edit-post') {
      const post = contentApi.getState().posts.find((item) => item.id === id);
      if (!post) return;
      state.editingPostId = id;
      document.getElementById('postTitle').value = post.title;
      document.getElementById('postBody').value = post.body;
      document.getElementById('postCategory').value = post.category;
      document.getElementById('postLink').value = post.link || '';
      document.getElementById('postAttachment').value = post.attachmentLabel || '';
      document.getElementById('editId').value = id;
      document.getElementById('modalTitle').textContent = 'Edit post';
      openModal('contentModal');
    }
    if (action === 'delete-post') {
      contentApi.deletePost(id);
      showToast('Post removed.', 'success');
      render();
    }
    if (action === 'edit-doc') {
      const doc = contentApi.getState().documents.find((item) => item.id === id);
      if (!doc) return;
      state.editingDocId = id;
      document.getElementById('docTitle').value = doc.title;
      document.getElementById('docBody').value = doc.body;
      document.getElementById('docCategory').value = doc.category;
      document.getElementById('docLink').value = doc.link || '';
      document.getElementById('docMarkdown').value = doc.markdown || '';
      document.getElementById('editDocId').value = id;
      document.getElementById('docModalTitle').textContent = 'Edit document';
      openModal('docModal');
    }
    if (action === 'delete-doc') {
      contentApi.deleteDocument(id);
      showToast('Document removed.', 'success');
      render();
    }
    if (action === 'edit-project') {
      const project = contentApi.getState().projects.find((item) => item.id === id);
      if (!project) return;
      state.editingProjectId = id;
      document.getElementById('projectTitle').value = project.title;
      document.getElementById('projectBody').value = project.body;
      document.getElementById('projectStatus').value = project.status;
      document.getElementById('projectProgress').value = project.progress;
      document.getElementById('projectLink').value = project.link || '';
      document.getElementById('editProjectId').value = id;
      document.getElementById('projectModalTitle').textContent = 'Update project';
      openModal('projectModal');
    }
    if (action === 'delete-project') {
      contentApi.deleteProject(id);
      showToast('Project removed.', 'success');
      render();
    }
  });
}

attachInlineHandlers();
document.addEventListener('DOMContentLoaded', init);
