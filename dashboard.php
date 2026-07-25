<?php
/**
 * dashboard.php - User Dashboard
 * Shows profile, stats, recent tests, and quick actions.
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/session.php';
requireAuth();

$user = getAuthUser();

$pageTitle = 'Dashboard';
$showHeader = true;

include __DIR__ . '/includes/header.php';
?>

<div class="screen screen--active" id="screen-dashboard">
  <div class="dashboard" id="dashboard-root">
    <!-- Profile Header -->
    <div class="dash-profile">
      <div class="dash-profile__avatar" id="dash-avatar"><?= htmlspecialchars($user['avatar'] ?? '🧑‍💻') ?></div>
      <div class="dash-profile__info">
        <div class="dash-profile__name" id="dash-nickname"><?= htmlspecialchars($user['nickname']) ?></div>
        <div class="dash-profile__email" id="dash-email"><?= htmlspecialchars($user['email']) ?></div>
        <div class="dash-profile__joined" id="dash-joined">Member since <?= date('M Y', strtotime($user['created_at'])) ?></div>
      </div>
    </div>

    <!-- Stats Cards (loaded via AJAX) -->
    <div class="dash-stats">
      <div class="dash-stat-card">
        <div class="dash-stat-card__value" id="dash-best-wpm">—</div>
        <div class="dash-stat-card__label">Best WPM</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-card__value" id="dash-avg-wpm">—</div>
        <div class="dash-stat-card__label">Avg WPM</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-card__value" id="dash-avg-acc">—</div>
        <div class="dash-stat-card__label">Avg Accuracy</div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-card__value" id="dash-total-tests">—</div>
        <div class="dash-stat-card__label">Total Tests</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="dash-actions">
      <a href="typing.php" class="dash-action-btn">
        <span class="dash-action-btn__text">Start Typing Test</span>
        <span class="dash-action-btn__arrow">→</span>
      </a>
      <a href="history.php" class="dash-action-btn">
        <span class="dash-action-btn__text">View Full History</span>
        <span class="dash-action-btn__arrow">→</span>
      </a>
      <a href="settings.php" class="dash-action-btn">
        <span class="dash-action-btn__text">Settings</span>
        <span class="dash-action-btn__arrow">→</span>
      </a>
    </div>

    <!-- Recent Tests -->
    <div class="dash-section">
      <div class="dash-section__title">Recent Tests</div>
      <div class="dash-recent" id="dash-recent-list">
        <p class="dash-empty">Loading...</p>
      </div>
    </div>
  </div>
</div>

<script type="module">

const userId = <?= json_encode($user['id']) ?>;

// Load stats
async function loadStats() {
  try {
    const res = await fetch(`api/get_stats.php?user_id=${userId}`);
    const data = await res.json();
    if (data.success) {
      document.getElementById('dash-best-wpm').textContent = data.stats.bestWpm;
      document.getElementById('dash-avg-wpm').textContent = data.stats.avgWpm;
      document.getElementById('dash-avg-acc').textContent = data.stats.avgAccuracy + '%';
      document.getElementById('dash-total-tests').textContent = data.stats.totalTests;
    }
  } catch (e) { /* ignore */ }
}

// Load recent scores
async function loadRecent() {
  try {
    const res = await fetch(`api/get_scores.php?user_id=${userId}&limit=5`);
    const data = await res.json();
    const list = document.getElementById('dash-recent-list');
    if (!data.success || data.scores.length === 0) {
      list.innerHTML = '<p class="dash-empty">No tests completed yet. Start typing!</p>';
      return;
    }
    list.innerHTML = '';
    data.scores.forEach(score => {
      const item = document.createElement('div');
      item.className = 'history-item';
      const d = new Date(score.date);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const modeLabel = score.mode === 'time' ? score.duration + 's' : score.duration + 'w';
      item.innerHTML = `
        <div class="history-item__wpm">${score.wpm}</div>
        <div class="history-item__details">
          <div style="color:var(--text-bright);font-weight:500;">WPM</div>
          <div>${dateStr} ${timeStr} · ${modeLabel}</div>
        </div>
        <div class="history-item__accuracy">${score.accuracy}%</div>`;
      list.appendChild(item);
    });
  } catch (e) { /* ignore */ }
}

loadStats();
loadRecent();
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
