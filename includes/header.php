<!DOCTYPE html>
<html lang="en" data-theme="cyberpunk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle ?? 'TypeFlow') ?> — TypeFlow</title>
  <meta name="description" content="Measure, analyze, and improve your typing speed and accuracy.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/themes.css">
  <link rel="stylesheet" href="css/main.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect rx='16' width='100' height='100' fill='%23f0e600'/><text x='50' y='68' font-size='55' text-anchor='middle' fill='%230b0e14' font-weight='bold' font-family='monospace'>T</text></svg>">
</head>
<body>
<div id="app">

<?php if (isset($showHeader) && $showHeader): ?>
  <header class="header" id="app-header">
    <a href="index.php" class="header__logo">
      <span class="header__logo-icon">T</span>
      TypeFlow
    </a>
    <div class="header__actions">
      <a href="leaderboard.php" class="btn btn--ghost btn--small">Leaderboard</a>
      <?php if (isset($isGuest) && $isGuest): ?>
        <a href="login.php" class="btn btn--ghost btn--small">Sign In</a>
        <a href="register.php" class="btn btn--primary btn--small">Register</a>
      <?php else: ?>
        <a href="dashboard.php" class="btn btn--ghost btn--small">Dashboard</a>
        <a href="history.php" class="btn btn--ghost btn--small">History</a>
        <a href="settings.php" class="btn btn--ghost btn--small">Settings</a>
        <a href="logout.php" class="btn btn--ghost btn--small">Logout</a>
      <?php endif; ?>
    </div>
  </header>
<?php endif; ?>
