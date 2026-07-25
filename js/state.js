/**
 * state.js - Central State Store
 * Unidirectional state management for the typing test.
 */

const AppState = (() => {
  let _state = {
    status: 'idle',       // 'idle' | 'typing' | 'completed'
    mode: 'time',         // 'time' | 'words'
    duration: 30,
    timeLeft: 30,
    words: [],
    currentIndex: { word: 0, char: 0 },
    keystrokes: { total: 0, correct: 0, incorrect: 0 },
    history: [],
    timeline: [],
    startTime: null,
    elapsedTime: 0,
    testStartTime: null,
    selectedTheme: 'cyberpunk',
    selectedDuration: 30,
    selectedWordCount: 25,
    customText: '',
    user: null
  };

  const _listeners = new Map();
  let _listenerId = 0;

  function subscribe(callback) {
    const id = _listenerId++;
    _listeners.set(id, callback);
    return () => _listeners.delete(id);
  }

  function _notify(changedKeys) {
    for (const callback of _listeners.values()) {
      try {
        callback({ ..._state }, changedKeys);
      } catch (e) {
        console.error('State listener error:', e);
      }
    }
  }

  function getState() {
    return { ..._state };
  }

  function setState(partial) {
    const changedKeys = Object.keys(partial);
    Object.assign(_state, partial);
    _notify(changedKeys);
  }

  function resetTest(overrides = {}) {
    const defaults = {
      status: 'idle',
      currentIndex: { word: 0, char: 0 },
      keystrokes: { total: 0, correct: 0, incorrect: 0 },
      history: [],
      timeline: [],
      startTime: null,
      elapsedTime: 0,
      testStartTime: null,
      timeLeft: _state.duration
    };
    setState({ ...defaults, ...overrides });
  }

  function resetAll() {
    _state = {
      status: 'idle',
      mode: 'time',
      duration: 30,
      timeLeft: 30,
      words: [],
      currentIndex: { word: 0, char: 0 },
      keystrokes: { total: 0, correct: 0, incorrect: 0 },
      history: [],
      timeline: [],
      startTime: null,
      elapsedTime: 0,
      testStartTime: null,
      selectedTheme: 'cyberpunk',
      selectedDuration: 30,
      selectedWordCount: 25,
      customText: '',
      user: null
    };
    _notify(Object.keys(_state));
  }

  return { subscribe, getState, setState, resetTest, resetAll };
})();

export default AppState;
