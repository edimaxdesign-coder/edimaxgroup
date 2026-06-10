(function () {
  const AUTH_STORAGE_KEY = "edimax-group-cms-users-v1";
  const SESSION_KEY = "edimax-group-cms-session-v1";
  const ROLES = {
    admin: "管理員",
    editor: "編輯者",
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
  const randomToken = () => {
    const values = new Uint8Array(16);
    window.crypto.getRandomValues(values);
    return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
  };

  const hashPassword = async (password, salt) => {
    const data = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
  };

  const getUsers = () => {
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      const users = stored ? JSON.parse(stored) : [];
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.warn("Auth users fallback to empty.", error);
      return [];
    }
  };

  const saveUsers = (users) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
    return clone(users);
  };

  const getSession = () => {
    try {
      const userId = window.sessionStorage.getItem(SESSION_KEY);
      const user = getUsers().find((entry) => entry.id === userId && entry.active);
      return user ? clone(user) : null;
    } catch (error) {
      return null;
    }
  };

  const setSession = (userId) => {
    window.sessionStorage.setItem(SESSION_KEY, userId);
    return getSession();
  };

  const logout = () => {
    window.sessionStorage.removeItem(SESSION_KEY);
  };

  const createUser = async ({ name, email, password, role = "editor" }, options = {}) => {
    const users = getUsers();
    const currentUser = getSession();
    const normalizedEmail = normalizeEmail(email);
    const isFirstUser = users.length === 0;

    if (!isFirstUser && (!currentUser || currentUser.role !== "admin")) {
      throw new Error("只有管理員可以建立帳號。");
    }
    if (!String(name || "").trim()) throw new Error("請輸入使用者名稱。");
    if (!normalizedEmail || !normalizedEmail.includes("@")) throw new Error("請輸入有效的 Email。");
    if (users.some((user) => user.email === normalizedEmail)) throw new Error("此 Email 已建立帳號。");
    if (String(password || "").length < 8) throw new Error("密碼至少需要 8 個字元。");

    const salt = randomToken();
    const nextUser = {
      id: `user-${Date.now()}-${randomToken().slice(0, 8)}`,
      name: String(name).trim(),
      email: normalizedEmail,
      role: isFirstUser ? "admin" : role === "admin" ? "admin" : "editor",
      active: true,
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, nextUser]);
    if (isFirstUser || options.loginAfterCreate) setSession(nextUser.id);
    return clone(nextUser);
  };

  const login = async (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    const user = getUsers().find((entry) => entry.email === normalizedEmail);
    if (!user || !user.active) throw new Error("帳號不存在或已停用。");
    const passwordHash = await hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) throw new Error("Email 或密碼錯誤。");
    return setSession(user.id);
  };

  const toggleUser = (userId) => {
    const currentUser = getSession();
    if (!currentUser || currentUser.role !== "admin") throw new Error("只有管理員可以調整帳號權限。");
    if (currentUser.id === userId) throw new Error("不能停用目前登入的帳號。");
    const users = getUsers().map((user) =>
      user.id === userId ? { ...user, active: !user.active } : user,
    );
    return saveUsers(users);
  };

  window.AdminAuth = {
    roles: ROLES,
    getUsers,
    getSession,
    createUser,
    login,
    logout,
    toggleUser,
  };
})();
