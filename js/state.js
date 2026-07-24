/**
 * state.js - Central State Store
 * Unidirectional state management for the Typing Speed Test App
 */

const AppState = (() => {
  let _state = {
    status: 'idle',       // 'idle' | 'typing' | 'completed'
    mode: 'time',         // 'time' | 'words' | 'custom'
    duration: 30,         // seconds (for time mode) or word count (for word mode)
    timeLeft: 30,
    words: [],            // Array of words generated for test
    currentIndex: {
      word: 0,
      char: 0
    },
    keystrokes: {
      total: 0,
      correct: 0,
      incorrect: 0
    },
    history: [],          // Array of { time, WPM, Acc } objects
    timeline: [],         // Second-by-second WPM and error records for charting
    startTime: null,      // performance.now() timestamp when typing started
    elapsedTime: 0,       // seconds elapsed
    testStartTime: null,  // Date.now() for display purposes
    selectedTheme: 'cyberpunk',
    selectedDuration: 30,
    selectedWordCount: 25,
    customText: '',
    user: null            // { nickname, avatar }
  };

  const _listeners = new Map();
  let _listenerId = 0;

  /**
   * Subscribe to state changes
   * @param {Function} callback - Called with (newState, changedKeys)
   * @returns {Function} Unsubscribe function
   */
  function subscribe(callback) {
    const id = _listenerId++;
    _listeners.set(id, callback);
    return () => _listeners.delete(id);
  }

  /**
   * Notify all subscribers of state changes
   */
  function _notify(changedKeys) {
    for (const callback of _listeners.values()) {
      try {
        callback({ ..._state }, changedKeys);
      } catch (e) {
        console.error('State listener error:', e);
      }
    }
  }

  /**
   * Get current state (returns a shallow copy)
   */
  function getState() {
    return { ..._state };
  }

  /**
   * Update state and notify listeners
   * @param {Object} partial - Partial state to merge
   */
  function setState(partial) {
    const changedKeys = Object.keys(partial);
    Object.assign(_state, partial);
    _notify(changedKeys);
  }

  /**
   * Reset typing-related state for a new test
   */
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

  /**
   * Reset entire application state
   */
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

  return {
    subscribe,
    getState,
    setState,
    resetTest,
    resetAll
  };
})();

export default AppState;
