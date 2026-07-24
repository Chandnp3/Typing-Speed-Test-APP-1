# Application Flow and Architecture

This document describes the architectural layout, file structure, state management flow, and mathematical algorithms used in the **Typing Speed Test App (TypeFlow)**.

---

## 1. Directory & File Structure
```
Typing Speed Test APP/
├── index.html            # Main SPA shell with all screens
├── css/
│   ├── main.css          # Main stylesheet (layout, typography, components)
│   └── themes.css        # CSS Variables defining premium theme maps
├── js/
│   ├── app.js            # Entry point, auth flow, bootstrapper
│   ├── state.js          # Central State Store (unidirectional state tracker)
│   ├── engine.js         # Core typing engine logic (alignment & key parsing)
│   ├── ui.js             # DOM manipulation, theme applier, & micro-interactions
│   ├── storage.js        # LocalStorage adapter with user auth & per-user data
│   └── chart.js          # Graph renderer for WPM progression (Canvas API)
├── assets/               # Local icons, sounds, and media files
└── docs/                 # Architectural specifications
```

---

## 2. Screen Architecture (SPA)
The app is a single-page application with 7 screens, toggled via `UI.showScreen()`:

| Screen | Description | Visible When |
|--------|-------------|-------------|
| `login` | Email/password login form | No user session |
| `register` | Registration with nickname, email, password, avatar | No user session |
| `dashboard` | Profile card, stats overview, quick actions, recent tests | Logged in |
| `typing` | Mode selectors, live stats, typing area with caret | Logged in |
| `results` | WPM, Raw WPM, Accuracy, chart, restart options | After test completion |
| `settings` | Theme selector (Cyberpunk, Nord, OLED, Forest) | Logged in |
| `history` | Aggregate stats, score list | Logged in |

**Header/Footer** are hidden on auth screens (`login`, `register`).

---

## 3. Authentication Flow
```
[App Boot] → Check localStorage session
  ├─ Session exists → Load user → Dashboard
  └─ No session → Login Screen
       ├─ "Register" link → Register Screen
       │    ├─ Fill form + select avatar
       │    ├─ Submit → Storage.registerUser()
       │    │    ├─ SHA-256 hash password (with djb2 fallback)
       │    │    ├─ Save user to typingtest_users
       │    │    ├─ Initialize per-user scores
       │    │    └─ Set session → Dashboard
       │    └─ Error → Show error message
       └─ Login with email/password
            ├─ Storage.loginUser() → Verify hash
            ├─ Set session → Dashboard
            └─ Error → Show error message
```

**Session Management:**
- `typingtest_session` stores the current user ID
- `getCurrentUser()` hydrates user data from `typingtest_users`
- `logout()` clears the session and returns to login

---

## 4. Central State Schema
Managed inside `js/state.js`:
```javascript
const state = {
  status: 'idle',          // 'idle' | 'typing' | 'completed'
  mode: 'time',            // 'time' | 'words' | 'custom'
  duration: 30,            // seconds (time mode) or word count (word mode)
  timeLeft: 30,
  words: [],               // Array of strings generated for test
  currentIndex: { word: 0, char: 0 },
  keystrokes: { total: 0, correct: 0, incorrect: 0 },
  history: [],
  timeline: [],            // Second-by-second WPM/error records for chart
  startTime: null,         // performance.now() timestamp
  elapsedTime: 0,
  selectedTheme: 'cyberpunk',
  selectedDuration: 30,
  selectedWordCount: 25,
  user: null               // { id, nickname, email, avatar, createdAt }
};
```

---

## 5. Per-User Data Model
All user data is partitioned by user ID in localStorage:

| Key | Structure | Description |
|-----|-----------|-------------|
| `typingtest_users` | `Array<User>` | All registered users (with password hash) |
| `typingtest_session` | `string` | Current logged-in user ID |
| `typingtest_scores` | `{ [userId]: Array<Score> }` | Per-user test scores (max 100) |
| `typingtest_settings` | `{ [userId]: Settings }` | Per-user preferences |

**Score Schema:**
```javascript
{ id, wpm, rawWpm, accuracy, mode, duration, wordsTyped, date }
```

---

## 6. Technology Stack
1. **Core:** Semantic HTML5 SPA shell.
2. **Styling:** Vanilla CSS3 with CSS Variables for instant theme switching.
3. **Logic:** Modern ES6 JavaScript Modules (`import`/`export`).
4. **Auth:** SHA-256 password hashing via Web Crypto API (with djb2 fallback).
5. **Data Visualization:** Pure Canvas API chart renderer (no dependencies).
6. **Persistence:** LocalStorage with per-user data partitioning.

---

## 7. Algorithmic Implementations

### 7.1. Words Per Minute (WPM)
$$\text{WPM} = \frac{\text{Correct keystrokes}}{5} \times \frac{60}{\text{Elapsed time in seconds}}$$

### 7.2. Raw WPM
$$\text{Raw WPM} = \frac{\text{Total Keystrokes}}{5} \times \frac{60}{\text{Elapsed time in seconds}}$$

### 7.3. Accuracy
$$\text{Accuracy (\%)} = \left( \frac{\text{Correct Keystrokes}}{\text{Total Keystrokes}} \right) \times 100$$

### 7.4. Word Generation (Optimized)
- 500+ word dictionary with common English words
- Fisher-Yates shuffle pool prevents repeats until pool is exhausted
- Pre-allocated arrays for performance

### 7.5. Horizontal Scroll Engine
- Typing text uses `translateX()` for smooth horizontal scrolling
- Active word position is tracked relative to viewport
- Cubic-bezier easing (0.25s) for buttery-smooth transitions
- Scroll offset is clamped to prevent over-scrolling
