/**
 * storage.js - LocalStorage Adapter with User Auth
 * Safe persistence layer for users, scores, sessions, and preferences
 */

const Storage = (() => {
  const KEYS = {
    USERS: 'typingtest_users',       // Array of registered users
    SESSION: 'typingtest_session',   // Current logged-in user ID
    SCORES: 'typingtest_scores',     // { [userId]: Array of scores }
    SETTINGS: 'typingtest_settings'  // { [userId]: settings }
  };

  // ---- Base Helpers ----
  function get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`Storage.get failed for "${key}":`, e);
      return defaultValue;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Storage.set failed for "${key}":`, e);
      return false;
    }
  }

  function remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  // ---- Simple hash for passwords ----
  async function hashPassword(password) {
    // Try Web Crypto API first (requires secure context)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + '_typeflow_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) { /* fall through to simple hash */ }
    }
    // Fallback: djb2 hash (non-cryptographic, sufficient for localStorage)
    let hash = 5381 + '_typeflow_salt';
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) + hash + password.charCodeAt(i)) & 0xFFFFFFFF;
    }
    return 'fb_' + Math.abs(hash).toString(36) + '_' + password.length;
  }

  // ---- User Registration ----
  async function registerUser({ nickname, email, password, avatar }) {
    const users = get(KEYS.USERS, []);
    const emailLower = email.toLowerCase().trim();

    // Check if email already exists
    if (users.some(u => u.email === emailLower)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPassword(password);
    const user = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      nickname: nickname.trim(),
      email: emailLower,
      passwordHash,
      avatar: avatar || '🧑‍💻',
      createdAt: new Date().toISOString()
    };

    users.push(user);
    set(KEYS.USERS, users);

    // Initialize empty scores for this user
    const allScores = get(KEYS.SCORES, {});
    allScores[user.id] = [];
    set(KEYS.SCORES, allScores);

    return { success: true, user: _sanitizeUser(user) };
  }

  // ---- User Login ----
  async function loginUser(email, password) {
    const users = get(KEYS.USERS, []);
    const emailLower = email.toLowerCase().trim();
    const user = users.find(u => u.email === emailLower);

    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Set session
    set(KEYS.SESSION, user.id);
    return { success: true, user: _sanitizeUser(user) };
  }

  // ---- Session Management ----
  function setSession(userId) {
    set(KEYS.SESSION, userId);
  }

  function getSession() {
    return get(KEYS.SESSION, null);
  }

  function clearSession() {
    remove(KEYS.SESSION);
  }

  function getCurrentUser() {
    const sessionId = getSession();
    if (!sessionId) return null;
    const users = get(KEYS.USERS, []);
    const user = users.find(u => u.id === sessionId);
    return user ? _sanitizeUser(user) : null;
  }

  // ---- User Profile Update ----
  function updateUserProfile(userId, updates) {
    const users = get(KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    Object.assign(users[idx], updates);
    set(KEYS.USERS, users);
    return true;
  }

  // ---- Remove password hash from user object for external use ----
  function _sanitizeUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // ---- Scores (per user) ----
  function getScores(userId) {
    const allScores = get(KEYS.SCORES, {});
    return allScores[userId] || [];
  }

  function addScore(userId, score) {
    const allScores = get(KEYS.SCORES, {});
    if (!allScores[userId]) allScores[userId] = [];

    const entry = {
      ...score,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: score.date || new Date().toISOString()
    };
    allScores[userId].unshift(entry);
    if (allScores[userId].length > 100) allScores[userId].length = 100;

    set(KEYS.SCORES, allScores);
    return true;
  }

  function getAggregateStats(userId) {
    const scores = getScores(userId);
    if (scores.length === 0) {
      return { totalTests: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 };
    }
    const totalTests = scores.length;
    const bestWpm = Math.max(...scores.map(s => s.wpm || 0));
    const avgWpm = Math.round(scores.reduce((sum, s) => sum + (s.wpm || 0), 0) / totalTests);
    const avgAccuracy = Math.round(scores.reduce((sum, s) => sum + (s.accuracy || 0), 0) / totalTests);
    return { totalTests, bestWpm, avgWpm, avgAccuracy };
  }

  // ---- Settings (per user) ----
  function getSettings(userId) {
    const allSettings = get(KEYS.SETTINGS, {});
    return allSettings[userId] || { theme: 'cyberpunk', mode: 'time', duration: 30, wordCount: 25 };
  }

  function updateSettings(userId, partial) {
    const allSettings = get(KEYS.SETTINGS, {});
    allSettings[userId] = { ...(allSettings[userId] || {}), ...partial };
    set(KEYS.SETTINGS, allSettings);
  }

  // ---- Logout ----
  function logout() {
    clearSession();
  }

  // Seed a default user if none exist
  async function seedDefaultUser() {
    const users = get(KEYS.USERS, []);
    if (users.length === 0) {
      const email = 'user@example.com';
      const password = 'password123';
      const passwordHash = await hashPassword(password);
      const defaultUser = {
        id: 'demo-user-id',
        nickname: 'SpeedyTyper',
        email: email,
        passwordHash: passwordHash,
        avatar: '⚡',
        createdAt: new Date().toISOString()
      };
      users.push(defaultUser);
      set(KEYS.USERS, users);

      // Initialize empty scores and default settings for this user
      const allScores = get(KEYS.SCORES, {});
      allScores[defaultUser.id] = [];
      set(KEYS.SCORES, allScores);

      const allSettings = get(KEYS.SETTINGS, {});
      allSettings[defaultUser.id] = { theme: 'cyberpunk', mode: 'time', duration: 30, wordCount: 25 };
      set(KEYS.SETTINGS, allSettings);
    }
  }

  // Trigger seeding asynchronously
  seedDefaultUser().catch(err => console.warn('Failed to seed default user:', err));

  return {
    KEYS, registerUser, loginUser, setSession, getSession, clearSession,
    getCurrentUser, updateUserProfile, getScores, addScore,
    getAggregateStats, getSettings, updateSettings, logout,
    get, set, remove, hashPassword
  };
})();

export default Storage;
