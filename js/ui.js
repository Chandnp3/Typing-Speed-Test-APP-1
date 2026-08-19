/**
 * ui.js - DOM Manipulation & Micro-interactions
 * Theme application, typing text rendering, caret, scrolling, stats.
 */

const _cache = {};
let _caretEl = null;

export function init() {
  _cache.screens = {};
  _cache.header = document.getElementById('app-header');
  _cache.footer = document.getElementById('app-footer');
  _cache.modeButtons = document.querySelectorAll('.mode-bar__btn[data-mode]');
  _cache.durationButtons = document.querySelectorAll('.mode-bar__btn[data-duration]');
  _cache.wordCountButtons = document.querySelectorAll('.mode-bar__btn[data-wordcount]');
  _cache.statWpm = document.getElementById('stat-wpm');
  _cache.statRaw = document.getElementById('stat-raw');
  _cache.statAccuracy = document.getElementById('stat-accuracy');
  _cache.timerFill = document.getElementById('timer-fill');
  _cache.typingText = document.getElementById('typing-text');
  // Primary results
  _cache.resultsWpm = document.getElementById('results-wpm');
  _cache.resultsRaw = document.getElementById('results-raw');
  _cache.resultsAccuracy = document.getElementById('results-accuracy');
  // Extended results (new)
  _cache.resultsBurst = document.getElementById('results-burst');
  _cache.resultsConsistency = document.getElementById('results-consistency');
  _cache.resultsAvgWordTime = document.getElementById('results-avg-word-time');
  _cache.resultsProblemSection = document.getElementById('results-problem-words-section');
  _cache.resultsProblemList = document.getElementById('results-problem-words');
  // History
  _cache.historyTotal = document.getElementById('history-total');
  _cache.historyBest = document.getElementById('history-best');
  _cache.historyAvg = document.getElementById('history-avg');
  _cache.historyList = document.getElementById('history-list');
  _cache.themeOptions = document.querySelectorAll('.theme-option');
}

export function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  if (_cache.themeOptions) {
    _cache.themeOptions.forEach(opt => {
      opt.classList.toggle('theme-option--active', opt.dataset.theme === themeName);
    });
  }
}

export function renderTypingText(words) {
  if (!_cache.typingText) return;
  _cache.typingText.innerHTML = '';
  words.forEach((word, wIdx) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    wordSpan.dataset.wordIndex = wIdx;
    [...word].forEach((char, cIdx) => {
      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.dataset.charIndex = cIdx;
      charSpan.textContent = char;
      wordSpan.appendChild(charSpan);
    });
    if (wIdx < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.className = 'char';
      spaceSpan.dataset.charIndex = word.length;
      spaceSpan.textContent = ' ';
      wordSpan.appendChild(spaceSpan);
    }
    _cache.typingText.appendChild(wordSpan);
  });
  _caretEl = document.createElement('div');
  _caretEl.className = 'caret';
  _cache.typingText.appendChild(_caretEl);
  positionCaret(0, 0);
  _cache.typingText.style.transform = 'translateX(0)';
}

export function positionCaret(wordIndex, charIndex) {
  if (!_caretEl || !_cache.typingText) return;
  const wordEl = _cache.typingText.querySelector(`[data-word-index="${wordIndex}"]`);
  if (!wordEl) return;
  let charEl = charIndex < wordEl.children.length ? wordEl.children[charIndex] : wordEl.children[wordEl.children.length - 1];
  if (charEl) {
    const rect = charEl.getBoundingClientRect();
    const containerRect = _cache.typingText.getBoundingClientRect();
    const atEnd = charIndex >= wordEl.children.length;
    _caretEl.style.left = (atEnd ? rect.right : rect.left) - containerRect.left + 'px';
    _caretEl.style.top = (rect.top - containerRect.top) + 'px';
    _caretEl.style.height = rect.height + 'px';
  }
}

export function updateCharStatus(wordIndex, charIndex, status) {
  if (!_cache.typingText) return;
  const wordEl = _cache.typingText.querySelector(`[data-word-index="${wordIndex}"]`);
  if (!wordEl || !wordEl.children[charIndex]) return;
  const charEl = wordEl.children[charIndex];
  charEl.classList.remove('char--correct', 'char--incorrect', 'char--active');
  if (status) charEl.classList.add(`char--${status}`);
}

export function highlightActive(wordIndex, charIndex) {
  if (!_cache.typingText) return;
  _cache.typingText.querySelectorAll('.char--active').forEach(el => el.classList.remove('char--active'));
  const wordEl = _cache.typingText.querySelector(`[data-word-index="${wordIndex}"]`);
  if (wordEl) {
    const charEl = wordEl.children[charIndex];
    if (charEl) charEl.classList.add('char--active');
  }
  positionCaret(wordIndex, charIndex);
}

export function scrollActiveWordIntoView(wordIndex) {
  if (!_cache.typingText || !_cache.typingText.parentElement) return;
  const wordEl = _cache.typingText.querySelector(`[data-word-index="${wordIndex}"]`);
  if (!wordEl) return;
  const container = _cache.typingText.parentElement;
  const containerRect = container.getBoundingClientRect();
  const wordRect = wordEl.getBoundingClientRect();
  const textRect = _cache.typingText.getBoundingClientRect();
  const currentTransform = _cache.typingText.style.transform;
  const match = currentTransform.match(/translateX\(([^)]+)\)/);
  const currentOffset = match ? parseFloat(match[1]) : 0;
  const wordRelativeRight = wordRect.right - containerRect.left;
  const wordRelativeLeft = wordRect.left - containerRect.left;
  const padding = 60;
  let newOffset = currentOffset;
  if (wordRelativeRight > containerRect.width - padding) {
    newOffset = currentOffset - (wordRelativeRight - containerRect.width * 0.3);
  } else if (wordRelativeLeft < padding) {
    newOffset = currentOffset + (padding - wordRelativeLeft);
  }
  const maxOffset = 0;
  const minOffset = -(textRect.width - containerRect.width + padding);
  newOffset = Math.max(minOffset, Math.min(maxOffset, newOffset));
  if (newOffset !== currentOffset) {
    _cache.typingText.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    _cache.typingText.style.transform = `translateX(${newOffset}px)`;
    setTimeout(() => { if (_cache.typingText) _cache.typingText.style.transition = ''; }, 150);
  }
}

export function updateStats(wpm, raw, accuracy) {
  if (_cache.statWpm) _cache.statWpm.textContent = wpm;
  if (_cache.statRaw) _cache.statRaw.textContent = raw;
  if (_cache.statAccuracy) _cache.statAccuracy.textContent = accuracy + '%';
}

export function updateTimer(timeLeft, total) {
  if (_cache.timerFill) {
    _cache.timerFill.style.width = (total > 0 ? (timeLeft / total) * 100 : 0) + '%';
  }
}

export function startTimer() {
  if (_cache.timerFill) {
    _cache.timerFill.style.transition = 'none';
    _cache.timerFill.style.width = '100%';
    _cache.timerFill.offsetHeight;
    _cache.timerFill.style.transition = '';
  }
}

export function setActiveMode(mode) {
  _cache.modeButtons?.forEach(btn => btn.classList.toggle('mode-bar__btn--active', btn.dataset.mode === mode));
}

export function setActiveDuration(duration) {
  _cache.durationButtons?.forEach(btn =>
    btn.classList.toggle('mode-bar__btn--active', duration !== null && parseInt(btn.dataset.duration) === duration)
  );
}

export function setActiveWordCount(count) {
  _cache.wordCountButtons?.forEach(btn =>
    btn.classList.toggle('mode-bar__btn--active', count !== null && parseInt(btn.dataset.wordcount) === count)
  );
}

export function setCaretTyping(isTyping) {
  if (_caretEl) _caretEl.classList.toggle('caret--typing', isTyping);
}

export function flashError() {
  if (_cache.typingText) {
    _cache.typingText.classList.add('flash-error');
    setTimeout(() => _cache.typingText.classList.remove('flash-error'), 200);
  }
}

/**
 * Show a named screen, hiding all others.
 * @param {string} screenId - e.g. 'typing', 'results', 'dashboard', 'history'
 */
export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('screen--active'));
  const target = document.getElementById(`screen-${screenId}`);
  if (target) target.classList.add('screen--active');
}

export function setHeaderVisible(visible) {
  if (_cache.header) _cache.header.style.display = visible ? '' : 'none';
}

/**
 * Populate the results screen with stats from the completed test.
 * Handles primary metrics (WPM, Raw, Accuracy) and all new extended
 * metrics (Burst WPM, Consistency, Avg Word Time, Problem Words).
 *
 * @param {object} stats
 * @param {number} stats.finalWpm
 * @param {number} stats.finalRawWpm
 * @param {number} stats.finalAccuracy
 * @param {number} [stats.burstWpm]
 * @param {number} [stats.consistency]
 * @param {number} [stats.avgWordTime]
 * @param {Array}  [stats.problemWords] - [{word, errors}]
 */
export function showResults(stats) {
  // Primary
  if (_cache.resultsWpm) _cache.resultsWpm.textContent = stats.finalWpm;
  if (_cache.resultsRaw) _cache.resultsRaw.textContent = stats.finalRawWpm;
  if (_cache.resultsAccuracy) _cache.resultsAccuracy.textContent = stats.finalAccuracy + '%';

  // Extended — Burst WPM
  if (_cache.resultsBurst) _cache.resultsBurst.textContent = stats.burstWpm ?? 0;

  // Extended — Consistency
  if (_cache.resultsConsistency) {
    _cache.resultsConsistency.textContent = (stats.consistency ?? 100) + '%';
  }

  // Extended — Avg Word Time
  if (_cache.resultsAvgWordTime) {
    const ms = stats.avgWordTime ?? 0;
    _cache.resultsAvgWordTime.textContent = ms > 0 ? ms + 'ms' : '—';
  }

  // Problem Words
  const problemWords = stats.problemWords || [];
  if (_cache.resultsProblemSection && _cache.resultsProblemList) {
    if (problemWords.length > 0) {
      _cache.resultsProblemSection.style.display = '';
      _cache.resultsProblemList.innerHTML = problemWords.map(pw =>
        `<span class="problem-word" title="${pw.errors} error${pw.errors !== 1 ? 's' : ''}">${pw.word}</span>`
      ).join('');
    } else {
      _cache.resultsProblemSection.style.display = 'none';
    }
  }

  showScreen('results');
}

/**
 * Render the history screen using scores from Storage.
 */
export function renderHistory() {
  // Import lazily to avoid a circular reference at module load time
  import('./storage.js').then(mod => {
    const Storage = mod.default;
    // Get current user id from session storage key
    const userId = Storage.getSession();
    if (!userId) return;
    const scores = Storage.getScores(userId);
    const stats  = Storage.getAggregateStats(userId);

    if (_cache.historyTotal) _cache.historyTotal.textContent = stats.totalTests;
    if (_cache.historyBest)  _cache.historyBest.textContent  = stats.bestWpm;
    if (_cache.historyAvg)   _cache.historyAvg.textContent   = stats.avgWpm;

    if (_cache.historyList) {
      _cache.historyList.innerHTML = '';
      if (scores.length === 0) {
        _cache.historyList.innerHTML = '<p class="dash-empty">No tests yet — start typing!</p>';
        return;
      }
      scores.forEach(score => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const d = new Date(score.date);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const consistency = score.consistency != null ? ` · ${score.consistency}% consist.` : '';
        const burstStr    = score.burstWpm    != null ? ` · ${score.burstWpm} burst`        : '';
        item.innerHTML = `
          <div class="history-item__wpm">${score.wpm || 0}</div>
          <div class="history-item__details">
            <div style="color:var(--text-bright);font-weight:500;">WPM</div>
            <div>${dateStr} ${timeStr} · ${score.mode || 'time'} ${score.duration || 30}s${burstStr}${consistency}</div>
          </div>
          <div class="history-item__accuracy">${score.accuracy || 0}%</div>`;
        _cache.historyList.appendChild(item);
      });
    }
  }).catch(err => console.warn('renderHistory: storage import failed', err));
}

export default {
  init, applyTheme, renderTypingText, positionCaret, updateCharStatus,
  highlightActive, scrollActiveWordIntoView, updateStats, updateTimer,
  startTimer, setActiveMode, setActiveDuration, setActiveWordCount,
  setCaretTyping, flashError, showScreen, setHeaderVisible, showResults, renderHistory
};
