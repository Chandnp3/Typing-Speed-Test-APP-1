# Design System & Aesthetics

This document specifies the visual system, typography, color palettes, and interactive transitions for **TypeFlow**.

---

## 1. Typography & Fonts

### 1.1. Core Fonts
*   **Typing Area Font (Monospace):** `JetBrains Mono` (fallback: `Fira Code`, `monospace`). Monospaced characters ensure consistent width for alignment stability.
*   **UI Elements (Sans-Serif):** `Outfit` (fallback: `Inter`, `sans-serif`) for headers, buttons, dashboard, and auth forms.

### 1.2. Sizing Hierarchy
*   **Active Typing Text:** `28px` (line-height: `1`, letter-spacing: `0.05em`)
*   **Primary Headings:** `32px` (`Outfit`, bold)
*   **Sub-headings & Buttons:** `15px` (`Outfit`, medium)
*   **Metrics Displays:** `56px` (`Outfit`, light/regular)
*   **Auth Form Labels:** `12px` (uppercase, letter-spacing: `0.06em`)
*   **Dashboard Stats:** `28px` (`Outfit`, light)

---

## 2. Color Palettes & Themes

All themes use native CSS Custom Properties for instant switching.

### 2.1. Cyberpunk (Neon Tech)
*   `--background`: `#0b0e14` | `--text-bright`: `#00f0ff` | `--primary`: `#f0e600` | `--error`: `#ff0055`

### 2.2. Nord (Scandinavian Frost)
*   `--background`: `#2e3440` | `--text-bright`: `#eceff4` | `--primary`: `#88c0d0` | `--error`: `#bf616a`

### 2.3. Dark OLED (Minimalist)
*   `--background`: `#000000` | `--text-bright`: `#ffffff` | `--primary`: `#e0e0e0` | `--error`: `#ff3333`

### 2.4. Forest (Nature Sage)
*   `--background`: `#1a2421` | `--text-bright`: `#e8f1ee` | `--primary`: `#a3c9a8` | `--error`: `#e27396`

---

## 3. Component Design

### 3.1. Auth Cards (Login/Register)
*   Centered card with `var(--background-secondary)` background
*   Glassmorphism shadow: `0 8px 32px 0 rgba(0,0,0,0.3)`
*   Logo icon: 56px square with `var(--primary)` background
*   Input fields: `var(--background-tertiary)` background, `var(--primary)` focus border
*   Error messages: `var(--error-dim)` background, `var(--error)` text
*   Avatar selection: 48px circular buttons with scale + glow on selection

### 3.2. Dashboard
*   Profile header: avatar (72px), name, email, join date
*   Stats cards: 4-column grid, icon + value + label
*   Quick action buttons: horizontal rows with icon, text, and arrow
*   Hover effects: translateX(4px) shift, primary border glow
*   Recent tests: reuse `.history-item` component

### 3.3. Typing Area
*   Fixed height container (140px) with `overflow: hidden`
*   Single-line horizontal scrolling via `translateX()`
*   Smooth cubic-bezier transition (0.25s)
*   Words displayed as inline-block spans with margin

### 3.4. Animated Cursor Caret
*   `2.5px` wide vertical line, colored with `--caret-color`
*   Blinks slowly when idle (`@keyframes caretBlink`, 1.2s)
*   Static (no blink) when typing
*   Transitions smoothly via CSS `transition: left 0.08s ease`

### 3.5. Mode Selector
*   Pill-shaped groups with `var(--background-secondary)` background
*   Active state: `var(--primary)` background with dark text
*   Custom input: 52px number input with `var(--glass-border)` border

---

## 4. Micro-interactions

*   **Buttons:** `scale(1.02)` on hover, `scale(0.98)` on active
*   **Cards:** Border color transitions to `var(--primary-dim)` on hover
*   **Screens:** `fadeIn` animation (0.4s ease, translateY 12px)
*   **Error Flash:** `flashError` keyframe (0.2s, `var(--error-dim)` background)
*   **Theme Switch:** Instant via CSS Variable changes (no re-render)

---

## 5. Responsive Breakpoints

*   **Desktop (>640px):** Full layout, 4-column stats grid
*   **Mobile (≤640px):** Stacked layout, 2-column stats grid, reduced padding, smaller fonts
