<?php
/**
 * login.php - Login Page
 * Renders login form. Login is done via AJAX to api/login.php.
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/session.php';

redirectIfAuthenticated();

$pageTitle = 'Sign In';
$theme = 'cyberpunk';
$showHeader = false;

include __DIR__ . '/includes/header.php';
?>

<div class="screen screen--active" id="screen-login">
  <div class="auth-card">
    <div class="auth-card__logo">
      <span class="auth-card__logo-icon">T</span>
    </div>
    <div class="auth-card__title">Welcome Back</div>
    <div class="auth-card__subtitle">Sign in to continue your typing journey</div>

    <div class="auth-error" id="login-error"></div>

    <form id="login-form" class="auth-form">
      <div class="auth-field">
        <label class="auth-label" for="login-email">Email</label>
        <input type="email" class="auth-input" id="login-email" placeholder="you@example.com" required autocomplete="email">
      </div>
      <div class="auth-field">
        <label class="auth-label" for="login-password">Password</label>
        <input type="password" class="auth-input" id="login-password" placeholder="Enter your password" required autocomplete="current-password">
      </div>
      <button type="submit" class="btn btn--primary auth-submit">Sign In</button>
    </form>

    <div class="auth-switch">
      Don't have an account? <a href="register.php">Register</a>
    </div>
  </div>
</div>

<!-- Migration notice (hidden by default) -->
<div id="migration-notice" style="display:none;position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--glass-border);border-radius:12px;padding:16px 24px;text-align:center;z-index:100;max-width:400px;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
  <p style="margin:0 0 8px;color:var(--text-bright);font-weight:500;">📦 Local data found!</p>
  <p style="margin:0 0 12px;font-size:13px;color:var(--text-dim);">We found your old typing data in localStorage. Import it to your new account?</p>
  <button class="btn btn--primary btn--small" id="btn-migrate" style="padding:6px 20px;font-size:13px;">Import My Data</button>
  <button class="btn btn--ghost btn--small" id="btn-skip-migrate" style="padding:6px 12px;font-size:13px;margin-left:8px;">Skip</button>
</div>

<script type="module">
import { migrateFromLocalStorage, checkLocalData } from './js/api.js';

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;
  const errorEl = document.getElementById('login-error');

  if (!email || !password) {
    errorEl.textContent = 'Please fill in all fields.';
    errorEl.classList.add('auth-error--visible');
    return;
  }

  try {
    const res = await fetch('api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      // Check if there's localStorage data to migrate
      if (checkLocalData()) {
        document.getElementById('migration-notice').style.display = 'block';
        document.getElementById('btn-migrate').onclick = async () => {
          await migrateFromLocalStorage(data.user.id);
          window.location.href = 'dashboard.php';
        };
        document.getElementById('btn-skip-migrate').onclick = () => {
          localStorage.clear();
          window.location.href = 'dashboard.php';
        };
      } else {
        window.location.href = 'dashboard.php';
      }
    } else {
      errorEl.textContent = data.details || data.error || 'Login failed. Please try again.';
      errorEl.classList.add('auth-error--visible');
    }
  } catch (err) {
    errorEl.textContent = 'Connection error. Please try again.';
    errorEl.classList.add('auth-error--visible');
  }
});
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
