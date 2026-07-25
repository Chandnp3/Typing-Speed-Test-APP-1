<?php
/**
 * typing.php - Typing Test Page
 * Supports both guest mode (no login) and logged-in users.
 * Guests get 3 free tests before being prompted to sign up.
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/session.php';

// Allow guest access — no requireAuth() here
$user = getAuthUser();
$isGuest = !$user;

// Load settings for logged-in users
$settings = [];
if ($user) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM settings WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $settings = $stmt->fetch() ?: [];
}
$mode = $settings['mode'] ?? 'time';
$duration = $settings['duration'] ?? 30;
$wordCount = $settings['word_count'] ?? 25;

$pageTitle = 'Typing Test';
$showHeader = true;

include __DIR__ . '/includes/header.php';
?>

<div class="screen screen--active" id="screen-typing">
  <div class="typing-screen">
    <div class="mode-bar">
      <div class="mode-bar__group">
        <button class="mode-bar__btn <?= $mode === 'time' ? 'mode-bar__btn--active' : '' ?>" data-mode="time">time</button>
        <button class="mode-bar__btn <?= $mode === 'words' ? 'mode-bar__btn--active' : '' ?>" data-mode="words">words</button>
      </div>
      <span class="mode-bar__label">·</span>
      <div class="mode-bar__group">
        <button class="mode-bar__btn" data-difficulty="easy">easy</button>
        <button class="mode-bar__btn mode-bar__btn--active" data-difficulty="normal">normal</button>
        <button class="mode-bar__btn" data-difficulty="hard">hard</button>
      </div>
      <span class="mode-bar__label">·</span>
      <div class="mode-bar__group mode-options-time">
        <button class="mode-bar__btn" data-duration="15">15</button>
        <button class="mode-bar__btn mode-bar__btn--active" data-duration="30">30</button>
        <button class="mode-bar__btn" data-duration="60">60</button>
        <button class="mode-bar__btn" data-duration="120">120</button>
        <div class="custom-input-wrapper">
          <input type="number" class="custom-input" id="custom-duration" min="5" max="300" placeholder="…" title="Custom time in seconds">
          <span class="custom-input-label">s</span>
        </div>
      </div>
      <div class="mode-bar__group mode-options-words <?= $mode === 'words' ? '' : 'hidden' ?>">
        <button class="mode-bar__btn" data-wordcount="10">10</button>
        <button class="mode-bar__btn mode-bar__btn--active" data-wordcount="25">25</button>
        <button class="mode-bar__btn" data-wordcount="50">50</button>
        <button class="mode-bar__btn" data-wordcount="100">100</button>
        <div class="custom-input-wrapper">
          <input type="number" class="custom-input" id="custom-wordcount" min="5" max="500" placeholder="…" title="Custom word count">
          <span class="custom-input-label">w</span>
        </div>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat"><div class="stat__value" id="stat-wpm">0</div><div class="stat__label">wpm</div></div>
      <div class="stat"><div class="stat__value" id="stat-raw">0</div><div class="stat__label">raw</div></div>
      <div class="stat"><div class="stat__value" id="stat-accuracy">100%</div><div class="stat__label">accuracy</div></div>
    </div>

    <div class="timer-bar"><div class="timer-bar__fill" id="timer-fill"></div></div>

    <div class="typing-area" id="typing-area" tabindex="-1">
      <div class="typing-text" id="typing-text"></div>
    </div>

    <div class="prompt-hint">
      Press <kbd>Tab</kbd> or <kbd>Esc</kbd> to restart · <kbd>Space</kbd> to move to next word
      <?php if ($isGuest): ?>
        · <span style="color:var(--accent);font-weight:500;" id="guest-counter-label">3 free tests remaining</span>
      <?php endif; ?>
    </div>
  </div>

  <!-- Results Overlay (hidden by default) -->
  <div class="results-overlay" id="results-overlay" style="display:none;">
    <div class="results-card">
      <div class="results-card__title">Test Complete</div>
      <div class="results__metrics">
        <div><div class="results__metric-value" id="results-wpm">0</div><div class="results__metric-label">WPM</div></div>
        <div><div class="results__metric-value" id="results-raw">0</div><div class="results__metric-label">Raw</div></div>
        <div><div class="results__metric-value" id="results-accuracy">0%</div><div class="results__metric-label">Accuracy</div></div>
      </div>
      <div class="results__chart"><canvas id="results-chart" style="width:100%;height:180px;"></canvas></div>
      <div class="results__actions">
        <button class="btn btn--primary" id="btn-restart">Try Again</button>
        <a href="history.php" class="btn">View History</a>
        <a href="dashboard.php" class="btn">Dashboard</a>
      </div>
    </div>
  </div>

  <!-- Guest Floating Auth Card (hidden by default) -->
  <div class="auth-float-overlay" id="auth-float-overlay" style="display:none;">
    <div class="auth-float-card" id="auth-float-card">
      <div class="auth-float-card__handle"></div>
      <div class="auth-float-card__content">
        <!-- Login Form -->
        <div id="auth-float-login">
          <div class="auth-float-card__title">📝 You've used all free tests!</div>
          <div class="auth-float-card__subtitle">Sign in to save your progress and unlock unlimited tests.</div>
          <div class="auth-error auth-error--compact" id="auth-float-error"></div>
          <form id="auth-float-form" class="auth-form">
            <input type="email" class="auth-input" id="auth-float-email" placeholder="Email" required autocomplete="email">
            <input type="password" class="auth-input" id="auth-float-password" placeholder="Password" required autocomplete="current-password" style="margin-top:8px;">
            <button type="submit" class="btn btn--primary auth-submit" id="auth-float-submit">Sign In</button>
          </form>
          <div class="auth-switch" style="margin-top:12px;">
            New here? <span id="auth-float-to-register" class="auth-link">Create Account</span>
          </div>
        </div>
        <!-- Register Form (hidden) -->
        <div id="auth-float-register" style="display:none;">
          <div class="auth-float-card__title">🚀 Create Free Account</div>
          <div class="auth-float-card__subtitle">Your guest test results will be imported automatically!</div>
          <div class="auth-error auth-error--compact" id="auth-float-reg-error"></div>
          <form id="auth-float-reg-form" class="auth-form">
            <input type="text" class="auth-input" id="auth-float-nickname" placeholder="Display name" maxlength="20" required autocomplete="username">
            <input type="email" class="auth-input" id="auth-float-reg-email" placeholder="Email" required autocomplete="email" style="margin-top:8px;">
            <input type="password" class="auth-input" id="auth-float-reg-password" placeholder="Password (min 6 chars)" minlength="6" required autocomplete="new-password" style="margin-top:8px;">
            <div class="auth-avatars auth-avatars--compact" id="auth-float-avatars">
              <button type="button" class="avatar-option avatar-option--selected" data-emoji="🧑‍💻">🧑‍💻</button>
              <button type="button" class="avatar-option" data-emoji="👩‍💻">👩‍💻</button>
              <button type="button" class="avatar-option" data-emoji="🎮">🎮</button>
              <button type="button" class="avatar-option" data-emoji="🚀">🚀</button>
              <button type="button" class="avatar-option" data-emoji="⚡">⚡</button>
            </div>
            <button type="submit" class="btn btn--primary auth-submit" id="auth-float-reg-submit">Create Account</button>
          </form>
          <div class="auth-switch" style="margin-top:12px;">
            Already have an account? <span id="auth-float-to-login" class="auth-link">Sign In</span>
          </div>
        </div>
        <button class="auth-float-card__close" id="auth-float-close" title="Continue as guest (results won't be saved)">✕</button>
      </div>
    </div>
  </div>
</div>

<script type="module">
import AppState from './js/state.js';
import Engine from './js/engine.js';
import UI from './js/ui.js';
import Chart from './js/chart.js';

// ---- Keypress Sound (Web Audio API) ----
let _audioCtx = null;
function playKeySound() {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.frequency.setValueAtTime(800, _audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, _audioCtx.currentTime + 0.04);
    osc.type = 'square';
    gain.gain.setValueAtTime(0.12, _audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.06);
    osc.start(_audioCtx.currentTime);
    osc.stop(_audioCtx.currentTime + 0.06);
  } catch { _audioCtx = null; }
}

// ---- Difficulty State ----
let currentDifficulty = 'normal';

// ---- Guest Mode Setup ----
const IS_GUEST = <?= json_encode($isGuest) ?>;
const userId = <?= json_encode($user['id'] ?? null) ?>;
const GUEST_LIMIT = 3;
const GUEST_STORAGE_KEY = 'typeflow_guest';

function getGuestData() {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { count: 0, scores: [] };
  } catch { return { count: 0, scores: [] }; }
}

function saveGuestData(data) {
  try { localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function incrementGuestCounter() {
  if (!IS_GUEST) return;
  const data = getGuestData();
  data.count++;
  saveGuestData(data);
  updateGuestLabel();
}

function getGuestTestCount() {
  return IS_GUEST ? getGuestData().count : 999;
}

function isGuestBlocked() {
  return IS_GUEST && getGuestTestCount() >= GUEST_LIMIT;
}

function updateGuestLabel() {
  const label = document.getElementById('guest-counter-label');
  if (!label) return;
  const remaining = Math.max(0, GUEST_LIMIT - getGuestTestCount());
  if (remaining > 0) {
    label.textContent = `${remaining} free test${remaining !== 1 ? 's' : ''} remaining`;
  } else {
    label.textContent = 'Sign in to continue testing';
  }
}

// ---- Floating Auth Card ----
function showAuthFloat() {
  document.getElementById('auth-float-overlay').style.display = 'flex';
  switchAuthMode('login');
  // Clear any previous error messages
  const loginErr = document.getElementById('auth-float-error');
  if (loginErr) { loginErr.textContent = ''; loginErr.classList.remove('auth-error--visible'); }
  const regErr = document.getElementById('auth-float-reg-error');
  if (regErr) { regErr.textContent = ''; regErr.classList.remove('auth-error--visible'); }
}

function hideAuthFloat() {
  document.getElementById('auth-float-overlay').style.display = 'none';
}

function switchAuthMode(mode) {
  document.getElementById('auth-float-login').style.display = mode === 'login' ? '' : 'none';
  document.getElementById('auth-float-register').style.display = mode === 'register' ? '' : 'none';
}

// Avatar selection in floating card
document.querySelectorAll('#auth-float-avatars .avatar-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('#auth-float-avatars .avatar-option').forEach(o => o.classList.remove('avatar-option--selected'));
    opt.classList.add('avatar-option--selected');
  });
});

// Toggle between login/register
document.getElementById('auth-float-to-register')?.addEventListener('click', (e) => {
  e.preventDefault();
  switchAuthMode('register');
});
document.getElementById('auth-float-to-login')?.addEventListener('click', (e) => {
  e.preventDefault();
  switchAuthMode('login');
});

// Close button
document.getElementById('auth-float-close')?.addEventListener('click', hideAuthFloat);

// Click overlay to close
document.getElementById('auth-float-overlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) hideAuthFloat();
});

// ---- Auth Form Submissions ----
async function handleGuestAuth(endpoint, body) {
  const submitBtn = endpoint.includes('register') ? 'auth-float-reg-submit' : 'auth-float-submit';
  const errorEl = document.getElementById(endpoint.includes('register') ? 'auth-float-reg-error' : 'auth-float-error');
  const btn = document.getElementById(submitBtn);

  try {
    btn.disabled = true;
    btn.textContent = 'Please wait...';

    // Include guest data for migration
    const guestData = getGuestData();
    if (guestData.scores.length > 0) {
      body.guest_scores = guestData.scores;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (data.success) {
      // Clear guest data after successful migration
      try { localStorage.removeItem(GUEST_STORAGE_KEY); } catch {}
      
      // Redirect to typing page as logged-in user
      window.location.href = 'typing.php';
    } else {
      errorEl.textContent = data.details || data.error || 'Something went wrong.';
      errorEl.classList.add('auth-error--visible');
      btn.disabled = false;
      btn.textContent = endpoint.includes('register') ? 'Create Account' : 'Sign In';
    }
  } catch (err) {
    errorEl.textContent = 'Connection error. Please try again.';
    errorEl.classList.add('auth-error--visible');
    btn.disabled = false;
    btn.textContent = endpoint.includes('register') ? 'Create Account' : 'Sign In';
  }
}

document.getElementById('auth-float-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-float-email')?.value.trim();
  const password = document.getElementById('auth-float-password')?.value;
  if (!email || !password) {
    document.getElementById('auth-float-error').textContent = 'Please fill in all fields.';
    document.getElementById('auth-float-error').classList.add('auth-error--visible');
    return;
  }
  handleGuestAuth('api/login.php', { email, password });
});

document.getElementById('auth-float-reg-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const nickname = document.getElementById('auth-float-nickname')?.value.trim();
  const email = document.getElementById('auth-float-reg-email')?.value.trim();
  const password = document.getElementById('auth-float-reg-password')?.value;
  const selectedAvatar = document.querySelector('#auth-float-avatars .avatar-option--selected');
  const avatar = selectedAvatar ? selectedAvatar.dataset.emoji : '🧑‍💻';
  const errorEl = document.getElementById('auth-float-reg-error');

  if (!nickname || !email || !password) {
    errorEl.textContent = 'Please fill in all fields.';
    errorEl.classList.add('auth-error--visible');
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters.';
    errorEl.classList.add('auth-error--visible');
    return;
  }
  handleGuestAuth('api/register.php', { nickname, email, password, avatar });
});

// ---- Typing Test Engine ----
let timerInterval = null;
let hasSaved = false;

// Initialize UI
UI.init();

// ---- State Change Handler ----
AppState.subscribe((state, changedKeys) => {
  if (changedKeys.includes('status')) {
    if (state.status === 'completed' && !hasSaved) onTestComplete();
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
});

// ---- Start a new test ----
function startNewTest() {
  // Check guest limit before starting
  if (isGuestBlocked()) {
    showAuthFloat();
    return;
  }

  hasSaved = false;
  stopTimer();
  const state = AppState.getState();
  const words = state.mode === 'words'
    ? Engine.generateWords(state.selectedWordCount + 10, currentDifficulty)
    : Engine.generateWords(200, currentDifficulty);
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

  // Hide results overlay
  document.getElementById('results-overlay').style.display = 'none';
  document.getElementById('screen-typing').classList.remove('screen--results');

  const typingArea = document.getElementById('typing-area');
  if (typingArea) { typingArea.setAttribute('tabindex', '-1'); typingArea.focus(); }
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => Engine.tick(), 250);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

async function onTestComplete() {
  hasSaved = true;
  stopTimer();
  UI.setCaretTyping(false);
  const state = AppState.getState();
  const stats = {
    wpm: state.finalWpm || 0,
    rawWpm: state.finalRawWpm || 0,
    accuracy: state.finalAccuracy || 100,
    mode: state.mode,
    duration: state.mode === 'time' ? state.selectedDuration : state.selectedWordCount,
    wordsTyped: state.currentIndex.word
  };

  if (IS_GUEST) {
    // Save to localStorage for guest
    const guestData = getGuestData();
    guestData.scores.push({
      wpm: stats.wpm,
      rawWpm: stats.rawWpm,
      accuracy: stats.accuracy,
      mode: stats.mode,
      duration: stats.duration,
      wordsTyped: stats.wordsTyped,
      date: new Date().toISOString()
    });
    saveGuestData(guestData);
    incrementGuestCounter();
  } else {
    // Save to database for logged-in users
    try {
      const res = await fetch('api/save_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...stats })
      });
    } catch (e) { /* silently fail */ }
  }

  // Show results
  document.getElementById('results-wpm').textContent = stats.wpm;
  document.getElementById('results-raw').textContent = stats.rawWpm;
  document.getElementById('results-accuracy').textContent = stats.accuracy + '%';

  // Render chart
  const canvas = document.getElementById('results-chart');
  if (canvas && state.timeline.length > 1) {
    const colors = { cyberpunk: { line: '#00f0ff', fill: 'rgba(0,240,255,0.1)' } };
    Chart.init(canvas);
    setTimeout(() => Chart.render(state.timeline, colors.cyberpunk.line, colors.cyberpunk.fill), 100);
  }

  document.getElementById('results-overlay').style.display = 'flex';
  document.getElementById('screen-typing').classList.add('screen--results');

  // Show floating auth if guest just hit the limit
  if (IS_GUEST && getGuestTestCount() >= GUEST_LIMIT) {
    // Show auth card over results after 3 tests
    showAuthFloat();
  }
}

// ---- Keyboard Handling ----
document.addEventListener('keydown', (event) => {
  const state = AppState.getState();

  if (state.status === 'completed') {
    if (event.key === 'Tab' || event.key === 'Enter') {
      event.preventDefault();
      startNewTest();
    }
    return;
  }

  if (event.key === 'Escape') {
    if (state.status !== 'typing') startNewTest();
    return;
  }

  // Don't process keys if auth card is open
  const authOverlay = document.getElementById('auth-float-overlay');
  if (authOverlay && authOverlay.style.display === 'flex') return;

  if (state.status === 'idle') {
    // If guest is blocked, show auth on first keypress
    if (isGuestBlocked()) {
      showAuthFloat();
      return;
    }
    Engine.startTest();
    UI.startTimer();
    startTimer();
  }

  const result = Engine.handleKey(event);
  if (result.type === 'ignore') return;

  // Play keypress sound
  playKeySound();

  if (result.type === 'restart') {
    event.preventDefault();
    startNewTest();
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
});

// ---- Difficulty Selection ----
document.querySelectorAll('.mode-bar__btn[data-difficulty]').forEach(btn => {
  btn.addEventListener('click', () => {
    const diff = btn.dataset.difficulty;
    currentDifficulty = diff;
    document.querySelectorAll('.mode-bar__btn[data-difficulty]').forEach(b => b.classList.remove('mode-bar__btn--active'));
    btn.classList.add('mode-bar__btn--active');
    startNewTest();
  });
});

// ---- Mode Selection ----
document.querySelectorAll('.mode-bar__btn[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    AppState.setState({ mode });
    UI.setActiveMode(mode);
    document.querySelector('.mode-options-time')?.classList.toggle('hidden', mode !== 'time');
    document.querySelector('.mode-options-words')?.classList.toggle('hidden', mode === 'time');

    if (!IS_GUEST) {
      fetch('api/update_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, mode })
      }).catch(() => {});
    }

    startNewTest();
  });
});

document.querySelectorAll('.mode-bar__btn[data-duration]').forEach(btn => {
  btn.addEventListener('click', () => {
    const duration = parseInt(btn.dataset.duration);
    AppState.setState({ selectedDuration: duration });
    UI.setActiveDuration(duration);
    document.getElementById('custom-duration').value = '';

    if (!IS_GUEST) {
      fetch('api/update_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, duration })
      }).catch(() => {});
    }

    startNewTest();
  });
});

document.querySelectorAll('.mode-bar__btn[data-wordcount]').forEach(btn => {
  btn.addEventListener('click', () => {
    const count = parseInt(btn.dataset.wordcount);
    AppState.setState({ selectedWordCount: count });
    UI.setActiveWordCount(count);
    document.getElementById('custom-wordcount').value = '';

    if (!IS_GUEST) {
      fetch('api/update_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, word_count: count })
      }).catch(() => {});
    }

    startNewTest();
  });
});

// Custom inputs
const customDuration = document.getElementById('custom-duration');
if (customDuration) {
  customDuration.addEventListener('change', () => {
    const val = parseInt(customDuration.value);
    if (val >= 5 && val <= 300) {
      document.querySelectorAll('.mode-bar__btn[data-duration]').forEach(b => b.classList.remove('mode-bar__btn--active'));
      AppState.setState({ selectedDuration: val });
      UI.setActiveDuration(null);
      if (!IS_GUEST) {
        fetch('api/update_settings.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, duration: val })
        }).catch(() => {});
      }
      startNewTest();
    }
  });
}

const customWordcount = document.getElementById('custom-wordcount');
if (customWordcount) {
  customWordcount.addEventListener('change', () => {
    const val = parseInt(customWordcount.value);
    if (val >= 5 && val <= 500) {
      document.querySelectorAll('.mode-bar__btn[data-wordcount]').forEach(b => b.classList.remove('mode-bar__btn--active'));
      AppState.setState({ selectedWordCount: val });
      UI.setActiveWordCount(null);
      if (!IS_GUEST) {
        fetch('api/update_settings.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, word_count: val })
        }).catch(() => {});
      }
      startNewTest();
    }
  });
}

// Restart button
document.getElementById('btn-restart')?.addEventListener('click', startNewTest);

// Focus typing area on load
document.getElementById('typing-area')?.addEventListener('click', function() { this.focus(); });

// Update guest label on load
updateGuestLabel();

// Start first test
startNewTest();
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
