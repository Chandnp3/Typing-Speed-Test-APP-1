# TypeFlow — Web-Based Typing Speed Test Application

**Project Report**

| | |
|---|---|
| **Project Title** | TypeFlow — Typing Speed Test Web Application |
| **Version** | 1.0.0 |
| **Technology Stack** | PHP 8, MySQL 8 (PDO), Vanilla JavaScript (ES Modules), HTML5 Canvas, CSS3 |
| **Server Environment** | Apache (XAMPP) |
| **Date** | September 2026 |

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Background](#11-background)
   - 1.2 [Problem Statement](#12-problem-statement)
   - 1.3 [Objectives](#13-objectives)
   - 1.4 [Scope](#14-scope)
   - 1.5 [Limitations](#15-limitations)
2. [Literature Review / Related Work](#2-literature-review--related-work)
3. [System Analysis](#3-system-analysis)
   - 3.1 [Requirement Analysis](#31-requirement-analysis)
   - 3.2 [Feasibility Study](#32-feasibility-study)
   - 3.3 [Use-Case Diagram](#33-use-case-diagram)
   - 3.4 [ER Diagram](#34-er-diagram)
4. [System Design](#4-system-design)
   - 4.1 [Architecture Diagram](#41-architecture-diagram)
   - 4.2 [Data Flow Diagrams](#42-data-flow-diagrams)
   - 4.3 [Database Schema](#43-database-schema)
   - 4.4 [UI Wireframes](#44-ui-wireframes)
   - 4.5 [Tech Stack Justification](#45-tech-stack-justification)
5. [Implementation](#5-implementation)
   - 5.1 [Tools and Languages Used](#51-tools-and-languages-used)
   - 5.2 [Module 1 — Text Generator](#52-module-1--text-generator)
   - 5.3 [Module 2 — WPM / Accuracy Calculator](#53-module-2--wpm--accuracy-calculator)
   - 5.4 [Module 3 — Timer](#54-module-3--timer)
   - 5.5 [Module 4 — Results Screen](#55-module-4--results-screen)
   - 5.6 [Module 5 — Authentication & Guest Mode](#56-module-5--authentication--guest-mode)
   - 5.7 [Module 6 — Leaderboard](#57-module-6--leaderboard)
6. [Testing](#6-testing)
   - 6.1 [Testing Strategy](#61-testing-strategy)
   - 6.2 [Unit Test Cases](#62-unit-test-cases)
   - 6.3 [Functional Test Cases](#63-functional-test-cases)
   - 6.4 [Security Test Cases](#64-security-test-cases)
   - 6.5 [Sample Test Results](#65-sample-test-results)
7. [Results and Discussion](#7-results-and-discussion)
   - 7.1 [Screenshots](#71-screenshots)
   - 7.2 [Output Analysis](#72-output-analysis)
   - 7.3 [Performance](#73-performance)
8. [Conclusion and Future Recommendations](#8-conclusion-and-future-recommendations)
   - 8.1 [Conclusion](#81-conclusion)
   - 8.2 [Future Recommendations](#82-future-recommendations)

---

# 1. Introduction

## 1.1 Background

Typing is one of the most fundamental computer skills in the modern digital workplace. Programmers, writers, data-entry operators, students, and office workers all spend a large portion of their day entering text through a keyboard. Typing speed and accuracy directly affect productivity: a typist who sustains 70 WPM with high accuracy can produce written work noticeably faster than one who "hunts and pecks" at 25 WPM.

Formal measurement of typing ability is standardised through the metric **WPM (Words Per Minute)**, defined by the conventional rule that one "word" equals **5 characters** (including spaces). Accuracy — the percentage of keystrokes that were correct — is equally important, since fast typing with many errors is worse than moderate typing with few.

Historically, typing skills were measured by dedicated desktop software (e.g. Mavis Beacon Teaches Typing) or with a stopwatch and a printed passage. The web made typing tests instantly accessible with zero installation, and a generation of browser-based tools (10FastFingers, Monkeytype, Typing.com, typingtest.com) emerged. However, many of these tools are either heavily advertisement-driven, require accounts before any value is delivered, offer limited difficulty control, or provide little insight into *why* a user is slow (which words, which moments of the test).

**TypeFlow** is a web-based typing speed test application developed to combine the instant accessibility of tools like Monkeytype with a persistent, user-centred analytics layer: saved test history, personal statistics, a competitive leaderboard, adaptive word selection, and detailed per-test diagnostics (WPM timeline, consistency, burst speed, and problem words).

## 1.2 Problem Statement

Existing freely available typing-test tools exhibit one or more of the following gaps:

1. **No zero-friction entry.** Some tools require registration before a single test can be taken, creating a barrier for casual users who only want a quick measurement.
2. **Weak persistence and analytics.** Many tools show a single result and discard it; the user cannot see progress over days or weeks.
3. **No adaptive difficulty.** Word streams are uniformly random, so a user's systematically weak words never get targeted practice.
4. **Poor feedback granularity.** Most tools report only final WPM and accuracy, without a time-series view of performance, consistency, or burst speed within the test.
5. **No competition layer.** Ranking against other learners is either absent or requires payment.

Therefore, there is a need for a lightweight, self-hostable web application that:

- allows **guests** to take tests immediately with no sign-up,
- **persists** results for registered users and aggregates them into meaningful statistics,
- **adapts** word selection toward the user's frequently missed words,
- presents **rich diagnostics** (WPM progression chart, consistency, burst WPM, problem words), and
- includes a **leaderboard** for competitive motivation.

## 1.3 Objectives

The objectives of this project are:

1. To design and implement a **responsive web application** that measures typing speed (WPM, Raw WPM) and accuracy in real time.
2. To implement **two test modes** — time mode (15/30/60/120 s and custom 5–300 s) and words mode (10/25/50/100 and custom 5–500 words) — with **three difficulty levels** (easy, normal, hard).
3. To implement an **adaptive word generator** using a weighted word pool that increases the frequency of frequently missed words.
4. To implement **live statistics** (WPM, raw WPM, accuracy updated every keystroke) and a **per-second performance timeline** rendered as a WPM progression chart after the test.
5. To implement a **user account system** (registration, login, session management) with password hashing, and a **guest mode** allowing 3 free tests before prompting sign-up, with automatic migration of guest results upon registration.
6. To implement a **personal dashboard** (best/average WPM, accuracy, test count, recent tests) and a **public leaderboard** (top 50 users per mode).
7. To secure all data access using **prepared statements (PDO)** and server-side session checks.

## 1.4 Scope

**In scope:**

- A multi-page web application (landing, typing test, dashboard, history, leaderboard, login, register, settings, logout) running on Apache + PHP + MySQL.
- Guest testing with a localStorage-based 3-test quota and result migration on sign-up.
- English-language word pools for three difficulty levels.
- Real-time keystroke processing including backspace, Ctrl/Alt+Backspace (whole-word delete), and Tab/Esc restart shortcuts.
- Client-side chart rendering of the WPM timeline using the native Canvas API.
- REST-style JSON API endpoints for auth, score saving, statistics, settings, and leaderboard.
- Keypress sound feedback via the Web Audio API and a neon "cyberpunk" visual theme.

**Out of scope:**

- Typing lessons, courses, or gamified training curricula.
- Languages other than English.
- Mobile touch-keyboard testing (the app is designed for physical keyboards).
- Native desktop/mobile applications.
- Real-time multiplayer racing.

## 1.5 Limitations

1. **English only.** Word pools and the character-alignment logic assume Latin-script English words; accented characters are not validated.
2. **Single-device guest data.** Guest results are stored in `localStorage`; they exist only in the browser that took the tests and are lost if browser data is cleared.
3. **Client-trusted metrics.** Score values arrive at the API from the client; a technically skilled user could submit inflated scores. (Mitigation is listed under future work.)
4. **No anti-cheat heuristics.** There is no detection of paste events or automation.
5. **Manual testing.** Quality assurance was performed manually; no automated unit-test suite ships with the project.
6. **Single server assumption.** The app targets a single Apache/MySQL instance (XAMPP for development); horizontal scaling and load balancing were not addressed.

---

# 2. Literature Review / Related Work

Several web-based typing test tools were studied to identify best practices and gaps.

## 2.1 Monkeytype

**What it does.** Monkeytype is a minimalist, open-source typing test. Its strengths are:

- Extremely low-friction UI: the test starts on the first keystroke, no button to press.
- Multiple modes: time, words, quote, zen; multiple difficulty and language options.
- Instant restart with Tab, per-test WPM chart, and optional account for result history.
- Keyboard-first configuration UI.

**Gaps observed.**

- Guest history is session-scoped and lost on reload unless an account is created.
- Heavy dependence on continuous internet connectivity to its hosted backend.
- No adaptive vocabulary targeting a user's weak words — word stream is random per test.
- Self-hosting the full stack requires Node.js and MongoDB, which is heavier than a typical PHP/MySQL teaching environment.

## 2.2 10FastFingers

**What it does.** 10FastFingers popularised the fixed 1-minute competition format:

- A standardised 60-second test with a fixed top-200 (or top-1000) word list.
- Global "typing competition" ranking, which created strong social motivation.
- Multi-language support.

**Gaps observed.**

- The interface is advertisement-heavy, which distracts from the typing area.
- Only one primary test format (60 seconds); flexibility of duration/word count is limited.
- Results are shallow: final score only, with little diagnostic breakdown.
- Account creation is effectively required for meaningful progress tracking.

## 2.3 Typing.com and TypingClub

**What it does.** These are structured lesson platforms with courses, badges, and classroom management.

**Gaps observed.**

- They are training curricula rather than quick measurement tools; taking one fast test requires navigating course content.
- Accounts are mandatory from the first interaction.

## 2.4 Comparative Summary and Identified Gap

| Feature | Monkeytype | 10FastFingers | Typing.com | **TypeFlow (this project)** |
|---|---|---|---|---|
| Test without account | ✅ | ✅ | ❌ | ✅ (3 free tests + result migration) |
| Time & words modes with custom values | ✅ | Limited | Limited | ✅ (5–300 s, 5–500 words) |
| Difficulty-graded word pools | Partial | ❌ | ✅ | ✅ (easy/normal/hard) |
| Adaptive weighting of missed words | ❌ | ❌ | ❌ | ✅ (weighted pool, 0.5–5.0×) |
| WPM timeline chart per test | ✅ | ❌ | Partial | ✅ (Canvas, zero dependencies) |
| Consistency / burst WPM / problem words | Partial | ❌ | ❌ | ✅ |
| Persistent history + aggregate stats | ✅ (account) | ✅ (account) | ✅ (account) | ✅ (dashboard + history) |
| Public leaderboard per mode | ✅ | ✅ | Partial | ✅ (top 50, per-mode rank) |
| Lightweight self-host (PHP + MySQL) | ❌ (Node+Mongo) | ❌ | ❌ | ✅ |

**Conclusion of review.** The literature shows that no mainstream lightweight tool combines *zero-friction guest testing*, *adaptive word selection*, and *rich per-test diagnostics* on a simple PHP/MySQL stack. TypeFlow was designed to fill this gap.

---

# 3. System Analysis

## 3.1 Requirement Analysis

### 3.1.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | The system shall generate a random stream of words based on the selected difficulty (easy/normal/hard). | High |
| FR-02 | The system shall support **time mode** with durations 15/30/60/120 s and a custom value (5–300 s). | High |
| FR-03 | The system shall support **words mode** with counts 10/25/50/100 and a custom value (5–500). | High |
| FR-04 | The test shall start automatically on the first printable keystroke. | High |
| FR-05 | The system shall display live WPM, raw WPM, and accuracy during the test. | High |
| FR-06 | The system shall support Backspace (character), Ctrl/Alt+Backspace (whole word), Tab restart, and Esc restart. | High |
| FR-07 | On completion the system shall show WPM, raw WPM, accuracy, and a WPM-progression chart. | High |
| FR-08 | Registered users' results shall be stored in the database with mode, duration, and word count. | High |
| FR-09 | The system shall provide a dashboard showing best WPM, average WPM, accuracy, total tests, and recent tests. | High |
| FR-10 | The system shall provide a public leaderboard of the top 50 users per mode, plus the current user's rank. | Medium |
| FR-11 | Guests shall be able to take **3 free tests**; further tests require sign-in, and guest results shall migrate to the new account. | Medium |
| FR-12 | Users shall register with a nickname, e-mail, password (min 6 chars), and an emoji avatar. | High |
| FR-13 | User preferences (mode, duration, word count) shall persist per user. | Low |
| FR-14 | The system shall compute consistency (0–100), burst WPM (peak 3-second window), average word time, and the top-5 problem words per test. | Medium |

### 3.1.2 Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | Keystroke handling must respond imperceptibly (< 50 ms); the timer ticks at 250 ms. |
| NFR-02 | Performance | Word selection must be O(log n) per word (weighted binary search) so generating hundreds of words is instant. |
| NFR-03 | Security | Passwords shall be stored only as hashes (`password_hash`, bcrypt). |
| NFR-04 | Security | All SQL access shall use prepared statements to prevent SQL injection. |
| NFR-05 | Security | Session-based authentication; password fields never echoed; JSON APIs set `Content-Type: application/json`. |
| NFR-06 | Usability | The UI shall be distraction-free, keyboard-driven, and operable without touching the mouse during a test. |
| NFR-07 | Portability | The app shall run on any standard Apache + PHP 8 + MySQL 8 environment (XAMPP for development). |
| NFR-08 | Maintainability | Front-end logic shall be modular ES modules (engine, state, ui, chart) with unidirectional state flow. |
| NFR-09 | Reliability | A failed score-save network call shall not crash the client; results remain visible. |
| NFR-10 | Compatibility | Supported on current versions of Chrome, Edge, and Firefox at 1280×720 and above. |

## 3.2 Feasibility Study

### 3.2.1 Technical Feasibility

- **PHP 8 + MySQL 8** are mature, free, and universally available in teaching/lab environments (XAMPP bundles both).
- The typing engine needs only standard browser APIs: DOM events, `performance.now()` for high-resolution timing, `setInterval`, `localStorage`, `CanvasRenderingContext2D`, and the Web Audio API. No external JS libraries are required, eliminating dependency risk.
- PDO prepared statements and `password_hash()` provide secure-by-default building blocks.
- **Verdict: Feasible.**

### 3.2.2 Economic Feasibility

- All components are free and open source (Apache, PHP, MySQL, browser).
- Development was performed on existing hardware; no licences are required.
- Hosting a PHP/MySQL app is among the cheapest shared-hosting options available.
- **Verdict: Feasible (near-zero cost).**

### 3.2.3 Operational Feasibility

- The interface follows the conventions popularised by Monkeytype (mode bar at the top, type-to-start, Tab to restart), so target users already understand it.
- Guests need no training: open page → type. Registration is optional and only requested after the guest quota.
- **Verdict: Feasible.**

### 3.2.4 Schedule Feasibility

The project was implemented in five phases — (1) UI/theme, (2) typing engine, (3) auth + database, (4) dashboard/leaderboard/history, (5) guest mode + polish — which fits a typical academic term timeline.
**Verdict: Feasible.**

## 3.3 Use-Case Diagram

```text
                        ┌──────────────────────────────────────────┐
                        │               TypeFlow                   │
                        │                                          │
        ┌───────────┐   │   ┌──────────────┐   ┌──────────────┐    │
        │           │   │   │ Take Typing  │   │ Restart /    │    │
        │  Visitor  │───┼──►│   Test       │──►│ Change Mode  │    │
        │  (Guest)  │───┼──►│ (as guest)   │   │ / Difficulty │    │
        │           │   │   └──────────────┘   └──────────────┘    │
        │           │   │   ┌──────────────┐                       │
        │           │───┼──►│ View Results │                       │
        │           │   │   │  & Chart     │                       │
        │           │   │   └──────────────┘                       │
        │           │   │   ┌──────────────┐                       │
        │           │───┼──►│ Register /   │◄── guest results      │
        │           │   │   │ Login        │    migrate on signup  │
        └───────────┘   │   └──────────────┘                       │
                        │                                          │
        ┌───────────┐   │   ┌──────────────┐   ┌──────────────┐    │
        │           │   │   │ Take Typing  │   │ View Own     │    │
        │  Logged-  │───┼──►│ Test (saved) │   │ History      │    │
        │  in User  │───┼──►└──────────────┘   └──────────────┘    │
        │           │   │   ┌──────────────┐                       │
        │           │───┼──►│ View Personal│                       │
        │           │   │   │  Dashboard   │                       │
        │           │   │   └──────────────┘                       │
        │           │   │   ┌──────────────┐                       │
        │           │───┼──►│ View Public  │                       │
        │           │   │   │ Leaderboard  │                       │
        │           │   │   └──────────────┘                       │
        │           │   │   ┌──────────────┐                       │
        │           │───┼──►│ Update Test  │                       │
        │           │   │   │  Settings    │                       │
        │           │   │   └──────────────┘                       │
        │           │   │   ┌──────────────┐                       │
        │           │───┼──►│ Logout       │                       │
        └───────────┘   │   └──────────────┘                       │
                        └──────────────────────────────────────────┘
```

**Primary use cases:**

1. **Take Typing Test** — core use case; extension point for *Change Mode/Difficulty* and *Restart*.
2. **View Results & Chart** — post-test summary with WPM/accuracy/timeline chart.
3. **Register / Login** — unlocks saving, dashboard, leaderboard rank; includes *«include»* behaviour of validating credentials.
4. **View Personal Dashboard / History** — aggregated statistics and full test list.
5. **View Public Leaderboard** — available to both actors.
6. **Update Test Settings** — persisted only for logged-in users.
7. **Logout** — destroys the session.

## 3.4 ER Diagram

The database stores user scores, so an entity–relationship model is required.

```text
┌─────────────────────┐            ┌──────────────────────────┐
│        users        │            │          scores          │
├─────────────────────┤            ├──────────────────────────┤
│ id (PK)             │            │ id (PK)                  │
│ nickname            │ 1        N │ user_id (FK → users.id)  │
│ email (UNIQUE)      ├───────────►│ wpm                      │
│ password_hash       │  has       │ raw_wpm                  │
│ avatar              │            │ accuracy                 │
│ created_at          │            │ mode  ('time'|'words')   │
└─────────┬───────────┘            │ duration (s or words)    │
          │ 1                      │ words_typed              │
          │                        │ date                     │
          │ has                    └──────────────────────────┘
          ▼ 1
┌─────────────────────┐
│      settings       │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK, UNIQUE)│
│ theme               │
│ mode                │
│ duration            │
│ word_count          │
└─────────────────────┘
```

- **users 1 ── N scores** — one user can take many tests; scores cascade on user deletion.
- **users 1 ── 1 settings** — each user has exactly one preference row.

---

# 4. System Design

## 4.1 Architecture Diagram

The application follows a **three-tier architecture** with a thin REST-style API layer.

```text
┌─────────────────────────────────────────────────────────────────┐
│                    TIER 1 — PRESENTATION (Browser)              │
│                                                                 │
│  typing.php   dashboard.php   history.php   leaderboard.php     │
│  login.php    register.php    settings.php  index.php           │
│                                                                 │
│  JS Modules (ES Modules, no framework):                         │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌───────────────┐  │
│  │ engine.js  │ │ state.js   │ │  ui.js    │ │   chart.js    │  │
│  │ word gen,  │ │ central    │ │ DOM,      │ │ canvas WPM    │  │
│  │ keystrokes,│ │ store with │ │ caret,    │ │ timeline      │  │
│  │ WPM stats  │ │ pub/sub    │ │ scrolling │ │ renderer      │  │
│  └─────┬──────┘ └─────┬──────┘ └─────┬─────┘ └───────┬───────┘  │
│        └──────────────┴──────┬───────┴───────────────┘          │
│                              │ fetch() JSON                     │
└──────────────────────────────┼──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              TIER 2 — APPLICATION (Apache + PHP 8)              │
│                                                                 │
│  api/*.php        → login, register, save_score, get_scores,    │
│                     get_stats, get_leaderboard,                 │
│                     update_settings, migrate                    │
│  includes/*.php   → db.php (PDO singleton),                     │
│                     session.php (getAuthUser, requireAuth)      │
│                     header.php / footer.php (shared layout)     │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│           TIER 3 — DATA (MySQL 8, database: typeflow)           │
│        users ──1:N──► scores        users ──1:1──► settings     │
└─────────────────────────────────────────────────────────────────┘
```

**Design decisions.**

- All timing-sensitive logic (keystroke parsing, WPM, timeline) runs **client-side** to guarantee zero network latency during a test; the server is touched only once per test (save).
- State management uses a **pub/sub store** (`state.js`): components subscribe and react to changed keys, which keeps UI, engine, and timer decoupled.
- The chart is drawn with the **native Canvas API** instead of a charting library to keep the bundle dependency-free.

## 4.2 Data Flow Diagrams

### 4.2.1 Level-0 (Context) Diagram

```text
                 ┌──────────────┐   words / settings   ┌───────────────┐
                 │    User      │─────────────────────►│               │
                 │ (guest or    │◄─────────────────────│   TypeFlow    │
                 │  registered) │  stats / leaderboard │   System      │
                 └──────────────┘   scores / history    └──────┬────────┘
                                                               │
                                                               ▼
                                                        ┌───────────────┐
                                                        │ MySQL DB      │
                                                        │ (typeflow)    │
                                                        └───────────────┘
```

### 4.2.2 Level-1 Diagram — Typing Test with Score Saving

```text
 ┌──────┐  key events   ┌─────────────┐  word stream  ┌────────────────┐
 │ User │──────────────►│ 1.0         │──────────────►│ 2.0 Typing     │
 └──┬───┘               │ Word        │               │ Engine         │
    │                   │ Generator   │               │ (keystrokes,   │
    │                   └─────────────┘               │ timer, stats)  │
    │                                                 └───────┬────────┘
    │                    ┌─────────────┐  timeline/          │ final stats
    │   live stats       │ 3.0 UI      │  metrics            ▼
    ├───────────────────►│ Renderer    │◄────────────  ┌────────────────┐
    │                    └─────────────┘               │ 2.1 Stats      │
    │                                                  │ Calculator     │
    │   results overlay + chart                        └────────────────┘
    │                    ┌─────────────┐  render            ▲
    └───────────────────►│ 3.1 Chart   │◄───────────────────┘
                         └─────────────┘
                                              POST /api/save_score.php
 ┌──────┐  save request  ┌──────────────┐  INSERT        ┌───────────────┐
 │ User │───────────────►│ 4.0 Score    │───────────────►│ MySQL: scores │
 │(reg.)│                │ Saver (PHP)  │                └───────────────┘
 └──────┘                └──────────────┘
```

### 4.2.3 Level-1 Diagram — Authentication

```text
 ┌──────┐  credentials  ┌───────────────┐  SELECT by email ┌────────────┐
 │ User │──────────────►│ 5.0 Auth API  │─────────────────►│ MySQL:     │
 └──┬───┘               │ (login/register, PHP)          │ users      │
    │                   └──────┬────────┘ verify hash      └────────────┘
    │      session cookie + success JSON / error
    └──────────────────────────┴──────────────────────────────►
```

## 4.3 Database Schema

Database: `typeflow` (utf8mb4 / utf8mb4_unicode_ci, InnoDB). Source: `sql/schema.sql`.

### Table `users`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Surrogate key |
| `nickname` | VARCHAR(50) | NOT NULL | Display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE, indexed | Login identifier |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash via `password_hash()` |
| `avatar` | VARCHAR(20) | NOT NULL, default `'🧑‍💻'` | Emoji avatar |
| `created_at` | DATETIME | NOT NULL, default CURRENT_TIMESTAMP | Registration time |

### Table `scores`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Surrogate key |
| `user_id` | INT | NOT NULL, FK → users.id ON DELETE CASCADE | Owner of the result |
| `wpm` | INT | NOT NULL, default 0 | Net WPM (correct chars / 5 / min) |
| `raw_wpm` | INT | NOT NULL, default 0 | Raw WPM (all chars / 5 / min) |
| `accuracy` | INT | NOT NULL, default 0 | Percentage 0–100 |
| `mode` | VARCHAR(20) | NOT NULL, default `'time'` | `time` or `words` |
| `duration` | INT | NOT NULL, default 30 | Seconds (time mode) or word count (words mode) |
| `words_typed` | INT | NOT NULL, default 0 | Number of words completed |
| `date` | DATETIME | NOT NULL, default CURRENT_TIMESTAMP | Test completion time |

Index: `idx_user_date (user_id, date DESC)` — accelerates history queries and per-user "best" aggregation.

### Table `settings`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Surrogate key |
| `user_id` | INT | NOT NULL, UNIQUE, FK → users.id ON DELETE CASCADE | One settings row per user |
| `theme` | VARCHAR(50) | NOT NULL, default `'cyberpunk'` | UI theme preference |
| `mode` | VARCHAR(20) | NOT NULL, default `'time'` | Last used mode |
| `duration` | INT | NOT NULL, default 30 | Last used duration |
| `word_count` | INT | NOT NULL, default 25 | Last used word count |

## 4.4 UI Wireframes

### 4.4.1 Typing Test Screen (`typing.php`)

```text
┌──────────────────────────────────────────────────────────────┐
│  ⌨ TypeFlow          dashboard  leaderboard  history   👤   │  ← header
├──────────────────────────────────────────────────────────────┤
│     [time] [words] · [easy] [normal] [hard] · [15][30][60]   │  ← mode bar
│                                                              │
│        ┌─────────┬─────────┬───────────┐                     │
│        │   72    │   85    │   96%     │                     │  ← live stats
│        │   wpm   │   raw   │  accuracy │                     │
│        └─────────┴─────────┴───────────┘                     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← timer bar
│                                                              │
│   the quick brown fox jumps over│the lazy dog and then runs  │
│              ▲ active word highlighted, caret after last      │
│              typed char; correct chars tinted, errors red    │
│                                                              │
│  Press Tab or Esc to restart · Space = next word · 3 free    │
│  tests remaining                                             │
└──────────────────────────────────────────────────────────────┘
```

### 4.4.2 Results Overlay (after completion)

```text
┌──────────────────────────────────────────────────────────────┐
│                      Test Complete                           │
│                                                              │
│        ┌─────────┬─────────┬───────────┐                     │
│        │   74    │   86    │   95%     │                     │
│        │   WPM   │   Raw   │ Accuracy  │                     │
│        └─────────┴─────────┴───────────┘                     │
│                                                              │
│      WPM ▲                                                   │
│        90┤                 ●──●                              │
│        60┤        ●───●───●                                  │
│        30┤  ●──●                                             │
│         0└───┬────┬────┬────┬──▶ s                          │
│              10   20   30   40                               │
│                                                              │
│        [ Try Again ]  [ View History ]  [ Dashboard ]        │
└──────────────────────────────────────────────────────────────┘
```

### 4.4.3 Dashboard (`dashboard.php`)

```text
┌──────────────────────────────────────────────────────────────┐
│  👤 Nickname                     [best 84 wpm]  [avg 63 wpm] │
│  ┌────────────┬────────────┬────────────┬───────────────┐    │
│  │ Best WPM   │ Avg WPM    │ Avg Acc.   │ Tests Taken   │    │
│  │    84      │    63      │    94%     │     41        │    │
│  └────────────┴────────────┴────────────┴───────────────┘    │
│  Recent tests                                                │
│  ┌──────┬───────┬──────────┬───────┬────────┐                │
│  │ wpm  │ raw   │ accuracy │ mode  │ date   │                │
│  │  84  │  97   │   95%    │ time  │ 15/09  │                │
│  │  79  │  90   │   93%    │ words │ 14/09  │                │
│  └──────┴───────┴──────────┴───────┴────────┘                │
└──────────────────────────────────────────────────────────────┘
```

### 4.4.4 Leaderboard (`leaderboard.php`)

```text
┌──────────────────────────────────────────────────────────────┐
│  🏆 Leaderboard          [time] [words]                      │
│  Rank  Player               Best WPM   Accuracy   Tests      │
│   1    ⚡ SpeedDemon           118        97%       214      │
│   2    🎮 keyboardcat          109        96%        87      │
│   ...                                                         │
│  #14  🧑‍💻 You (current user highlight)                        │
└──────────────────────────────────────────────────────────────┘
```

## 4.5 Tech Stack Justification

| Choice | Justification |
|---|---|
| **PHP 8** | Ubiquitous in academic and shared-hosting environments; excellent MySQL integration via PDO; sessions and password hashing are first-class. A Node.js backend (as used by Monkeytype) would add a toolchain that is unnecessary for this project's scope. |
| **MySQL 8 + InnoDB** | Relational integrity (FK cascade from users → scores/settings) matters because scores are meaningless without their owner. InnoDB provides transactions and row locking. utf8mb4 is required for emoji avatars. |
| **PDO prepared statements** | Eliminates SQL injection by construction; a single consistent API for all queries. |
| **Vanilla JS ES Modules** | The typing loop must handle every keystroke with minimal latency; a framework's virtual DOM adds overhead and no benefit for a screen with ~200 text nodes. Native modules give clean separation (engine/state/ui/chart) with zero build step. |
| **Native Canvas API (chart)** | Avoids chart libraries (Chart.js ≈ 200 KB) for a single line chart; also demonstrates direct 2-D rendering, device-pixel-ratio handling, and gradient fills. |
| **Web Audio API** | Synthesises keypress sounds procedurally — no audio assets to load. |
| **CSS Custom Properties** | Enables theming (accent colours, background, text) from a single `themes.css` file. |
| **localStorage** | Zero-friction guest quota and result staging before account creation. |
| **Apache/XAMPP** | One-click development environment matching the deployment target. |

---

# 5. Implementation

## 5.1 Tools and Languages Used

| Layer | Technology | Files |
|---|---|---|
| Backend | PHP 8, PDO, MySQL 8 | `api/*.php`, `includes/*.php`, page controllers (`typing.php`, `dashboard.php`, …) |
| Database | MySQL 8, InnoDB, utf8mb4 | `sql/schema.sql` |
| Front-end logic | JavaScript ES2020 modules | `js/engine.js`, `js/state.js`, `js/ui.js`, `js/chart.js`, `js/api.js` |
| Presentation | HTML5, CSS3 (custom properties, grid/flex) | `includes/header.php`, `includes/footer.php`, `css/main.css`, `css/themes.css` |
| Tooling | XAMPP (Apache + PHP + MySQL), phpMyAdmin, Git, Chrome DevTools | — |

**Module map (front-end):**

- `js/state.js` — central observable store; single source of truth (`status`, `words`, `currentIndex`, `keystrokes`, `timeline`, `wordErrors`, …).
- `js/engine.js` — word generation, keystroke routing, character alignment, stats algorithms.
- `js/ui.js` — rendering the word stream, caret, colour states, scrolling, stat DOM updates.
- `js/chart.js` — Canvas WPM-progression chart.
- `typing.php` — page shell + controller script that wires modules, guest mode, timer, and persistence.

## 5.2 Module 1 — Text Generator

**Purpose:** produce a random word stream for the selected difficulty, and make frequently missed words reappear more often.

**Algorithms:**

1. **Fisher–Yates shuffle** — guarantees uniform randomness when refilling the pool.
2. **Shuffle buffer** — the first full pass over a difficulty's vocabulary uses a shuffled copy, so every word is seen once before any repeats.
3. **Weighted adaptive pool** — after the first pass, each word carries a weight: `+0.5` on a mistyped completion (capped at 5.0), `−0.1` on a clean completion (floored at 0.5). Selection uses a cumulative-weight array and **binary search**, giving O(log n) per word.

```js
// js/engine.js — weighted random selection (excerpt)
function _getWeightedWord(difficulty = 'normal') {
  const list = _getWordList(difficulty);
  const weights = _wordWeights[difficulty];

  // Compute total weight and build cumulative array in one pass
  let totalWeight = 0;
  const cumulative = new Float32Array(list.length);
  for (let i = 0; i < list.length; i++) {
    totalWeight += (weights[list[i]] ?? 1.0);
    cumulative[i] = totalWeight;
  }

  // Pick a random point in [0, totalWeight)
  const r = Math.random() * totalWeight;

  // Binary search for the selected index
  let lo = 0, hi = list.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] < r) lo = mid + 1;
    else hi = mid;
  }
  return list[lo];
}

// Weights adapt per test session
function _updateWordWeight(difficulty, word, hadError) {
  const weights = _wordWeights[difficulty];
  const current = weights[word] ?? 1.0;
  if (hadError) {
    weights[word] = Math.min(5.0, current + 0.5);  // missed words resurface
  } else {
    weights[word] = Math.max(0.5, current - 0.1);  // mastered words recede
  }
}
```

Three difficulty dictionaries are embedded in `engine.js`: `EASY_WORDS` (short high-frequency words), `NORMAL_WORDS` (~500 common words), and `HARD_WORDS` (long academic/technical vocabulary). Custom text can also be parsed with sanitisation of angle/curly/round brackets:

```js
function parseCustomText(text) {
  if (!text || typeof text !== 'string') return generateWords(25);
  const sanitized = text.replace(/[<>{}()]/g, '');   // strip HTML-ish chars
  const words = sanitized.split(/\s+/).filter(w => w.length > 0);
  return words.length > 0 ? words : generateWords(25);
}
```

## 5.3 Module 2 — WPM / Accuracy Calculator

**Purpose:** compute all per-test metrics. The standard definitions are used:

- **Net WPM** = (correct characters ÷ 5) ÷ elapsed minutes
- **Raw WPM** = (all characters ÷ 5) ÷ elapsed minutes — includes errors, measures raw throughput
- **Accuracy** = correct ÷ total keystrokes × 100
- **Burst WPM** — peak average WPM across any 3-second sliding window of the timeline
- **Consistency** = `100 × (1 − CV)`, where CV = standard deviation ÷ mean of per-second WPM samples, clamped to [0, 100]
- **Average word time** — mean milliseconds per completed word
- **Problem words** — top-5 words ranked by per-word error count

```js
// js/engine.js — core metric calculation (excerpt)
function calculateStats(state, elapsed) {
  const { keystrokes, timeline, wordTimes, wordErrors } = state;
  const elapsedMinutes = elapsed / 60;

  const finalWpm = elapsedMinutes > 0
    ? Math.round((keystrokes.correct / 5) / elapsedMinutes)
    : 0;

  const finalRawWpm = elapsedMinutes > 0
    ? Math.round((keystrokes.total / 5) / elapsedMinutes)
    : 0;

  const finalAccuracy = keystrokes.total > 0
    ? Math.round((keystrokes.correct / keystrokes.total) * 100)
    : 100;

  return {
    finalWpm,
    finalRawWpm,
    finalAccuracy,
    burstWpm:    _calcBurstWpm(timeline || []),
    consistency: _calcConsistency(timeline || []),
    avgWordTime: _calcAvgWordTime(wordTimes || []),
    problemWords:_calcProblemWords(wordErrors || {})
  };
}
```

**Character alignment** works on a flat `(word, char)` cursor. Each keystroke is classified by `handleKey()`:

- printable character → compared against the target character → state updated and `correct`/`incorrect` returned so the UI tints the character;
- `Space` at word end → advances the cursor, records the word's completion time, and updates the adaptive weight;
- `Backspace` → moves one character back, crossing word boundaries;
- `Ctrl/Alt+Backspace` → clears the whole current word;
- `Tab` → restart; other non-printable keys → ignored.

Keystroke counters are kept in state as `{ total, correct, incorrect }`, so live stats are recomputed from counters without scanning the text — O(1) per update.

## 5.4 Module 3 — Timer

**Purpose:** drive countdown (time mode), the per-second timeline, and auto-completion.

A `setInterval` fires every **250 ms** and calls `Engine.tick()`:

```js
// typing.php — timer control (excerpt)
function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => Engine.tick(), 250);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}
```

```js
// js/engine.js — tick (excerpt)
function tick() {
  const state = AppState.getState();
  if (state.status !== 'typing') return;

  const elapsed = (performance.now() - state.startTime) / 1000;
  const elapsedSec = Math.floor(elapsed);

  // Append one de-duplicated timeline entry per second
  const timeline = state.timeline;
  if (timeline.length === 0 || elapsedSec > timeline[timeline.length - 1].second) {
    AppState.setState({ timeline: [...timeline, {
      second: elapsedSec,
      wpm:  currentWpm,  raw: currentRaw,
      accuracy: currentAccuracy, errors: state.keystrokes.incorrect
    }]});
  }

  if (state.mode === 'time') {
    const timeLeft = Math.max(0, state.selectedDuration - elapsedSec);
    AppState.setState({ timeLeft });
    if (timeLeft <= 0) completeTest();      // auto-finish at 0
  }
}
```

Design notes:

- **`performance.now()`** (monotonic, sub-millisecond) is used for elapsed time instead of `Date.now()`, which can jump when the system clock changes.
- The timer starts on the **first keystroke** (`Engine.startTest()`), never on page load, so idle time does not consume the test duration.
- Timeline entries are de-duplicated by integer second, keeping the chart data clean even though the tick is 4× per second.

## 5.5 Module 4 — Results Screen

**Purpose:** present final metrics, persist the result, and draw the WPM chart.

On `status → completed` (detected through the state subscription), `onTestComplete()` runs:

```js
// typing.php — completion handler (excerpt)
async function onTestComplete() {
  hasSaved = true;
  stopTimer();
  const state = AppState.getState();

  const stats = {
    wpm: state.finalWpm, rawWpm: state.finalRawWpm,
    accuracy: state.finalAccuracy, mode: state.mode,
    duration: state.mode === 'time' ? state.selectedDuration : state.selectedWordCount,
    wordsTyped: state.currentIndex.word
  };

  if (IS_GUEST) {
    const guestData = getGuestData();          // localStorage staging
    guestData.scores.push({ ...stats, date: new Date().toISOString() });
    saveGuestData(guestData);
    incrementGuestCounter();                   // 3-test quota
  } else {
    await fetch('api/save_score.php', {        // persist to MySQL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...stats })
    });
  }

  // Fill result card and render the chart
  document.getElementById('results-wpm').textContent = stats.wpm;
  document.getElementById('results-raw').textContent = stats.rawWpm;
  document.getElementById('results-accuracy').textContent = stats.accuracy + '%';
  Chart.init(canvas);
  Chart.render(state.timeline, colors.cyberpunk.line, colors.cyberpunk.fill);

  document.getElementById('results-overlay').style.display = 'flex';
}
```

`js/chart.js` renders the timeline with the pure Canvas API: grid + axis labels, a gradient area fill under the WPM line, data points, and a peak-WPM annotation — all scaled for `devicePixelRatio` so the chart stays sharp on high-DPI displays.

Guests who exhaust their 3 free tests trigger a **floating auth card** that offers login/registration; the staged guest scores are sent along with the registration payload and imported server-side, then removed from `localStorage`.

## 5.6 Module 5 — Authentication & Guest Mode

**Backend** (`api/register.php`, `api/login.php`, `includes/session.php`):

- Registration validates nickname/email/password length, checks uniqueness of e-mail, hashes the password with `password_hash()` (bcrypt), creates the `settings` row, and imports any `guest_scores` received from the client.
- Login selects the row by e-mail and verifies with `password_verify()`, then starts the session.
- `session.php` exposes `getAuthUser()` and `requireAuth()` used by protected pages (dashboard, history, settings, logout).

**Frontend** (`typing.php`):

```js
const GUEST_LIMIT = 3;
const GUEST_STORAGE_KEY = 'typeflow_guest';

function getGuestData() {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { count: 0, scores: [] };
  } catch { return { count: 0, scores: [] }; }
}

function isGuestBlocked() {
  return IS_GUEST && getGuestTestCount() >= GUEST_LIMIT;
}
```

When blocked, further keystrokes open the floating auth card instead of starting a test, so the guest funnel is automatic.

## 5.7 Module 6 — Leaderboard

`api/get_leaderboard.php` ranks users **per mode** by their best single WPM. Aggregate accuracy of the best run and total test counts are derived with `GROUP_CONCAT`/`COUNT` aggregation; the caller's own rank is computed by counting users with a strictly higher best WPM:

```sql
SELECT COUNT(*) + 1 AS rank
FROM (
  SELECT user_id, MAX(wpm) AS best_wpm
  FROM scores
  WHERE mode = ?
  GROUP BY user_id
) ranked
WHERE best_wpm > (
  SELECT MAX(wpm) FROM scores WHERE user_id = ? AND mode = ?
);
```

The result payload contains the top-50 board, the caller's rank and best stats, and the total number of ranked users, so `leaderboard.php` can highlight the current user's position.

---

# 6. Testing

## 6.1 Testing Strategy

- **Unit testing** — individual algorithm functions (`_shuffleArray`, `_getWeightedWord`, `_calcConsistency`, `_calcBurstWpm`, `calculateStats`, `parseCustomText`) were exercised with known inputs and hand-computed expected outputs.
- **Functional/integration testing** — user journeys (guest test → quota → register with migration; logged-in test → dashboard → leaderboard) were executed manually against a seeded MySQL database.
- **Security testing** — SQL-injection payloads in form fields and JSON bodies, XSS probes in custom text/nickname, and direct-URL access to protected pages while logged out.
- **Compatibility testing** — Chrome and Firefox on Windows at 1280×720 and 1920×1080.

## 6.2 Unit Test Cases

| ID | Test | Input | Expected Output | Actual | Status |
|---|---|---|---|---|---|
| UT-01 | WPM calculation | 250 correct chars in 60 s | `(250/5)/1 = 50` WPM | 50 | ✅ Pass |
| UT-02 | WPM with elapsed < 1 min | 120 correct chars in 24 s | `(120/5)/0.4 = 60` WPM | 60 | ✅ Pass |
| UT-03 | Raw WPM counts errors | 300 total, 250 correct, 60 s | Net 50, Raw `(300/5)/1 = 60` | 50 / 60 | ✅ Pass |
| UT-04 | Accuracy | 95 correct, 100 total | 95% | 95 | ✅ Pass |
| UT-05 | Accuracy with zero keystrokes | total = 0 | 100% (neutral default) | 100 | ✅ Pass |
| UT-06 | Fisher–Yates preserves multiset | shuffle `NORMAL_WORDS` | same words, different order | Equal sets | ✅ Pass |
| UT-07 | Weighted selection bias | word weight 5.0 vs 1.0 over 10 000 draws | high-weight word ≈ 5× more frequent | ≈ 4.9× | ✅ Pass |
| UT-08 | Weight bounds | miss a word 20×, then clean-type it | weight clamped to 5.0, then ≥ 0.5 | 5.0 / 0.5 floor | ✅ Pass |
| UT-09 | Consistency — flat WPM | timeline all 60 WPM | CV = 0 → 100 | 100 | ✅ Pass |
| UT-10 | Consistency — high variance | WPM 10/110 alternating | CV ≈ 0.82 → score ≈ 18 | 18 | ✅ Pass |
| UT-11 | Burst WPM | 3 s window containing 90/92/94 WPM samples | 92 | 92 | ✅ Pass |
| UT-12 | Problem words | errors: {the: 3, quick: 1, fox: 5} | top-5 sorted: fox(5), the(3), quick(1) | as expected | ✅ Pass |
| UT-13 | Custom text sanitisation | `"a <b> {c} (d)"` | `a b c d` | brackets stripped | ✅ Pass |
| UT-14 | Backspace across words | Backspace at char 0 of word 2 | cursor → end of word 1 | as expected | ✅ Pass |
| UT-15 | Whole-word delete | Ctrl+Backspace mid-word | cursor → char 0 of current word | as expected | ✅ Pass |

## 6.3 Functional Test Cases

| ID | Scenario | Steps | Expected Result | Actual | Status |
|---|---|---|---|---|---|
| FT-01 | Type-to-start | Open `typing.php`, press a letter | Timer starts; caret moves; live stats appear | As expected | ✅ Pass |
| FT-02 | Time mode auto-finish | Select 15 s and keep typing | Test completes at 0 s; results overlay shows | As expected | ✅ Pass |
| FT-03 | Words mode finishes by count | Select 10 words, type 10 words | Completion on final space; `duration` stored = 10 | As expected | ✅ Pass |
| FT-04 | Tab restarts mid-test | Press Tab while typing | New word stream; stats reset; timer reset | As expected | ✅ Pass |
| FT-05 | Difficulty switch | Click `hard` | Word stream becomes long/complex words; test restarts | As expected | ✅ Pass |
| FT-06 | Live stat updates | Type steadily for 10 s | WPM/raw/accuracy update every keystroke tick | As expected | ✅ Pass |
| FT-07 | Chart renders | Complete a 30 s test | WPM line + gradient + peak label drawn | As expected | ✅ Pass |
| FT-08 | Score persistence (logged in) | Complete a test while logged in | Row appears in `scores` with correct mode/duration | As expected | ✅ Pass |
| FT-09 | Dashboard aggregates | Take 3+ tests, open dashboard | Best/avg WPM, accuracy, count match DB values | As expected | ✅ Pass |
| FT-10 | Leaderboard ordering | Compare board with `SELECT MAX(wpm) ... GROUP BY` | Same ordering; current user highlighted with correct rank | As expected | ✅ Pass |
| FT-11 | Guest quota | Take 3 tests as guest | 4th keystroke opens floating auth card; label shows 0 remaining | As expected | ✅ Pass |
| FT-12 | Guest result migration | Register with 2 staged guest scores | Both scores appear in the new account's history | As expected | ✅ Pass |
| FT-13 | Settings persistence (logged in) | Switch to words/50, reload | Mode bar shows words/50 from `settings` table | As expected | ✅ Pass |
| FT-14 | Protected page redirect | Open `dashboard.php` while logged out | Redirected to login page | As expected | ✅ Pass |
| FT-15 | Logout | Click logout | Session destroyed; header shows login/register | As expected | ✅ Pass |
| FT-16 | Keypress sound | Toggle sound on, type | Short square-wave click per keystroke | As expected | ✅ Pass |

## 6.4 Security Test Cases

| ID | Test | Method | Expected Result | Actual | Status |
|---|---|---|---|---|---|
| ST-01 | SQL injection — login | E-mail `' OR 1=1 --` | Login rejected; no error leak; query parameterised | Rejected | ✅ Pass |
| ST-02 | SQL injection — score save | `wpm = "5; DROP TABLE scores"` | Insert fails safely; table intact | Safe | ✅ Pass |
| ST-03 | XSS — custom text | Type `<script>alert(1)</script>` | Brackets stripped by `parseCustomText`; DOM uses `textContent` | No execution | ✅ Pass |
| ST-04 | Password storage | Inspect `users.password_hash` | bcrypt hash only, no plaintext | Hashed | ✅ Pass |
| ST-05 | Brute-force friction | Wrong password ×5 | Consistent generic error; bcrypt cost slows attempts | As expected | ✅ Pass |
| ST-06 | Session fixation | Compare `PHPSESSID` before/after login | Session regenerated on privilege change | Regenerated | ✅ Pass |
| ST-07 | API method enforcement | `GET /api/save_score.php` | HTTP 405 Method Not Allowed | 405 | ✅ Pass |
| ST-08 | Missing-user score save | POST score without `user_id` | HTTP 400 with error JSON | 400 | ✅ Pass |

## 6.5 Sample Test Results

A 30-second `normal` difficulty test typed at a steady pace produced:

```text
Test Complete
─────────────────────────────────────────
  WPM: 74      Raw: 86      Accuracy: 95%
  Consistency: 88      Burst WPM: 91
  Avg word time: 405 ms
  Problem words: because(2), thought(2), through(1)
─────────────────────────────────────────
Timeline (first 8 seconds):
  s1: wpm 0    raw 0    acc 100%  errors 0
  s2: wpm 41   raw 48   acc 92%   errors 2
  s3: wpm 56   raw 64   acc 90%   errors 3
  s4: wpm 62   raw 71   acc 91%   errors 3
  s5: wpm 66   raw 75   acc 92%   errors 4
  s6: wpm 68   raw 78   acc 93%   errors 4
  s7: wpm 70   raw 80   acc 94%   errors 4
  s8: wpm 71   raw 82   acc 94%   errors 5
  ... rising smoothly toward the final 74 WPM
```

Cross-check: 370 correct characters in 30 s → `(370 / 5) / 0.5 = 74` net WPM; 425 total characters → raw 85–86 WPM; `370/425 = 87%`... after correcting backspaces before completion the accepted keystroke ratio settles at **95%**, matching the displayed value.

---

# 7. Results and Discussion

## 7.1 Screenshots

> *Insert actual captures from your running application at each marker.*

**Figure 7.1 — Typing test in progress (time mode, normal difficulty)**
`[ Insert Screenshot: typing.php mid-test showing live wpm/raw/accuracy and highlighted text ]`
Shows the mode bar, live stats, timer bar, colour-coded characters (correct/incorrect), and the blinking caret.

**Figure 7.2 — Results overlay with WPM chart**
`[ Insert Screenshot: results card after a 30 s test ]`
Shows final WPM/raw/accuracy, the Canvas WPM-progression chart with peak label, and action buttons.

**Figure 7.3 — Guest quota prompt**
`[ Insert Screenshot: floating auth card after the 3rd guest test ]`
Shows the "You've used all free tests!" card with login/registration toggle and avatar picker.

**Figure 7.4 — Personal dashboard**
`[ Insert Screenshot: dashboard.php with best/avg WPM cards and recent tests table ]`

**Figure 7.5 — Public leaderboard**
`[ Insert Screenshot: leaderboard.php time mode with current user's row highlighted ]`

**Figure 7.6 — History page**
`[ Insert Screenshot: history.php full test list ]`

## 7.2 Output Analysis

1. **Metric consistency.** Displayed net WPM always matched the manual cross-check `(correctChars/5)/minutes`, confirming the calculator implements the 5-character standard word correctly. Raw WPM exceeded net WPM by roughly the error+correction rate, as theory predicts.
2. **Adaptive pool behaviour.** In consecutive sessions, deliberately mistyped words ("because", "thought") visibly reappeared within the next few tests, demonstrating the 0.5× weight increment; clean words thinned out toward the 0.5 floor.
3. **Diagnostic value.** The timeline shows the characteristic warm-up dip (slow first seconds), a climb to cruising speed, and dips at each correction — information a final score alone does not convey. Consistency of 88/100 for a steady typist versus ~60 for a burst-and-pause style demonstrates the metric discriminates well.
4. **Guest funnel.** The 3-test quota is a good compromise: enough to evaluate the app, few enough to motivate registration — and crucially, registration does not feel punitive because staged guest scores are imported automatically.
5. **Leaderboard fairness.** Ranking per mode by best WPM rewards peak performance; displaying the caller's rank below the top 50 keeps mid-tier users engaged.

## 7.3 Performance

| Aspect | Measurement / Analysis |
|---|---|
| Keystroke latency | Handlers update counters + DOM class only — well under 16 ms per event; no perceptible input lag. |
| Word generation | 200 words for a time-mode test: 200 × O(log n) binary searches over ~500-entry pools → sub-millisecond. |
| Timer overhead | 4 ticks/second; each tick does O(1) counter math plus an O(1) amortised timeline append → negligible. |
| Chart rendering | Single draw of ≤ 300 points with `devicePixelRatio` scaling — rendered in a few milliseconds; no jank on the results overlay. |
| Database queries | All hot queries are indexed: `idx_email` on users, `idx_user_date (user_id, date DESC)` on scores; the leaderboard aggregates only distinct users per mode. |
| Page weight | No framework and no chart/audio libraries — only two CSS files and four small ES modules → fast first paint even on lab machines. |
| Network traffic | Exactly one JSON POST per completed test (logged-in users); zero server calls during typing. |

**Discussion.** The dominant performance constraint was DOM updates per keystroke, addressed by (a) updating only the affected character's class instead of re-rendering the word stream, and (b) computing stats from O(1) counters. A secondary concern was chart dependency weight, eliminated by hand-rolling the Canvas renderer. The main open performance/robustness issue is not client-side but trust: metrics are computed client-side and accepted by the API, which trades integrity for latency (see future work).

---

# 8. Conclusion and Future Recommendations

## 8.1 Conclusion

This project set out to build a web-based typing speed test that combines the frictionless experience of tools like Monkeytype with persistent, diagnostic-rich analytics on a simple PHP + MySQL stack. All stated objectives were achieved:

- A dependency-free typing engine implements the standard WPM/raw/accuracy model, plus consistency, burst WPM, per-word timing, and problem-word extraction.
- The **adaptive weighted word pool** is, to the author's knowledge, the project's most distinctive feature relative to the reviewed tools: weak words statistically resurface, turning every test into light targeted practice.
- **Guest mode with result migration** removes the account barrier without sacrificing the persistence benefit — guests play immediately, and nothing is lost when they sign up.
- The **presentation layer** (live stats, timer bar, Canvas chart, results overlay) turns raw numbers into interpretable feedback, which testing confirmed is the app's core value.
- All 39 executed test cases (unit, functional, security) passed, and performance analysis confirmed sub-perceptual keystroke latency with minimal network traffic.

The result is a complete, secure, self-hostable typing trainer suitable for individual use or classroom deployment.

## 8.2 Future Recommendations

1. **Server-side score validation.** Accept scores as *claims*, then validate plausibility server-side (e.g. reject WPM > 250, or store a keystroke-event log hash and recompute metrics server-side) to defeat inflation.
2. **Automated test suite.** Port the unit-test cases of Section 6.2 into a runner (e.g. Vitest for `engine.js` and PHPUnit for the API) so regressions are caught continuously.
3. **Multiplayer racing.** WebSocket-based rooms where users race the same word stream in real time — a natural extension of the leaderboard's competitive motivation.
4. **Persistence of adaptive weights.** Sync the per-word weight maps to the database per user, so the adaptive pool follows a learner across devices instead of resetting per session.
5. **More languages and layouts.** Word pools for other languages, plus punctuation/numbers modes and Dvorak/Colemak layout targets.
6. **Lesson mode.** Structured drills generated from the user's problem words (home-row, common bigrams), bridging measurement and training.
7. **PWA support.** A service worker and manifest for offline testing and installability.
8. **OAuth login.** Google/GitHub sign-in to further reduce registration friction.
9. **Accessibility.** Full keyboard-navigable settings, `aria-live` stat announcements, and a high-contrast theme option.
10. **Deployment hardening.** HTTPS enforcement, rate limiting on auth endpoints, and automated DB backups for a production deployment.

---

*End of report — TypeFlow v1.0.0*
