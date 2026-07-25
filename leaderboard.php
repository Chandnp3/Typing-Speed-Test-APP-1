<?php
/**
 * leaderboard.php - Public Leaderboard Page
 * Shows top 50 fastest typists, separate boards for time/words modes.
 * Accessible to everyone (guests + logged-in users).
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/session.php';

// No auth required — this page is public
$user = getAuthUser();
$isGuest = !$user;

$pageTitle = 'Leaderboard';
$showHeader = true;

include __DIR__ . '/includes/header.php';
?>

<div class="screen screen--active" id="screen-leaderboard">
  <div class="leaderboard">
    <div class="leaderboard__header">
      <h1 class="leaderboard__title">Leaderboard</h1>
      <p class="leaderboard__subtitle">Top 50 fastest typists</p>
    </div>

    <?php if (!$isGuest): ?>
    <!-- Your Rank Card -->
    <div class="leaderboard__myrank" id="my-rank-card" style="display:none;">
      <div class="leaderboard__myrank-inner">
        <div class="leaderboard__myrank-badge" id="my-rank-badge">#—</div>
        <div class="leaderboard__myrank-info">
          <div class="leaderboard__myrank-label">Your Rank</div>
          <div class="leaderboard__myrank-stats">
            <span id="my-rank-wpm" class="leaderboard__myrank-stat">— WPM</span>
            <span class="leaderboard__myrank-divider">·</span>
            <span id="my-rank-acc" class="leaderboard__myrank-stat">—% acc</span>
            <span class="leaderboard__myrank-divider">·</span>
            <span id="my-rank-tests" class="leaderboard__myrank-stat">— tests</span>
          </div>
        </div>
        <div class="leaderboard__myrank-avatar" id="my-rank-avatar"></div>
      </div>
    </div>
    <?php endif; ?>

    <!-- Mode Tabs -->
    <div class="leaderboard__tabs">
      <button class="leaderboard__tab leaderboard__tab--active" data-board="time">Time Mode</button>
      <button class="leaderboard__tab" data-board="words">Words Mode</button>
    </div>

    <!-- Time Mode Board -->
    <div class="leaderboard__board" id="board-time">
      <div class="leaderboard__table-wrapper">
        <table class="leaderboard__table">
          <thead>
            <tr>
              <th class="leaderboard__th leaderboard__th--rank">#</th>
              <th class="leaderboard__th leaderboard__th--user">Typist</th>
              <th class="leaderboard__th leaderboard__th--wpm">Best WPM</th>
              <th class="leaderboard__th leaderboard__th--acc">Accuracy</th>
              <th class="leaderboard__th leaderboard__th--tests">Tests</th>
            </tr>
          </thead>
          <tbody id="leaderboard-time-body">
            <tr><td colspan="5" class="leaderboard__loading">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Words Mode Board -->
    <div class="leaderboard__board" id="board-words" style="display:none;">
      <div class="leaderboard__table-wrapper">
        <table class="leaderboard__table">
          <thead>
            <tr>
              <th class="leaderboard__th leaderboard__th--rank">#</th>
              <th class="leaderboard__th leaderboard__th--user">Typist</th>
              <th class="leaderboard__th leaderboard__th--wpm">Best WPM</th>
              <th class="leaderboard__th leaderboard__th--acc">Accuracy</th>
              <th class="leaderboard__th leaderboard__th--tests">Tests</th>
            </tr>
          </thead>
          <tbody id="leaderboard-words-body">
            <tr><td colspan="5" class="leaderboard__loading">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <?php if ($isGuest): ?>
    <div class="leaderboard__cta">
      <p>Want to climb the ranks?</p>
      <a href="register.php" class="btn btn--primary">Create Free Account</a>
      <a href="login.php" class="btn btn--ghost" style="margin-left:8px;">Sign In</a>
    </div>
    <?php endif; ?>
  </div>
</div>

<script type="module">
// ---- Constants ----
const currentUserId = <?= json_encode($user['id'] ?? null) ?>;

// ---- Leaderboard Data Cache ----
const cache = { time: null, words: null };
const rankCache = { time: null, words: null };

// ---- Fetch Leaderboard ----
async function loadBoard(mode) {
  if (cache[mode]) return cache[mode];

  try {
    const url = currentUserId
      ? `api/get_leaderboard.php?mode=${mode}&limit=50&user_id=${currentUserId}`
      : `api/get_leaderboard.php?mode=${mode}&limit=50`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      cache[mode] = data.leaderboard;
      rankCache[mode] = { my_rank: data.my_rank, my_stats: data.my_stats, total_users: data.total_users || 0 };
      return data.leaderboard;
    }
  } catch (e) { /* ignore */ }
  return [];
}

// ---- Render Board ----
function renderBoard(mode, entries) {
  const tbody = document.getElementById(`leaderboard-${mode}-body`);
  if (!tbody) return;

  if (entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="leaderboard__empty">No rankings yet. Be the first!</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  entries.forEach(entry => {
    const tr = document.createElement('tr');
    tr.className = 'leaderboard__row';

    if (entry.rank <= 3) {
      tr.classList.add(`leaderboard__row--top${entry.rank}`);
    }

    if (currentUserId && entry.user_id === currentUserId) {
      tr.classList.add('leaderboard__row--me');
    }

    const rankDisplay = entry.rank <= 3
      ? ['🥇', '🥈', '🥉'][entry.rank - 1]
      : entry.rank;

    tr.innerHTML = `
      <td class="leaderboard__td leaderboard__td--rank">${rankDisplay}</td>
      <td class="leaderboard__td leaderboard__td--user">
        <span class="leaderboard__avatar">${entry.avatar}</span>
        <span class="leaderboard__name">${escapeHtml(entry.nickname)}</span>
      </td>
      <td class="leaderboard__td leaderboard__td--wpm">${entry.best_wpm}</td>
      <td class="leaderboard__td leaderboard__td--acc">${entry.best_accuracy}%</td>
      <td class="leaderboard__td leaderboard__td--tests">${entry.tests_count}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- Render Your Rank Card ----
function renderMyRank(mode) {
  const card = document.getElementById('my-rank-card');
  if (!card) return;

  const rankData = rankCache[mode];
  if (!rankData || !rankData.my_rank) {
    card.style.display = 'none';
    return;
  }

  card.style.display = '';

  // Calculate percentile
  const totalUsers = rankData.total_users || 1;
  const percentile = Math.round(((rankData.my_rank - 1) / totalUsers) * 100);
  const percentileLabel = percentile <= 1 ? 'Top 1%' : percentile <= 5 ? 'Top 5%' : percentile <= 10 ? 'Top 10%' : `Top ${percentile}%`;

  const badge = document.getElementById('my-rank-badge');
  badge.innerHTML = `<span class="leaderboard__myrank-badge-text">#${rankData.my_rank}</span><span class="leaderboard__myrank-badge-tooltip">${percentileLabel}</span>`;

  document.getElementById('my-rank-wpm').textContent = `${rankData.my_stats.best_wpm} WPM`;
  document.getElementById('my-rank-acc').textContent = `${rankData.my_stats.best_accuracy}% acc`;
  document.getElementById('my-rank-tests').textContent = `${rankData.my_stats.tests_count} tests`;
  document.getElementById('my-rank-avatar').textContent = <?= json_encode($user['avatar'] ?? '🧑‍💻') ?>;
}

// ---- HTML Escape ----
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Tab Switching ----
let currentMode = 'time';

document.querySelectorAll('.leaderboard__tab').forEach(tab => {
  tab.addEventListener('click', async () => {
    const mode = tab.dataset.board;
    currentMode = mode;

    document.querySelectorAll('.leaderboard__tab').forEach(t => t.classList.remove('leaderboard__tab--active'));
    tab.classList.add('leaderboard__tab--active');

    document.querySelectorAll('.leaderboard__board').forEach(b => b.style.display = 'none');
    document.getElementById(`board-${mode}`).style.display = '';

    const entries = await loadBoard(mode);
    renderBoard(mode, entries);
    renderMyRank(mode);
  });
});

// ---- Initial Load ----
async function init() {
  const entries = await loadBoard('time');
  renderBoard('time', entries);
  renderMyRank('time');
}

init();
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
