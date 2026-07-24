# Coding Rules & Boundaries

To maintain a high-performance, robust, and clean codebase, developers must adhere to these rules and boundaries when extending the Typing Speed Test App.

---

## 1. What to Use

### 1.1. Technical Choices
*   **Vanilla ES6+ JavaScript:** Use modular JavaScript (`import` and `export`) to keep code modularized and maintainable without complex build tooling.
*   **CSS Variables (Custom Properties):** Define all colors, typography sizes, and animation speeds in `css/themes.css`. JavaScript should never inject inline hexadecimal/RGB colors; it must change classes or modify CSS Variable styles.
*   **Web Storage (LocalStorage):** Save user scores, preferred themes, and user settings locally. Ensure strict error handling is wrapped around the serialization/deserialization steps.
*   **Web Audio API (Optional):** If key clicks or sound feedbacks are implemented, use light, low-latency synthesized sounds or cached small assets via Web Audio API.

### 1.2. Error Handling & Boundaries
*   **Safe LocalStorage Access:** Wrapping store operations in `try-catch` blocks is mandatory (avoids failures in browser environments like Safari Incognito or corporate security profiles).
*   **Input Sanitization:** Sanitize custom user text input modes using standard DOM node replacement rather than direct `innerHTML` modifications to prevent potential XSS vulnerabilities.
*   **Fail-safe Initialization:** Fallback to fallback words (a built-in list of dictionary words) if external dictionary lists fail to load.

---

## 2. What to Avoid

### 2.1. Libraries and Bundlers
*   **No Heavy Frameworks:** Avoid introducing React, Vue, Angular, or jQuery. The typing interface requires low-latency rendering; direct DOM manipulation provides the fastest responsiveness.
*   **No Heavy Build Processes:** Avoid Webpack, Rollup, or complex compilers unless production optimization is explicitly requested. Run straight from local static dev environments (e.g., standard browser loading, simple live servers).
*   **No Hardcoded Styles:** Do not set style properties inside JavaScript files (e.g., `element.style.color = "#ff0000"`). Instead, apply semantic classes (e.g., `element.classList.add('error')`).

### 2.2. Common Pitfalls
*   **Layout Thrashing:** Avoid continuous DOM queries inside typing key listeners. Cache frequently accessed elements (such as target character nodes, caret positions, WPM values).
*   **Over-rendering:** Render only the active block of text rather than the entire test corpus if the user inputs very long custom documents.
*   **Timer drift:** Calculate timer intervals based on system timestamps (`performance.now()` or `Date.now()`) rather than assuming `setInterval` executes at precisely 1000ms boundaries.