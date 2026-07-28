(function () {
  const STORAGE_KEY = 'research-group-auth';
  const fallbackUsers = [
    { username: 'R.Sablang', password: 'Redgelson Sablang', fullName: 'Redgelson Sablang', role: 'Researcher', isAdmin: true },
    { username: 'M.M.Sulit', password: 'Mary Margarette Sulit', fullName: 'Mary Margarette Sulit', role: 'Research Leader', isAdmin: true },
    { username: 'B.J.Valencia', password: 'Baron James Valencia', fullName: 'Baron James Valencia', role: 'Researcher', isAdmin: false },
    { username: 'A.L.Santos', password: 'Ashanti Lhane Santos', fullName: 'Ashanti Lhane Santos', role: 'Researcher', isAdmin: false },
    { username: 'A.Saromo', password: 'Alyana Saromo', fullName: 'Alyana Saromo', role: 'Researcher', isAdmin: false },
    { username: 'A.Sahagun', password: 'Alcher Sahagun', fullName: 'Alcher Sahagun', role: 'Researcher', isAdmin: false }
  ];

  function getUsers() {
    return fallbackUsers.map((user) => ({
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      isAdmin: user.isAdmin
    }));
  }

  function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async function login(username, password) {
    const normalizedUsername = String(username || '').trim();
    const normalizedPassword = String(password || '').trim();
    const matchedUser = fallbackUsers.find((user) => user.username === normalizedUsername && user.password === normalizedPassword);
    if (!matchedUser) {
      return null;
    }
    const user = {
      username: matchedUser.username,
      fullName: matchedUser.fullName,
      role: matchedUser.role,
      isAdmin: matchedUser.isAdmin,
      accessToken: 'local-session-token'
    };
    setCurrentUser(user);
    return user;
  }

  async function logout() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function getUserSummary(username) {
    return fallbackUsers.find((user) => user.username === username) || null;
  }

  function getUserByUsername(username) {
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
