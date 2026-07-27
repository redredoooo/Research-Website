(function () {
  const STORAGE_KEY = 'research-group-auth';
  const fallbackUsers = [
    { username: 'R.Sablang', password: 'Redgelson Sablang', fullName: 'Redgelson Sablang', role: 'Researcher', isAdmin: true },
    { username: 'M.M.Sulit', password: 'Mary Margarette Sulit', fullName: 'Mary Margarette Sulit', role: 'Research Leader', isAdmin: true },
    { username: 'B.J.Valencia', password: 'Baron James Valencia', fullName: 'Baron James Valencia', role: 'Researcher', isAdmin: false },
    { username: 'A.L.Santos', password: 'Ashanti Lhane', fullName: 'Ashanti Lhane', role: 'Researcher', isAdmin: false },
    { username: 'A.Saromo', password: 'Alyana Saromo', fullName: 'Alyana Saromo', role: 'Researcher', isAdmin: false },
    { username: 'A.Sahagun', password: 'Alcher Sahagun', fullName: 'Alcher Sahagun', role: 'Researcher', isAdmin: false }
  ];

  function getUsers() {
    return fallbackUsers;
  }

  function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async function login(username, password) {
    const backendUrl = window.__APP_CONFIG__?.backendUrl || '';
    if (backendUrl) {
      try {
        const response = await fetch(`${backendUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: username, password })
        });
        const payload = await response.json();
        if (!response.ok || !payload?.user) {
          return null;
        }
        setCurrentUser({
          ...payload.user,
          accessToken: payload.session?.access_token || ''
        });
        return payload.user;
      } catch (error) {
        console.error('Auth request failed', error);
      }
    }

    const fallbackUser = fallbackUsers.find((entry) => entry.username === username && entry.password === password);
    if (!fallbackUser) return null;
    setCurrentUser(fallbackUser);
    return fallbackUser;
  }

  async function logout() {
    const user = getCurrentUser();
    if (user?.accessToken) {
      try {
        await fetch(`${window.__APP_CONFIG__?.backendUrl || ''}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.accessToken}` }
        });
      } catch (error) {
        console.error('Logout request failed', error);
      }
    }
    localStorage.removeItem(STORAGE_KEY);
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function getUserSummary(username) {
    return fallbackUsers.find((user) => user.username === username) || null;
  }

  function isAdmin(user) {
    return Boolean(user && (user.isAdmin || user.role === 'admin'));
  }

  window.authApi = {
    getUsers,
    login,
    logout,
    getCurrentUser,
    getUserSummary,
    isAdmin
  };
})();
