/**
 * ui.js - DOM Manipulation, Theme Application, Micro-interactions
 */

import AppState from './state.js';
import Storage from './storage.js';

const UI = (() => {
  const _cache = {};
  let _caretEl = null;

  function init() {
    _cache.screens = {
      login: document.getElementById('screen-login'),
      register: document.getElementById('screen-register'),
      dashboard: document.getElementById('screen-dashboard'),
      typing: document.getElementById('screen-typing'),
      results: document.getElementById('screen-results'),
      settings: document.getElementById('screen-settings'),
      history: document.getElementById('screen-history')
    };
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
    _cache.resultsWpm = document.getElementById('results-wpm');
    _cache.resultsRaw = document.getElementById('results-raw');
    _cache.resultsAccuracy = document.getElementById('results-accuracy');
    _cache.historyTotal = document.getElementById('history-total');
    _cache.historyBest = document.getElementById('history-best');
    _cache.historyAvg = document.getElementById('history-avg');
    _cache.historyList = document.getElementById('history-list');
    _cache.themeOptions = document.querySelectorAll('.theme-option');
  }

  function showScreen(screenName) {
    const authScreens = ['login', 'register'];
    const isAuth = authScreens.includes(screenName);

    // Hide header/footer on auth screens
    if (_cache.header) _cache.header.classList.toggle('header--hidden', isAuth);
    if (_cache.footer) _cache.footer.classList.toggle('footer--hidden', isAuth);

    Object.values(_cache.screens).forEach(s => { if (s) s.classList.remove('screen--active'); });
    const target = _cache.screens[screenName];
    if (target) target.classList.add('screen--active');
  }

  function setHeaderVisible(visible) {
    if (_cache.header) _cache.header.classList.toggle('header--hidden', !visible);
    if (_cache.footer) _cache.footer.classList.toggle('footer--hidden', !visible);
  }

  function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    _cache.themeOptions?.forEach(opt => {
      opt.classList.toggle('theme-option--active', opt.dataset.theme === themeName);
    });
  }

  function renderTypingText(words) {
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

  function positionCaret(wordIndex, charIndex) {
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

  function updateCharStatus(wordIndex, charIndex, status) {
    if (!_cache.typingText) return;
    const wordEl = _cache.typingText.querySelector(`[data-word-index="${wordIndex}"]`);
    if (!wordEl || !wordEl.children[charIndex]) return;
    const charEl = wordEl.children[charIndex];
    charEl.classList.remove('char--correct', 'char--incorrect', 'char--active');
    if (status) charEl.classList.add(`char--${status}`);
  }

  function highlightActive(wordIndex, charIndex) {
    if (!_cache.typingText) return;
    _cache.typingText.querySelectorAll('.char--active').forEach(el => el.classList.remove('char--active'));
    const wordEl = _cache.typingText.querySelector(`[data-word-index="${wordIndex}"]`);
    if (wordEl) {
      const charEl = wordEl.children[charIndex];
      if (charEl) charEl.classList.add('char--active');
    }
    positionCaret(wordIndex, charIndex);
  }

  function scrollActiveWordIntoView(wordIndex) {
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
    if (newOffset !== currentOffset) _cache.typingText.style.transform = `translateX(${newOffset}px)`;
  }

  function updateStats(wpm, raw, accuracy) {
    if (_cache.statWpm) _cache.statWpm.textContent = wpm;
    if (_cache.statRaw) _cache.statRaw.textContent = raw;
    if (_cache.statAccuracy) _cache.statAccuracy.textContent = accuracy + '%';
  }

  function updateTimer(timeLeft, total) {
    if (_cache.timerFill) _cache.timerFill.style.width = (total > 0 ? (timeLeft / total) * 100 : 0) + '%';
  }

  function startTimer() {
    if (_cache.timerFill) {
      _cache.timerFill.style.transition = 'none';
      _cache.timerFill.style.width = '100%';
      _cache.timerFill.offsetHeight;
      _cache.timerFill.style.transition = '';
    }
  }

  function setActiveMode(mode) {
    _cache.modeButtons?.forEach(btn => btn.classList.toggle('mode-bar__btn--active', btn.dataset.mode === mode));
  }
  function setActiveDuration(duration) {
    _cache.durationButtons?.forEach(btn => btn.classList.toggle('mode-bar__btn--active', duration !== null && parseInt(btn.dataset.duration) === duration));
  }
  function setActiveWordCount(count) {
    _cache.wordCountButtons?.forEach(btn => btn.classList.toggle('mode-bar__btn--active', count !== null && parseInt(btn.dataset.wordcount) === count));
  }

  function showResults(stats) {
    if (_cache.resultsWpm) _cache.resultsWpm.textContent = stats.finalWpm;
    if (_cache.resultsRaw) _cache.resultsRaw.textContent = stats.finalRawWpm;
    if (_cache.resultsAccuracy) _cache.resultsAccuracy.textContent = stats.finalAccuracy + '%';
    showScreen('results');
  }

  function renderHistory() {
    const state = AppState.getState();
    if (!state.user) return;
    const stats = Storage.getAggregateStats(state.user.id);
    const scores = Storage.getScores(state.user.id);
    if (_cache.historyTotal) _cache.historyTotal.textContent = stats.totalTests;
    if (_cache.historyBest) _cache.historyBest.textContent = stats.bestWpm;
    if (_cache.historyAvg) _cache.historyAvg.textContent = stats.avgWpm;
    if (_cache.historyList) {
      _cache.historyList.innerHTML = '';
      if (scores.length === 0) {
        _cache.historyList.innerHTML = '<p style="text-align:center;color:var(--text-dim);padding:40px 0;">No tests completed yet. Start typing!</p>';
        return;
      }
      scores.slice(0, 20).forEach(score => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const d = new Date(score.date);
        item.innerHTML = `<div class="history-item__wpm">${score.wpm || 0}</div><div class="history-item__details"><div style="color:var(--text-bright);font-weight:500;">WPM</div><div>${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})} ${d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})} · ${score.mode||'time'} ${score.duration||30}s</div></div><div class="history-item__accuracy">${score.accuracy||0}%</div>`;
        _cache.historyList.appendChild(item);
      });
    }
  }

  function setCaretTyping(isTyping) { if (_caretEl) _caretEl.classList.toggle('caret--typing', isTyping); }
  function flashError() {
    if (_cache.typingText) { _cache.typingText.classList.add('flash-error'); setTimeout(() => _cache.typingText.classList.remove('flash-error'), 200); }
  }

  return { init, showScreen, setHeaderVisible, applyTheme, renderTypingText, positionCaret, updateCharStatus, highlightActive, scrollActiveWordIntoView, updateStats, updateTimer, startTimer, setActiveMode, setActiveDuration, setActiveWordCount, showResults, renderHistory, setCaretTyping, flashError, cache: _cache };
})();

export default UI;
