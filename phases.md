# Phased Implementation Plan

## Phase 1: Core Setup & Authentication ✅ COMPLETED
*   **SPA Shell:** `index.html` with 7 screens (login, register, dashboard, typing, results, settings, history).
*   **CSS System:** `main.css` + `themes.css` with CSS Variables for 4 themes.
*   **Module Architecture:** ES6 modules — `app.js`, `state.js`, `engine.js`, `ui.js`, `storage.js`, `chart.js`.
*   **User Authentication:** Full register/login/logout with SHA-256 password hashing.
*   **Session Management:** Persistent sessions via localStorage, auto-login on return.
*   **Per-User Data:** Scores, settings, and preferences partitioned by user ID.
*   **Dashboard:** Profile card, stats overview, quick actions, recent tests list.

---

## Phase 2: Core Typing Engine ✅ COMPLETED
*   **Word Generation:** 500+ word dictionary with Fisher-Yates shuffle pool (no repeats until exhausted).
*   **Keystroke Parser:** Full keyboard input handling with pointer indexing.
*   **Backspace Support:** Single character and whole-word deletion (Ctrl/Alt+Backspace).
*   **Visual Indicators:** Character classes (`correct`, `incorrect`, `active`).
*   **Animated Caret:** Smooth caret positioning with blink animation.
*   **Horizontal Scrolling:** Single-line text with `translateX()` and cubic-bezier easing.
*   **Custom Mode Inputs:** Custom time (5-300s) and word count (5-500) inputs.

---

## Phase 3: Analytics, Timer, & Dashboard History ✅ COMPLETED
*   **Test Lifecycle:** Timer countdown, word-limit tracking, `performance.now()` for precision.
*   **Statistical Engine:** WPM, Raw WPM, Accuracy calculations per second-by-second timeline.
*   **Results Panel:** Final metrics display with Canvas-based WPM progression chart.
*   **Local Records:** Per-user score storage with aggregate stats (best, avg, total).
*   **History Screen:** Full score list with date, mode, and accuracy.

---

## Phase 4: Polish & Advanced Features (IN PROGRESS)
*   **Custom Text Mode:** Allow users to paste custom text to practice specific passages.
*   **Sound Effects:** Optional keypress sounds (mechanical click, error bell) via Web Audio API.
*   **Profile Settings:** Edit nickname, change avatar, update preferences from dashboard.
*   **Performance Optimizations:** RequestAnimationFrame for chart rendering, virtual DOM for long texts.
*   **Accessibility Improvements:** ARIA labels, screen reader support, high-contrast mode.
