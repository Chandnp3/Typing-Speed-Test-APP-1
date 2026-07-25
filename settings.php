<?php
/**
 * settings.php - User Settings Page
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/session.php';
requireAuth();

$user = getAuthUser();

$pageTitle = 'Settings';
$showHeader = true;

include __DIR__ . '/includes/header.php';
?>

<div class="screen screen--active" id="screen-settings">
  <div class="settings-panel">
    <div class="settings-panel__title">Settings</div>

    <div style="margin-top:var(--gap-xl);">
      <a href="dashboard.php" class="btn" style="width:100%;justify-content:center;display:flex;">Back to Dashboard</a>
    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
