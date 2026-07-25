<?php
/**
 * register.php - Registration Page
 * Renders registration form. Registration is done via AJAX to api/register.php.
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/session.php';

redirectIfAuthenticated();

$pageTitle = 'Create Account';
$theme = 'cyberpunk';
$showHeader = false;

include __DIR__ . '/includes/header.php';
?>

<div class="screen screen--active" id="screen-register">
  <div class="auth-card">
    <div class="auth-card__logo">
      <span class="auth-card__logo-icon">T</span>
    </div>
    <div class="auth-card__title">Create Account</div>
    <div class="auth-card__subtitle">Join TypeFlow and start improving your typing</div>

    <div class="auth-error" id="register-error"></div>

    <form id="register-form" class="auth-form">
      <div class="auth-field">
        <label class="auth-label" for="reg-nickname">Nickname</label>
        <input type="text" class="auth-input" id="reg-nickname" placeholder="Choose a display name" maxlength="20" required autocomplete="username">
      </div>
      <div class="auth-field">
        <label class="auth-label" for="reg-email">Email</label>
        <input type="email" class="auth-input" id="reg-email" placeholder="you@example.com" required autocomplete="email">
      </div>
      <div class="auth-field">
        <label class="auth-label" for="reg-password">Password</label>
        <input type="password" class="auth-input" id="reg-password" placeholder="Min 6 characters" minlength="6" required autocomplete="new-password">
      </div>
      <div class="auth-field">
        <label class="auth-label" for="reg-password-confirm">Confirm Password</label>
        <input type="password" class="auth-input" id="reg-password-confirm" placeholder="Repeat your password" minlength="6" required autocomplete="new-password">
      </div>

      <div class="auth-field">
        <label class="auth-label">Choose Your Avatar</label>
        <div class="auth-avatars">
          <button type="button" class="avatar-option avatar-option--selected" data-emoji="🧑‍💻">🧑‍💻</button>
          <button type="button" class="avatar-option" data-emoji="👩‍💻">👩‍💻</button>
          <button type="button" class="avatar-option" data-emoji="🎮">🎮</button>
          <button type="button" class="avatar-option" data-emoji="🦊">🦊</button>
          <button type="button" class="avatar-option" data-emoji="🐱">🐱</button>
          <button type="button" class="avatar-option" data-emoji="🚀">🚀</button>
          <button type="button" class="avatar-option" data-emoji="⚡">⚡</button>
          <button type="button" class="avatar-option" data-emoji="🎯">🎯</button>
        </div>
      </div>

      <button type="submit" class="btn btn--primary auth-submit">Create Account</button>
    </form>

    <div class="auth-switch">
      Already have an account? <a href="login.php">Sign In</a>
    </div>
  </div>
</div>

<script type="module">
// Avatar selection
document.querySelectorAll('.auth-avatars .avatar-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.auth-avatars .avatar-option').forEach(o => o.classList.remove('avatar-option--selected'));
    opt.classList.add('avatar-option--selected');
  });
});

document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nickname = document.getElementById('reg-nickname')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim();
  const password = document.getElementById('reg-password')?.value;
  const confirm = document.getElementById('reg-password-confirm')?.value;
  const selectedAvatar = document.querySelector('.avatar-option--selected');
  const avatar = selectedAvatar ? selectedAvatar.dataset.emoji : '🧑‍💻';
  const errorEl = document.getElementById('register-error');

  if (!nickname || !email || !password || !confirm) {
    errorEl.textContent = 'Please fill in all fields.';
    errorEl.classList.add('auth-error--visible');
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters.';
    errorEl.classList.add('auth-error--visible');
    return;
  }
  if (password !== confirm) {
    errorEl.textContent = 'Passwords do not match.';
    errorEl.classList.add('auth-error--visible');
    return;
  }

  try {
    const res = await fetch('api/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, email, password, avatar })
    });
    const data = await res.json();

    if (data.success) {
      window.location.href = 'dashboard.php';
    } else {
      errorEl.textContent = data.details || data.error || 'Registration failed.';
      errorEl.classList.add('auth-error--visible');
    }
  } catch (err) {
    errorEl.textContent = 'Connection error. Please try again.';
    errorEl.classList.add('auth-error--visible');
  }
});
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
