<?php
/**
 * history.php - Full Test History Page
 * Shows all past test results with aggregate stats.
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/session.php';
requireAuth();

$user = getAuthUser();

$pageTitle = 'History';
$showHeader = true;

include __DIR__ . '/includes/header.php';
?>

<div class="screen screen--active" id="screen-history">
  <div class="history-section">
    <div class="history-section__title">Your History</div>

    <div class="history-stats">
      <div class="history-stat-card"><div class="history-stat-card__value" id="history-total">—</div><div class="history-stat-card__label">Total Tests</div></div>
      <div class="history-stat-card"><div class="history-stat-card__value" id="history-best">—</div><div class="history-stat-card__label">Best WPM</div></div>
      <div class="history-stat-card"><div class="history-stat-card__value" id="history-avg">—</div><div class="history-stat-card__label">Average WPM</div></div>
    </div>

    <div class="history-list" id="history-list">
      <p style="text-align:center;color:var(--text-dim);padding:40px 0;">Loading...</p>
    </div>

    <div style="margin-top:var(--gap-xl);text-align:center;">
      <a href="typing.php" class="btn btn--primary">Start New Test</a>
      <a href="dashboard.php" class="btn" style="margin-left:8px;">Dashboard</a>
      <a href="settings.php" class="btn" style="margin-left:8px;">Settings</a>
    </div>
  </div>
</div>

<script type="module">
const userId = <?= json_encode($user['id']) ?>;

async function loadStats() {
  try {
    const res = await fetch(`api/get_stats.php?user_id=${userId}`);
    const data = await res.json();
    if (data.success) {
      document.getElementById('history-total').textContent = data.stats.totalTests;
      document.getElementById('history-best').textContent = data.stats.bestWpm;
      document.getElementById('history-avg').textContent = data.stats.avgWpm;
    }
  } catch (e) { /* ignore */ }
}

async function loadScores() {
  try {
    const res = await fetch(`api/get_scores.php?user_id=${userId}&limit=50`);
    const data = await res.json();
    const list = document.getElementById('history-list');

    if (!data.success || data.scores.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:var(--text-dim);padding:40px 0;">No tests completed yet. Start typing!</p>';
      return;
    }

    list.innerHTML = '';
    data.scores.forEach(score => {
      const item = document.createElement('div');
      item.className = 'history-item';
      const d = new Date(score.date);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const modeLabel = score.mode === 'time' ? score.duration + 's' : score.duration + 'w';
      item.innerHTML = `
        <div class="history-item__wpm">${score.wpm}</div>
        <div class="history-item__details">
          <div style="color:var(--text-bright);font-weight:500;">WPM</div>
          <div>${dateStr} ${timeStr} · ${modeLabel} · ${score.words_typed || 0} words</div>
        </div>
        <div class="history-item__accuracy">${score.accuracy}%</div>`;
      list.appendChild(item);
    });
  } catch (e) { /* ignore */ }
}

loadStats();
loadScores();
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
