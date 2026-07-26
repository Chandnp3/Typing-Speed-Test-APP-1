# 📝 TypeFlow — Typing Speed Test App Documentation

> **Version:** 1.0.0  
> **Stack:** PHP 8+ / MySQL 8 / Vanilla JS / CSS3  
> **Server:** Apache (XAMPP)  
> **Author:** TypeFlow Development Team

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [File Structure](#3-file-structure)
4. [Installation & Setup](#4-installation--setup)
5. [Database Schema](#5-database-schema)
6. [Authentication System](#6-authentication-system)
7. [Typing Test Engine](#7-typing-test-engine)
8. [API Endpoints](#8-api-endpoints)
9. [Difficulty System](#9-difficulty-system)
10. [Leaderboard & Ranking](#10-leaderboard--ranking)
11. [Guest Mode](#11-guest-mode)
12. [Key Algorithms](#12-key-algorithms)
13. [Frontend JavaScript Modules](#13-frontend-javascript-modules)
14. [CSS & Theming](#14-css--theming)
15. [User Interface Guide](#15-user-interface-guide)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Project Overview

TypeFlow is a premium, multi-page web application for measuring and improving typing speed. It features:

- **PHP + MySQL Backend** with PDO for secure database operations
- **Multi-Page Architecture** - separate pages for typing, dashboard, history, leaderboard, auth
- **Guest Mode** - 3 free tests before prompting sign-up
- **Three Difficulty Levels** - Easy, Normal, Hard word sets
- **Two Test Modes** - Time mode (15s-300s) and Words mode (10-500 words)
- **Live WPM/Accuracy tracking** with real-time stats
- **Post-test Chart** - WPM progression over time via Canvas rendering
- **Leaderboard** - Top 50 users ranked by best single WPM
- **Sound Effects** - Web Audio API keypress sounds
- **Single Theme** - Cyberpunk neon design

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│  ┌───────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐  │
│  │ typing.php │  │dashboard │  │history  │  │leaderboard│  │
│  │  (JS Eng) │  │ .php     │  │ .php    │  │ .php      │  │
│  └─────┬─────┘  └────┬─────┘  └────┬────┘  └─────┬─────┘  │
│        │              │              │              │        │
│        ▼              ▼              ▼              ▼        │
│  ┌────────────────────────────────────────────────────┐     │
│  │              fetch() → api/*.php                   │     │
│  └─────────────────────┬──────────────────────────────┘     │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                  Apache / PHP 8+                           │
│  ┌───────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ includes/  │  │   api/*.php  │  │  session + cookies│  │
│  │ db, session│  │  endpoints   │  │  (PHPSESSID)      │  │
│  └─────┬─────┘  └──────┬───────┘  └────────────────────┘  │
│        │               │                                    │
│        ▼               ▼                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │              MySQL Database (typeflow)              │     │
│  │  users ──── scores ──── settings                   │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Typing Test:** User types → JS Engine tracks keystrokes → Test completes → `fetch POST` to `api/save_score.php` → Stored in MySQL → Results overlay shown
2. **Dashboard:** Page loads → JS fetches `api/get_stats.php` + `api/get_scores.php` → Renders stats + recent tests
3. **Authentication:** User submits form → `fetch POST` to `api/login.php` or `api/register.php` → PHP validates → Sets `$_SESSION` → Redirects
4. **Leaderboard:** Page loads → JS fetches `api/get_leaderboard.php?mode=time` → Renders table → Can switch to words mode

---

## 3. File Structure

```
📁 Typing Speed Test APP/
│
├── 📄 index.php                 # Landing page (redirects based on auth)
├── 📄 typing.php                # Main typing test page
├── 📄 dashboard.php             # User dashboard with stats
├── 📄 leaderboard.php           # Public leaderboard (top 50)
├── 📄 history.php               # Full test history
├── 📄 login.php                 # Login form page
├── 📄 register.php              # Registration form page
├── 📄 settings.php              # User settings (placeholder)
├── 📄 logout.php                # Session destroy + redirect
├── 📄 index.html                # Legacy SPA version (not actively used)
│
├── 📁 includes/
│   ├── 📄 db.php                # PDO database connection
│   ├── 📄 session.php           # Session helpers (getAuthUser, requireAuth, etc.)
│   ├── 📄 header.php            # Shared HTML <head> + navigation header
│   └── 📄 footer.php            # Shared footer with keyboard shortcut hint
│
├── 📁 api/
│   ├── 📄 login.php             # POST auth endpoint
│   ├── 📄 register.php          # POST registration endpoint
│   ├── 📄 save_score.php        # POST save test result
│   ├── 📄 get_scores.php        # GET user's scores list
│   ├── 📄 get_stats.php         # GET aggregate stats (best, avg, total)
│   ├── 📄 get_leaderboard.php   # GET top 50 ranked users
│   ├── 📄 update_settings.php   # POST update user preferences
│   └── 📄 migrate.php           # POST migrate localStorage data
│
├── 📁 js/
│   ├── 📄 engine.js             # Core typing engine (word gen, keystroke handling)
│   ├── 📄 state.js              # Central state store (Observer pattern)
│   ├── 📄 ui.js                 # DOM manipulation (typing text, caret, scrolling)
│   ├── 📄 chart.js              # Canvas WPM progression chart
│   ├── 📄 api.js                # API fetch wrappers
│   ├── 📄 storage.js            # LocalStorage adapter (legacy SPA version)
│   └── 📄 app.js                # SPA entry point (legacy, not used currently)
│
├── 📁 css/
│   ├── 📄 themes.css            # CSS custom properties (cyberpunk theme)
│   └── 📄 main.css              # All component styles
│
├── 📁 sql/
│   └── 📄 schema.sql            # MySQL database schema
│
├── 📁 D📀/                       # (ignore - system folder)
│
├── 📄 .gitattributes            # Git config
├── 📄 algorithms.md             # Algorithm documentation
├── 📄 architecture.md           # Architecture document
├── 📄 design.md                 # Design system document
├── 📄 Memory.md                 # Development memory/notes
├── 📄 phases.md                 # Implementation phases
├── 📄 PRD.md                    # Product requirements
├── 📄 rules.md                  # Coding rules
└── 📄 DOCUMENTATION.md          # This file
```

---

## 4. Installation & Setup

### Prerequisites

- XAMPP (or any Apache + PHP 8+ + MySQL 8 stack)
- Web browser (Chrome recommended)

### Step-by-Step Setup

1. **Clone/Copy the project**
   ```bash
   # Copy the project folder to XAMPP's htdocs
   C:\xampp\htdocs\Typing Speed Test APP\
   ```

2. **Start XAMPP Services**
   - Open XAMPP Control Panel
   - Start **Apache** (must be port 80 or configured accordingly)
   - Start **MySQL**

3. **Create the Database**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Click "SQL" tab
   - Copy and paste the contents of `sql/schema.sql`
   - Click "Go" to execute

   Alternatively, run via command line:
   ```bash
   mysql -u root -p < sql/schema.sql
   ```

4. **Configure Database Connection**
   - Open `includes/db.php`
   - By default, it connects to `localhost` with user `root` and no password
   - If your MySQL has a password, update environment variables or edit directly:
     ```php
     $host = getenv('DB_HOST') ?: 'localhost';
     $dbname = getenv('DB_NAME') ?: 'typeflow';
     $user = getenv('DB_USER') ?: 'root';
     $pass = getenv('DB_PASS') ?: '';  // Change if needed
     ```

5. **Access the Application**
   - Open browser and go to:
   ```
   http://localhost/Typing Speed Test APP/index.php
   ```
   - This will redirect to `typing.php` (if guest) or `dashboard.php` (if logged in)

---

## 5. Database Schema

### Table: `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Unique user ID |
| `nickname` | VARCHAR(50) | Display name |
| `email` | VARCHAR(255) UNIQUE | Login email (stored lowercase) |
| `password_hash` | VARCHAR(255) | bcrypt hash (cost 12) |
| `avatar` | VARCHAR(20) | Emoji avatar (default: 🧑‍💻) |
| `created_at` | DATETIME | Registration timestamp |

### Table: `scores`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Unique score ID |
| `user_id` | INT (FK → users.id) | Owner of this score |
| `wpm` | INT | Words per minute (standard) |
| `raw_wpm` | INT | Raw WPM (including errors) |
| `accuracy` | INT | Accuracy percentage (0-100) |
| `mode` | VARCHAR(20) | `time` or `words` |
| `duration` | INT | Seconds (time mode) or word count (words mode) |
| `words_typed` | INT | Number of words typed |
| `date` | DATETIME | When the test was completed |

### Table: `settings`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Unique setting ID |
| `user_id` | INT (FK, UNIQUE → users.id) | Owner |
| `theme` | VARCHAR(50) | Theme name (always `cyberpunk`) |
| `mode` | VARCHAR(20) | Default test mode: `time` or `words` |
| `duration` | INT | Default time: 30 seconds |
| `word_count` | INT | Default word count: 25 |

### Relationships

```
users 1───* scores    (CASCADE delete)
users 1───1 settings  (CASCADE delete)
```

---

## 6. Authentication System

### Session-Based Auth (PHP Sessions)

The app uses **server-side PHP sessions** with `PHPSESSID` cookies.

#### Key Functions (in `includes/session.php`)

| Function | Description |
|----------|-------------|
| `getAuthUserId()` | Returns `$_SESSION['user_id']` or null |
| `getAuthUser()` | Fetches full user row from DB by session ID |
| `requireAuth()` | Redirects to `login.php` if not authenticated |
| `redirectIfAuthenticated()` | Redirects to `index.php` if already logged in |

#### Password Hashing

- Uses `password_hash($password, PASSWORD_BCRYPT, ['cost' => 12])`
- Verification: `password_verify($password, $user['password_hash'])`

#### Registration Flow

1. User fills form on `register.php`
2. JS sends `POST` to `api/register.php`
3. Server validates: email format, password length (≥6), email uniqueness
4. Password is bcrypt-hashed, user inserted into DB
5. Default settings row created
6. Guest scores imported if provided (`guest_scores` array)
7. Session set, redirect to `dashboard.php`

#### Login Flow

1. User fills form on `login.php`
2. JS sends `POST` to `api/login.php`
3. Server looks up email (lowercase), verifies password
4. On success: session set, guest scores imported if provided
5. Checks for legacy localStorage data (for migration prompt)
6. Redirect to `dashboard.php`

#### Logout

- `logout.php` destroys session, clears cookie, redirects to `login.php`

---

## 7. Typing Test Engine

The typing engine lives in `typing.php` as an inline `<script type="module">` that imports from `js/` modules.

### Lifecycle

```
IDLE → [first keypress] → TYPING → [timer/word limit] → COMPLETED → [results overlay]
  ↑                                                                          │
  └─────────────────── [Tab/Esc/Click Try Again] ←───────────────────────────┘
```

### Word Generation

- **Dictionaries:** Three word sets based on difficulty:
  - **Easy:** Short 3-4 letter common words (~400 words)
  - **Normal:** Medium-common words (~500 words)
  - **Hard:** Longer complex words (~800 words)
- **Fisher-Yates Shuffle:** Words are shuffled in a buffer pool to prevent repetition
- **Shuffle Buffering:** When the buffer is exhausted, it auto-reshuffles

### Keystroke Handling

| Key | Action |
|-----|--------|
| Printable char | Type character at current position |
| Backspace | Delete previous character |
| Ctrl+Backspace / Alt+Backspace | Delete entire current word |
| Space | Advance to next word (or end character) |
| Tab | Restart new test |
| Escape | Restart (if not currently typing) |
| Enter | Restart (when test completed) |

### Metrics Calculation

**WPM (Words Per Minute):**
```
WPM = (correctCharacters / 5) / elapsedMinutes
```

**Raw WPM (includes errors):**
```
RawWPM = (totalKeystrokes / 5) / elapsedMinutes
```

**Accuracy:**
```
Accuracy = (correctKeystrokes / totalKeystrokes) × 100
```

### Timer

- Uses `setInterval` every 250ms to call `Engine.tick()`
- Tracks actual elapsed time via `performance.now() - startTime`
- Records timeline data (WPM per second) for post-test chart
- In "time" mode, counts down from selected duration
- In "words" mode, timer runs indefinitely until target word count reached

### Horizontal Scrolling

- Single-line display with `white-space: nowrap`
- Smooth scrolling via CSS `translateX()` with 0.15s cubic-bezier transition
- Scrolling algorithm detects when active word approaches the right edge
- Prevents scrolling beyond text boundaries

### Sound Effects

- Web Audio API generates a short square wave oscillator on each keypress
- Frequency drops from 800Hz to 400Hz over 40ms
- Volume: 0.12 gain, fades to silence over 60ms
- Silent on error (no sound for Backspace, non-typing keys)

---

## 8. API Endpoints

### `api/register.php` — POST

Register a new user.

**Request:**
```json
{
  "nickname": "Tyler",
  "email": "tyler@example.com",
  "password": "secret123",
  "avatar": "🚀",
  "guest_scores": [{"wpm": 65, "rawWpm": 70, "accuracy": 92, ...}]
}
```

**Response (201):**
```json
{
  "success": true,
  "user": { "id": 1, "nickname": "Tyler", "email": "tyler@example.com", "avatar": "🚀", "created_at": "2024-01-15 10:30:00" }
}
```

**Errors:** 400 (validation), 409 (email exists), 500 (server)

---

### `api/login.php` — POST

Authenticate and create session.

**Request:**
```json
{
  "email": "tyler@example.com",
  "password": "secret123",
  "guest_scores": [{"wpm": 65, ...}]
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { "id": 1, "nickname": "Tyler", ... }
}
```

**Errors:** 400 (missing fields), 401 (invalid credentials), 500 (server)

---

### `api/save_score.php` — POST

Save a completed test score.

**Request:**
```json
{
  "user_id": 1,
  "wpm": 85,
  "rawWpm": 90,
  "accuracy": 94,
  "mode": "time",
  "duration": 30,
  "wordsTyped": 45
}
```

**Response (200):**
```json
{ "success": true, "score_id": 42 }
```

---

### `api/get_scores.php` — GET

Get user's score history.

**Query params:** `?user_id=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "scores": [
    { "id": 42, "wpm": 85, "raw_wpm": 90, "accuracy": 94, "mode": "time", "duration": 30, "words_typed": 45, "date": "2024-01-15 10:35:00" }
  ]
}
```

---

### `api/get_stats.php` — GET

Get aggregate statistics for a user.

**Query params:** `?user_id=1`

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalTests": 25,
    "bestWpm": 115,
    "avgWpm": 78,
    "avgAccuracy": 93
  }
}
```

---

### `api/get_leaderboard.php` — GET

Get top 50 users ranked by best single WPM.

**Query params:** `?mode=time&limit=50&user_id=1`

**Response (200):**
```json
{
  "success": true,
  "mode": "time",
  "leaderboard": [
    { "rank": 1, "user_id": 5, "nickname": "FastTyper", "avatar": "⚡", "best_wpm": 145, "best_accuracy": 98, "tests_count": 40 }
  ],
  "my_rank": 12,
  "my_stats": { "best_wpm": 115, "best_accuracy": 94, "tests_count": 25 },
  "total_users": 200
}
```

**Ranking algorithm:**
```sql
-- Each user's best WPM
SELECT MAX(wpm) as best_wpm, COUNT(*) as tests_count
FROM scores WHERE mode = ?
GROUP BY user_id
ORDER BY best_wpm DESC LIMIT 50

-- Current user's rank
SELECT COUNT(*) + 1 FROM (
  SELECT user_id, MAX(wpm) as best_wpm
  FROM scores WHERE mode = ?
  GROUP BY user_id
) ranked WHERE best_wpm > (
  SELECT MAX(wpm) FROM scores WHERE user_id = ? AND mode = ?
)
```

---

### `api/update_settings.php` — POST

Update user preferences.

**Request:** (partial updates supported)
```json
{
  "user_id": 1,
  "mode": "words",
  "duration": 60,
  "word_count": 50
}
```

**Response (200):**
```json
{ "success": true }
```

---

### `api/migrate.php` — POST

Migrate legacy localStorage data to MySQL.

**Request:**
```json
{
  "user_id": 1,
  "scores": [{"wpm": 65, ...}],
  "settings": { "theme": "cyberpunk", "mode": "time", ... }
}
```

**Response (200):**
```json
{ "success": true, "imported_scores": 12 }
```

---

## 9. Difficulty System

Three difficulty levels affect the **word set used** during tests:

| Difficulty | Word Count | Avg Word Length | Example Words |
|------------|-----------|-----------------|--------------|
| **Easy** | ~400 words | 3-4 chars | `the`, `cat`, `run`, `sun`, `box` |
| **Normal** | ~500 words | 5-7 chars | `family`, `student`, `teacher`, `market` |
| **Hard** | ~800 words | 8-12 chars | `sophistication`, `transportation`, `responsibility` |

- Selection persists via the `currentDifficulty` JS variable
- Active button is highlighted with `mode-bar__btn--active`
- Changing difficulty automatically restarts the test

---

## 10. Leaderboard & Ranking

### Features

- **Public page** (`leaderboard.php`) — accessible to all users including guests
- **Two boards** — separate rankings for Time mode and Words mode
- **Top 50** — only the 50 fastest typists per mode are shown
- **Medal emojis** — 🥇🥈🥉 for top 3
- **Your Rank card** — shown only to logged-in users, displays rank + percentile tooltip
- **Percentile tooltip** — hover over rank badge to see "Top 15%", "Top 5%", etc.
- **Current user highlight** — user's own row has a yellow left border
- **Guest CTA** — guests see a "Create Free Account" prompt at the bottom
- **Responsive** — hides accuracy and tests columns on mobile

### Ranking Algorithm

```
1. For each user, find their single highest WPM score in the given mode
2. Sort users by best_wpm DESC, tiebreak by best_accuracy DESC
3. Assign ranks sequentially (1, 2, 3...)
4. For the current user, count how many users have a higher best_wpm, then add 1
```

---

## 11. Guest Mode

### How it Works

- First-time visitors can start typing immediately without logging in
- Guests get **3 free tests** before being prompted to sign up
- Guest data is stored in **localStorage** under key `typeflow_guest`
- Guest scores are **imported to the user's account** when they register or log in

### Guest Data Structure

```javascript
{
  "count": 2,          // Number of tests taken
  "scores": [          // Array of test results
    {
      "wpm": 65,
      "rawWpm": 70,
      "accuracy": 92,
      "mode": "time",
      "duration": 30,
      "wordsTyped": 35,
      "date": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Countdown/Blocker

- The prompt hint displays: _"3 free tests remaining"_ → _"2 free tests remaining"_ → _"1 free test remaining"_ → _"Sign in to continue testing"_
- After 3 tests, any keypress while idle triggers the **floating auth card**
- The floating auth card has login/register tabs with full validation
- When the user completes registration/login, guest scores are automatically migrated

### Auth Card UI

- Modal overlay with backdrop blur
- Login form (email + password)
- Register form (nickname + email + password + avatar selection)
- Tab switching between login and register
- Client-side validation (required fields, password length, email format)
- Error display with inline messages

---

## 12. Key Algorithms

### Fisher-Yates Shuffle

Used to randomly order words while ensuring uniform distribution.

```
for i from array.length - 1 down to 1:
    j = random integer between 0 and i
    swap array[i] and array[j]
```

### Shuffle Buffering

Prevents word repetition within a test cycle:

1. Start with an empty buffer
2. When a word is requested, take from buffer if available
3. If buffer is empty, shuffle the full dictionary and refill the buffer
4. This guarantees no word repeats until the entire dictionary has been used

### WPM Progression Chart

Canvas-rendered line chart showing WPM over time:

1. Timeline data recorded as `[{second: 0, wpm: 0}, {second: 1, wpm: 65}, ...]`
2. Canvas dimensions calculated from element size
3. Data normalized by finding max WPM and max time
4. Points mapped to pixel coordinates via ratio calculations
5. Line drawn with gradient fill underneath
6. Peak WPM label shown at the highest point

### Dynamic SQL Ranking

To calculate a user's rank without fetching all users:

1. Find the user's best WPM in the given mode
2. Count how many distinct users have a higher best WPM
3. Rank = count + 1 (ties are ordered by accuracy)

### Horizontal Text Scrolling

1. Track the active word element's position relative to the container
2. If the word's right edge exceeds the container width minus padding, shift left
3. If the word's left edge is within padding, shift right
4. Clamp to prevent scrolling beyond text boundaries
5. Apply smooth CSS transition for the transform

---

## 13. Frontend JavaScript Modules

### `js/state.js` — Central State Store

- Observer pattern with `subscribe()`, `setState()`, `getState()`
- Manages status (`idle` | `typing` | `completed`), keystrokes, timer, timeline
- `resetTest()` resets for a new test while preserving mode/settings
- Changes are broadcast to all subscribers with the changed keys

### `js/engine.js` — Core Typing Engine

- Word generation with 3 difficulty levels and shuffle buffering
- Keystroke processing: character matching, backspace, delete word, space
- WPM/Raw WPM/Accuracy calculation
- Timer tick management and timeline recording
- `completeTest()` calculates final stats and updates state

### `js/ui.js` — DOM Manipulation

- Renders typing text as `<span class="word">` with `<span class="char">` children
- Caret positioning and blink animation
- Character status classes (`char--correct`, `char--incorrect`, `char--active`)
- Smooth horizontal scrolling with intelligent offset calculation
- Stats bar updates (WPM, Raw, Accuracy)
- Timer bar width updates
- Error flash animation

### `js/chart.js` — Canvas Chart Renderer

- WPM progression line chart
- Gradient fill under the line
- Peak WPM annotation
- Pixel-perfect coordinate mapping

### `js/api.js` — API Wrappers

- `saveScore()`, `getStats()`, `getScores()` — backend communication
- `checkLocalData()` — detect legacy localStorage data
- `migrateFromLocalStorage()` — import old data to MySQL

### `js/storage.js` — LocalStorage Adapter (Legacy)

- User registration/login with SHA-256 hashing (Web Crypto API)
- Persistent session management
- Per-user score storage and retrieval
- Used only by the old SPA version (`index.html`)

### `js/app.js` — SPA Entry Point (Legacy)

- Bootstraps the old single-page application
- Not used in the current multi-page PHP version

---

## 14. CSS & Theming

### Theme System

The app uses CSS Custom Properties defined in `css/themes.css` for the **Cyberpunk** theme:

```css
[data-theme="cyberpunk"] {
  --background: #0b0e14;
  --background-secondary: #111620;
  --background-tertiary: #161c28;
  --text-dim: #4b5263;
  --text-medium: #7c8298;
  --text-bright: #00f0ff;      /* Cyan for text */
  --primary: #f0e600;           /* Yellow for accents */
  --primary-dim: rgba(240, 230, 0, 0.15);
  --error: #ff0055;             /* Pink-red for errors */
  --correct: #00f0ff;           /* Cyan for correct chars */
  --incorrect: #ff0055;         /* Pink-red for wrong chars */
  --caret-color: #f0e600;       /* Yellow cursor */
  /* ... */
}
```

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--font-mono` | JetBrains Mono, monospace | Typing area |
| `--font-sans` | Outfit, Inter, sans-serif | UI elements |
| `--text-typing` | 28px | Active typing text |
| `--text-heading` | 32px | Page headings |
| `--text-metrics` | 56px | WPM/accuracy display |
| `--radius-lg` | 20px | Cards, panels |
| `--radius-full` | 9999px | Pill buttons |
| `--glass-bg` | rgba(255,255,255,0.04) | Glassmorphism |
| `--glass-border` | rgba(255,255,255,0.08) | Subtle borders |
| `--gap-xl` | 40px | Large spacing |

### Component Styles (in `css/main.css`)

- **Header**: flexbox nav bar with logo and action links
- **Auth Cards**: centered card with glassmorphism shadow, form inputs with focus states
- **Mode Bar**: pill-shaped button groups for mode, difficulty, duration selection
- **Stats Bar**: flexbox row of stat values/labels
- **Timer Bar**: progress bar that shrinks in time mode
- **Typing Area**: fixed-height container with overflow hidden, single-line text
- **Caret**: absolute-positioned vertical line with blink animation
- **Results Card**: overlay with metrics, chart, and action buttons
- **Dashboard**: profile header, 4-column stats grid, action buttons, recent tests list
- **History**: stats summary cards + scrollable score list
- **Leaderboard**: table layout with tabs, top-3 highlights, current user highlight, rank card
- **Floating Auth Card**: fixed overlay with backdrop blur, animated entrance
- **Responsive**: mobile breakpoint at 640px

### Animations

| Animation | Duration | Easing | Used On |
|-----------|----------|--------|---------|
| `fadeIn` | 0.4s | ease | Screens, cards |
| `floatIn` | 0.4s | cubic-bezier | Auth card |
| `caretBlink` | 1.2s | ease-in-out infinite | Caret |
| `flashError` | 0.2s | ease | Typing area |

---

## 15. User Interface Guide

### Typing Test Page (`typing.php`)

```
┌─────────────────────────────────────────────────────────────┐
│ [T] TypeFlow          [Leaderboard] [Sign In] [Register]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [time · words]  ·  [easy · normal · hard]  ·  [15·30·60·120·_s] [10·25·50·100·_w]  │
│                                                             │
│          0 wpm          0 raw          100% accuracy        │
│                                                             │
│   ████████████████████████████████████████████████████████  │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ some words appear here they scroll as you type...    │  │
│   │                                     ▏                 │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                             │
│   Press Tab or Esc to restart · Space to move to next word  │
│   3 free tests remaining                                     │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard (`dashboard.php`)

- Profile card with avatar, nickname, email, join date
- 4 stats cards: Best WPM, Avg WPM, Avg Accuracy, Total Tests
- Quick actions: Start Test, View History, Settings
- Recent Tests list (last 5)

### Leaderboard (`leaderboard.php`)

- Title + subtitle
- "Your Rank" card (logged-in users only) with rank badge + percentile tooltip
- Tab switcher: Time Mode / Words Mode
- Table with columns: Rank, Typist (avatar + name), Best WPM, Accuracy, Tests
- Top 3 highlighted with medals and colored backgrounds
- Current user's row highlighted with yellow left border
- Guest CTA at bottom with register/login buttons

### History (`history.php`)

- Stats summary: Total Tests, Best WPM, Average WPM
- Scrollable list of all test results with date/time, mode, WPM, accuracy

---

## 16. Troubleshooting

### "Database connection failed"

```
Possible causes:
1. MySQL is not running in XAMPP
2. Wrong database credentials in includes/db.php
3. Database 'typeflow' doesn't exist

Fix:
- Start MySQL in XAMPP Control Panel
- Run sql/schema.sql in phpMyAdmin
- Check db.php credentials
```

### "Base table or view not found"

```
The database tables haven't been created yet.

Fix: Execute the schema in sql/schema.sql via phpMyAdmin
```

### "Server error. Please try again."

```
Check XAMPP Apache error log:
C:\xampp\apache\logs\error.log

Common issues:
- MySQL connection failure
- PHP syntax error
- Missing PHP extensions (pdo_mysql)
```

### Blank page or redirect loop

```
1. Check that all files are in the correct path under htdocs
2. Ensure includes/header.php and includes/footer.php exist
3. Check PHP error display in php.ini:
   display_errors = On
   error_reporting = E_ALL
```

### Guest scores not importing

```
Guest data is stored in localStorage under 'typeflow_guest'.
The import happens on login/register via the guest_scores field.
Make sure cookies and localStorage are enabled in the browser.
```

### Leaderboard not showing

```
1. Ensure there are scores in the database
2. Check browser console for API errors
3. Hard refresh (Ctrl+Shift+R) to clear cache
4. Verify the leaderboard CSS is loaded (check Network tab)
```

### Sound not working

```
The Web Audio API requires:
- A user interaction (click/keypress) to initialize the AudioContext
- Some browsers block autoplay audio without user gesture
- The first keypress creates the AudioContext, subsequent keys play the sound
```

---

## Appendix: Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_NAME` | `typeflow` | Database name |
| `DB_USER` | `root` | MySQL user |
| `DB_PASS` | `` (empty) | MySQL password |

Set via Apache configuration or directly in `includes/db.php`.

---

## Appendix: Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ⚠️ Safari (functional, but Web Audio may need user gesture)
- ❌ Internet Explorer (not supported)

---

> ⚡ **Happy Typing!** This documentation was generated for TypeFlow v1.0.0.
