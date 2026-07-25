/**
 * app.js - Entry Point & Global Bootstrapper
 * Auth flow (register/login/logout), state management, event wiring
 */

import AppState from './state.js';
import Storage from './storage.js';
import Engine from './engine.js';
import UI from './ui.js';
import Chart from './chart.js';

const App = (() => {
  let _timerInterval = null;

  // ==========================================
  // Boot
  // ==========================================
  async function boot() {
    UI.init();
    _setupAuthListeners();
    _setupNavigationListeners();
    _setupModeListeners();
    _setupThemeListeners();
    _setupKeyboardListeners();
    _setupTypingAreaListeners();
    AppState.subscribe(_onStateChange);

    // Check existing session
    const user = Storage.getCurrentUser();
    if (user) {
      AppState.setState({ user });
      _applyUserSettings(user);
      UI.showScreen('dashboard');
      _renderDashboard(user);
    } else {
      UI.showScreen('login');
    }
  }

  // ==========================================
  // Auth Flow
  // ==========================================
  function _setupAuthListeners() {
    // ---- Login Form ----
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value;
        const errorEl = document.getElementById('login-error');

        if (!email || !password) {
          _showAuthError(errorEl, 'Please fill in all fields.');
          return;
        }

        const result = await Storage.loginUser(email, password);
        if (result.success) {
          AppState.setState({ user: result.user });
          _applyUserSettings(result.user);
          UI.showScreen('dashboard');
          _renderDashboard(result.user);
        } else {
          _showAuthError(errorEl, result.error);
        }
      });
    }

    // ---- Register Form ----
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nickname = document.getElementById('reg-nickname')?.value.trim();
        const email = document.getElementById('reg-email')?.value.trim();
        const password = document.getElementById('reg-password')?.value;
        const confirm = document.getElementById('reg-password-confirm')?.value;
        const selectedAvatar = document.querySelector('.avatar-option--selected');
        const avatar = selectedAvatar ? selectedAvatar.dataset.emoji : '🧑‍💻';
        const errorEl = document.getElementById('register-error');

        if (!nickname || !email || !password || !confirm) {
          _showAuthError(errorEl, 'Please fill in all fields.');
          return;
        }
        if (password.length < 6) {
          _showAuthError(errorEl, 'Password must be at least 6 characters.');
          return;
        }
        if (password !== confirm) {
          _showAuthError(errorEl, 'Passwords do not match.');
          return;
        }

        const result = await Storage.registerUser({ nickname, email, password, avatar });
        if (result.success) {
          Storage.setSession(result.user.id);
          AppState.setState({ user: result.user });
          _applyUserSettings(result.user);
          UI.showScreen('dashboard');
          _renderDashboard(result.user);
        } else {
          _showAuthError(errorEl, result.error);
        }
      });
    }

    // ---- Avatar selection in register form ----
    document.querySelectorAll('.auth-avatars .avatar-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.auth-avatars .avatar-option').forEach(o => o.classList.remove('avatar-option--selected'));
        opt.classList.add('avatar-option--selected');
      });
    });

    // ---- Switch between login/register ----
    document.getElementById('goto-register')?.addEventListener('click', (e) => {
      e.preventDefault();
      _clearAuthErrors();
      UI.showScreen('register');
    });
    document.getElementById('goto-login')?.addEventListener('click', (e) => {
      e.preventDefault();
      _clearAuthErrors();
      UI.showScreen('login');
    });

    // ---- Logout ----
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      Storage.logout();
      AppState.setState({ user: null });
      _stopTimer();
      UI.showScreen('login');
      UI.setHeaderVisible(false);
    });
  }

  function _showAuthError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.classList.add('auth-error--visible');
  }

  function _clearAuthErrors() {
    document.querySelectorAll('.auth-error').forEach(el => {
      el.classList.remove('auth-error--visible');
      el.textContent = '';
    });
  }

  function _applyUserSettings(user) {
    const settings = Storage.getSettings(user.id);
    AppState.setState({
      selectedTheme: settings.theme || 'cyberpunk',
      mode: settings.mode || 'time',
      selectedDuration: settings.duration || 30,
      selectedWordCount: settings.wordCount || 25
    });
    UI.applyTheme(settings.theme || 'cyberpunk');
    UI.setHeaderVisible(true);
  }

  // ==========================================
  // Dashboard
  // ==========================================
  function _renderDashboard(user) {
    if (!user) return;

    // Profile info
    const avatarEl = document.getElementById('dash-avatar');
    const nameEl = document.getElementById('dash-nickname');
    const emailEl = document.getElementById('dash-email');
    const joinedEl = document.getElementById('dash-joined');

    if (avatarEl) avatarEl.textContent = user.avatar || '🧑‍💻';
    if (nameEl) nameEl.textContent = user.nickname;
    if (emailEl) emailEl.textContent = user.email;
    if (joinedEl) {
      const d = new Date(user.createdAt);
      joinedEl.textContent = 'Member since ' + d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    // Stats
    const stats = Storage.getAggregateStats(user.id);
    const bestWpm = document.getElementById('dash-best-wpm');
    const avgWpm = document.getElementById('dash-avg-wpm');
    const avgAcc = document.getElementById('dash-avg-acc');
    const totalTests = document.getElementById('dash-total-tests');
    if (bestWpm) bestWpm.textContent = stats.bestWpm;
    if (avgWpm) avgWpm.textContent = stats.avgWpm;
    if (avgAcc) avgAcc.textContent = stats.avgAccuracy + '%';
    if (totalTests) totalTests.textContent = stats.totalTests;

    // Recent tests
    const recentList = document.getElementById('dash-recent-list');
    if (recentList) {
      const scores = Storage.getScores(user.id);
      recentList.innerHTML = '';
      if (scores.length === 0) {
        recentList.innerHTML = '<p class="dash-empty">No tests completed yet. Start typing!</p>';
      } else {
        scores.slice(0, 5).forEach(score => {
          const item = document.createElement('div');
          item.className = 'history-item';
          const d = new Date(score.date);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          item.innerHTML = `
            <div class="history-item__wpm">${score.wpm || 0}</div>
            <div class="history-item__details">
              <div style="color:var(--text-bright);font-weight:500;">WPM</div>
              <div>${dateStr} ${timeStr} · ${score.mode || 'time'} ${score.duration || 30}s</div>
            </div>
            <div class="history-item__accuracy">${score.accuracy || 0}%</div>`;
          recentList.appendChild(item);
        });
      }
    }

    // Dashboard start test button (use onclick to avoid listener leak)
    const dashStartBtn = document.getElementById('dash-start-test');
    if (dashStartBtn) {
      dashStartBtn.onclick = () => {
        _startNewTest();
        UI.showScreen('typing');
      };
    }
    // NOTE: Dashboard navigation listeners are set up once in _setupNavigationListeners
    // No additional listeners should be added here to avoid leaks
  }

  // ==========================================
  // State Change Handler
  // ==========================================
  function _onStateChange(state, changedKeys) {
    if (changedKeys.includes('status')) {
      if (state.status === 'completed') _onTestComplete();
    }
    if (changedKeys.includes('currentIndex')) {
      UI.highlightActive(state.currentIndex.word, state.currentIndex.char);
      UI.scrollActiveWordIntoView(state.currentIndex.word);
    }
    if (state.status === 'typing' && changedKeys.includes('keystrokes')) {
      const elapsed = (performance.now() - state.startTime) / 1000;
      const stats = Engine.calculateStats(state, elapsed);
      UI.updateStats(stats.finalWpm, stats.finalRawWpm, stats.finalAccuracy);
    }
    if (changedKeys.includes('timeLeft') && state.mode === 'time') {
      UI.updateTimer(state.timeLeft, state.selectedDuration);
    }
  }

  // ==========================================
  // Navigation
  // ==========================================
  function _setupNavigationListeners() {
    document.querySelectorAll('[data-screen]').forEach(btn => {
      btn.addEventListener('click', () => {
        const screen = btn.dataset.screen;
        const state = AppState.getState();

        if (!state.user && screen !== 'login' && screen !== 'register') {
          UI.showScreen('login');
          return;
        }
        if (screen === 'history') UI.renderHistory();
        if (screen === 'dashboard') _renderDashboard(state.user);
        if (screen === 'typing' && state.status !== 'typing' && state.status !== 'completed') {
          _startNewTest();
        }
        UI.showScreen(screen);
      });
    });

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      _startNewTest();
      UI.showScreen('typing');
    });
    document.getElementById('btn-view-history')?.addEventListener('click', () => {
      UI.renderHistory();
      UI.showScreen('history');
    });
    document.getElementById('btn-back-typing')?.addEventListener('click', () => {
      _startNewTest();
      UI.showScreen('typing');
    });
    document.getElementById('btn-logo')?.addEventListener('click', (e) => {
      e.preventDefault();
      const state = AppState.getState();
      if (state.user) {
        UI.showScreen('dashboard');
      }
    });
  }

  // ==========================================
  // Mode Selection
  // ==========================================
  function _setupModeListeners() {
    const timeOpts = document.querySelector('.mode-options-time');
    const wordOpts = document.querySelector('.mode-options-words');

    document.querySelectorAll('.mode-bar__btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        const state = AppState.getState();
        AppState.setState({ mode });
        UI.setActiveMode(mode);
        if (state.user) Storage.updateSettings(state.user.id, { mode });
        if (mode === 'time') { timeOpts?.classList.remove('hidden'); wordOpts?.classList.add('hidden'); }
        else { timeOpts?.classList.add('hidden'); wordOpts?.classList.remove('hidden'); }
        _startNewTest();
      });
    });

    document.querySelectorAll('.mode-bar__btn[data-duration]').forEach(btn => {
      btn.addEventListener('click', () => {
        const duration = parseInt(btn.dataset.duration);
        const state = AppState.getState();
        AppState.setState({ selectedDuration: duration });
        UI.setActiveDuration(duration);
        if (state.user) Storage.updateSettings(state.user.id, { duration });
        const customInput = document.getElementById('custom-duration');
        if (customInput) customInput.value = '';
        _startNewTest();
      });
    });

    const customDuration = document.getElementById('custom-duration');
    if (customDuration) {
      customDuration.addEventListener('change', () => {
        const val = parseInt(customDuration.value);
        const state = AppState.getState();
        if (val >= 5 && val <= 300) {
          document.querySelectorAll('.mode-bar__btn[data-duration]').forEach(b => b.classList.remove('mode-bar__btn--active'));
          AppState.setState({ selectedDuration: val });
          UI.setActiveDuration(null);
          if (state.user) Storage.updateSettings(state.user.id, { duration: val });
          _startNewTest();
        }
      });
      customDuration.addEventListener('keydown', (e) => { if (e.key === 'Enter') customDuration.blur(); });
    }

    document.querySelectorAll('.mode-bar__btn[data-wordcount]').forEach(btn => {
      btn.addEventListener('click', () => {
        const count = parseInt(btn.dataset.wordcount);
        const state = AppState.getState();
        AppState.setState({ selectedWordCount: count });
        UI.setActiveWordCount(count);
        if (state.user) Storage.updateSettings(state.user.id, { wordCount: count });
        const customInput = document.getElementById('custom-wordcount');
        if (customInput) customInput.value = '';
        _startNewTest();
      });
    });

    const customWordcount = document.getElementById('custom-wordcount');
    if (customWordcount) {
      customWordcount.addEventListener('change', () => {
        const val = parseInt(customWordcount.value);
        const state = AppState.getState();
        if (val >= 5 && val <= 500) {
          document.querySelectorAll('.mode-bar__btn[data-wordcount]').forEach(b => b.classList.remove('mode-bar__btn--active'));
          AppState.setState({ selectedWordCount: val });
          UI.setActiveWordCount(null);
          if (state.user) Storage.updateSettings(state.user.id, { wordCount: val });
          _startNewTest();
        }
      });
      customWordcount.addEventListener('keydown', (e) => { if (e.key === 'Enter') customWordcount.blur(); });
    }
  }

  // ==========================================
  // Themes
  // ==========================================
  function _setupThemeListeners() {
    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        UI.applyTheme(opt.dataset.theme);
        const state = AppState.getState();
        if (state.user) Storage.updateSettings(state.user.id, { theme: opt.dataset.theme });
      });
    });
  }

  // ==========================================
  // Keyboard Input
  // ==========================================
  function _setupKeyboardListeners() {
    document.addEventListener('keydown', _handleKeyDown);
  }

  function _setupTypingAreaListeners() {
    document.getElementById('typing-area')?.addEventListener('click', function() { this.focus(); });
  }

  function _handleKeyDown(event) {
    const state = AppState.getState();
    if (!state.user) return;

    if (state.status === 'completed') {
      if (event.key === 'Tab' || event.key === 'Enter') {
        event.preventDefault();
        _startNewTest();
        UI.showScreen('typing');
      }
      return;
    }

    if (event.key === 'Escape') {
      if (state.status !== 'typing') {
        _startNewTest();
        UI.showScreen('typing');
      }
      return;
    }

    if (state.status === 'idle') {
      Engine.startTest();
      UI.startTimer();
      _startTimer();
    }

    const result = Engine.handleKey(event);
    if (result.type === 'ignore') return;

    if (result.type === 'restart') {
      event.preventDefault();
      _startNewTest();
      return;
    }

    const freshState = AppState.getState();

    if (result.type === 'space') {
      UI.highlightActive(freshState.currentIndex.word, freshState.currentIndex.char);
    }
    if (result.type === 'correct') {
      UI.updateCharStatus(freshState.currentIndex.word, freshState.currentIndex.char - 1, 'correct');
    }
    if (result.type === 'incorrect') {
      UI.updateCharStatus(freshState.currentIndex.word, freshState.currentIndex.char - 1, 'incorrect');
      UI.flashError();
    }
    if (result.type === 'backspace') {
      UI.updateCharStatus(freshState.currentIndex.word, freshState.currentIndex.char, '');
      UI.highlightActive(freshState.currentIndex.word, freshState.currentIndex.char);
    }
  }

  // ==========================================
  // Test Lifecycle
  // ==========================================
  function _startNewTest() {
    _stopTimer();
    const state = AppState.getState();
    let words;
    if (state.mode === 'words') {
      words = Engine.generateWords(state.selectedWordCount + 10);
    } else {
      words = Engine.generateWords(200);
    }
    Engine.initTest(words);
    UI.renderTypingText(words);
    UI.setActiveMode(state.mode);
    if (state.mode === 'time') {
      UI.setActiveDuration(state.selectedDuration);
      UI.updateTimer(state.selectedDuration, state.selectedDuration);
    } else {
      UI.updateTimer(0, 0);
    }
    UI.updateStats(0, 0, 100);
    UI.setCaretTyping(false);
    const typingArea = document.getElementById('typing-area');
    if (typingArea) { typingArea.setAttribute('tabindex', '-1'); typingArea.focus(); }
  }

  function _startTimer() {
    _stopTimer();
    _timerInterval = setInterval(() => Engine.tick(), 250);
  }

  function _stopTimer() {
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  }

  function _onTestComplete() {
    _stopTimer();
    UI.setCaretTyping(false);
    const state = AppState.getState();
    const stats = { finalWpm: state.finalWpm || 0, finalRawWpm: state.finalRawWpm || 0, finalAccuracy: state.finalAccuracy || 100 };

    if (state.user) {
      Storage.addScore(state.user.id, {
        wpm: stats.finalWpm, rawWpm: stats.finalRawWpm, accuracy: stats.finalAccuracy,
        mode: state.mode, duration: state.mode === 'time' ? state.selectedDuration : state.selectedWordCount,
        wordsTyped: state.currentIndex.word
      });
    }

    const settings = state.user ? Storage.getSettings(state.user.id) : { theme: 'cyberpunk' };
    const colors = { cyberpunk: { line: '#00f0ff', fill: 'rgba(0,240,255,0.1)' }, nord: { line: '#88c0d0', fill: 'rgba(136,192,208,0.1)' }, oled: { line: '#e0e0e0', fill: 'rgba(224,224,224,0.08)' }, forest: { line: '#a3c9a8', fill: 'rgba(163,201,168,0.1)' } };
    const themeColors = colors[settings.theme] || colors.cyberpunk;

    setTimeout(() => {
      const canvas = document.getElementById('results-chart');
      if (canvas) { Chart.init(canvas); Chart.render(state.timeline, themeColors.line, themeColors.fill); }
    }, 300);

    UI.showResults(stats);
  }

  return { boot };
})();

document.addEventListener('DOMContentLoaded', () => App.boot());
export default App;
