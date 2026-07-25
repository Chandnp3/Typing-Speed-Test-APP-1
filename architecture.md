# Architecture Document — TypeFlow

## Overview
TypeFlow is a multi-page PHP web application for measuring and improving typing speed. It uses a PHP backend with MySQL database, served via Apache (XAMPP).

## Tech Stack
- **Backend:** PHP 8+ with PDO + MySQL
- **Database:** MySQL 8 (via XAMPP phpMyAdmin)
- **Frontend:** Vanilla ES6+ JavaScript modules, CSS3 with custom properties
- **Auth:** PHP sessions + bcrypt password hashing
- **Fonts:** JetBrains Mono (monospace), Outfit (sans-serif)

## File Structure
```
/ (htdocs root)
├── index.php              # Landing page (redirects based on auth)
├── login.php              # Login page
├── register.php           # Registration page
├── logout.php             # Logout (destroys session)
├── dashboard.php          # User dashboard with stats
├── typing.php             # Typing test page (full engine)
├── history.php            # Full test history
├── settings.php           # Theme/settings page
├── includes/
│   ├── db.php             # PDO database connection
│   ├── session.php        # Session management helpers
│   ├── header.php         # Shared HTML header
│   └── footer.php         # Shared HTML footer
├── api/
│   ├── login.php          # Login endpoint
│   ├── register.php        # Registration endpoint
│   ├── save_score.php     # Save test result
│   ├── get_scores.php     # Get user scores
│   ├── get_stats.php      # Get aggregate stats
│   ├── update_settings.php # Update user settings
│   └── migrate.php        # Migrate localStorage data
├── js/
│   ├── api.js             # API fetch wrapper
│   ├── state.js           # Central state store
│   ├── engine.js          # Typing engine
│   ├── ui.js              # DOM manipulation helpers
│   └── chart.js           # Canvas chart renderer
├── css/
│   ├── themes.css          # CSS custom properties (4 themes)
│   └── main.css            # All component styles
├── sql/
│   └── schema.sql          # MySQL database schema
└── .htaccess               # (optional URL config)
```

## Data Flow

### Authentication
```
User → login.php (form) → fetch POST → api/login.php
  → PHP validates credentials (bcrypt verify)
  → Sets session (PHPSESSID cookie)
  → Redirects to dashboard.php
```

### Typing Test
```
User → typing.php → JS Engine (keystroke handling)
  → Test complete → fetch POST → api/save_score.php
  → Score stored in MySQL → Results overlay shown
```

### Dashboard
```
User → dashboard.php → JS fetch → api/get_stats.php
  → JS fetch → api/get_scores.php → Renders stats + recent tests
```

## Database Tables
- **users** (id, nickname, email, password_hash, avatar, created_at)
- **scores** (id, user_id, wpm, raw_wpm, accuracy, mode, duration, words_typed, date)
- **settings** (id, user_id, theme, mode, duration, word_count)

## Migration
Old localStorage data (from SPA version) is detected on login and can be migrated to MySQL via `api/migrate.php`.
