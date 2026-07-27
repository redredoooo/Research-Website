(function () {
  const STORAGE_KEY = 'research-group-auth';
  const users = [
    { username: 'R.Sablang', password: 'Redgelson Sablang', fullName: 'Redgelson Sablang', role: 'Researcher', isAdmin: true },
    { username: 'M.M.Sulit', password: 'Mary Margarette Sulit', fullName: 'Mary Margarette Sulit', role: 'Research Leader', isAdmin: true },
    { username: 'B.J.Valencia', password: 'Baron James Valencia', fullName: 'Baron James Valencia', role: 'Researcher', isAdmin: false },
    { username: 'A.L.Santos', password: 'Ashanti Lhane', fullName: 'Ashanti Lhane', role: 'Researcher', isAdmin: false },
    { username: 'A.Saromo', password: 'Alyana Saromo', fullName: 'Alyana Saromo', role: 'Researcher', isAdmin: false },
    { username: 'A.Sahagun', password: 'Alcher Sahagun', fullName: 'Alcher Sahagun', role: 'Researcher', isAdmin: false }
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
