(function () {
  const STORAGE_KEY = 'research-group-auth';
  const users = [
    { username: 'R.Sablang', password: 'Redgelson Sablang', fullName: 'Redgelson Sablang', role: 'Principal Investigator', isAdmin: true },
    { username: 'M.M.Sulit', password: 'Mary Margarette Sulit', fullName: 'Mary Margarette Sulit', role: 'Systems Architect', isAdmin: true },
    { username: 'B.J.Valencia', password: 'Baron James Valencia', fullName: 'Baron James Valencia', role: 'Research Lead', isAdmin: false },
    { username: 'A.L.Santos', password: 'Ashanti Lhane', fullName: 'Ashanti Lhane', role: 'Community Scientist', isAdmin: false },
    { username: 'A.Saromo', password: 'Alyana Saromo', fullName: 'Alyana Saromo', role: 'Data Strategist', isAdmin: false },
    { username: 'A.Sahagun', password: 'Alcher Sahagun', fullName: 'Alcher Sahagun', role: 'Knowledge Curator', isAdmin: false }
  ];

  function getUsers() {
    return users;
  }

  function login(username, password) {
    const user = users.find((entry) => entry.username === username && entry.password === password);
    if (!user) return null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function getUserSummary(username) {
    return users.find((user) => user.username === username) || null;
  }

  function isAdmin(user) {
    return Boolean(user && user.isAdmin);
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
