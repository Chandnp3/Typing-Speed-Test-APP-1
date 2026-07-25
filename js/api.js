/**
 * api.js - Backend API Wrapper
 * All server communication through PHP endpoints.
 */

const API_BASE = 'api/';

/**
 * Generic fetch wrapper with JSON handling.
 */
async function _fetch(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_BASE + endpoint, options);
  return res.json();
}

/**
 * Save a test score to the database.
 */
export async function saveScore(userId, { wpm, rawWpm, accuracy, mode, duration, wordsTyped }) {
  return _fetch('POST', 'save_score.php', { user_id: userId, wpm, rawWpm, accuracy, mode, duration, wordsTyped });
}

/**
 * Get user aggregate stats.
 */
export async function getStats(userId) {
  const res = await fetch(API_BASE + `get_stats.php?user_id=${userId}`);
  return res.json();
}

/**
 * Get user scores list.
 */
export async function getScores(userId, limit = 20) {
  const res = await fetch(API_BASE + `get_scores.php?user_id=${userId}&limit=${limit}`);
  return res.json();
}

/**
 * Check if localStorage has old TypeFlow data.
 */
export function checkLocalData() {
  try {
    const users = localStorage.getItem('typingtest_users');
    const scores = localStorage.getItem('typingtest_scores');
    return !!(users || scores);
  } catch (e) {
    return false;
  }
}

/**
 * Migrate data from localStorage to MySQL via API.
 */
export async function migrateFromLocalStorage(userId) {
  try {
    const scoresData = localStorage.getItem('typingtest_scores');
    const settingsData = localStorage.getItem('typingtest_settings');

    const payload = { user_id: userId };

    if (scoresData) {
      const allScores = JSON.parse(scoresData);
      // Flatten scores for this user or all scores
      payload.scores = [];
      Object.values(allScores).forEach(userScores => {
        if (Array.isArray(userScores)) {
          payload.scores.push(...userScores);
        }
      });
    }

    if (settingsData) {
      const allSettings = JSON.parse(settingsData);
      payload.settings = allSettings[userId] || null;
    }

    const result = await _fetch('POST', 'migrate.php', payload);

    // Clear localStorage after successful migration
    if (result.success) {
      localStorage.removeItem('typingtest_users');
      localStorage.removeItem('typingtest_scores');
      localStorage.removeItem('typingtest_settings');
      localStorage.removeItem('typingtest_session');
      localStorage.setItem('typingtest_migrated', 'true');
    }

    return result;
  } catch (e) {
    console.warn('Migration failed:', e);
    return { success: false };
  }
}
