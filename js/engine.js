/**
 * engine.js - Core Typing Engine
 * Word generation, keystroke parsing, character alignment, WPM/accuracy calculation
 */

import AppState from './state.js';

const Engine = (() => {
  // ---- Word Dictionary (500 common English words) ----
  const WORD_LIST = [
    'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with',
    'he','as','you','do','at','this','but','his','by','from','they','we','say','her','she',
    'or','an','will','my','one','all','would','there','their','what','so','up','out','if',
    'about','who','get','which','go','me','when','make','can','like','time','no','just','him',
    'know','take','people','into','year','your','good','some','could','them','see','other',
    'than','then','now','look','only','come','its','over','think','also','back','after','use',
    'two','how','our','work','first','well','way','even','new','want','because','any','these',
    'give','day','most','us','find','here','thing','many','right','often','very','hand','high',
    'keep','large','last','never','old','same','tell','boy','did','let','too','while','great',
    'live','where','much','must','still','through','life','before','between','world','being',
    'under','house','again','place','young','part','head','school','every','left','system',
    'turn','move','real','might','such','own','off','down','need','both','however','number',
    'small','always','found','play','read','end','put','home','country','group','begin','seem',
    'another','follow','came','show','should','provide','problem','point','world','company',
    'program','question','work','government','number','night','point','home','water','room',
    'mother','area','money','story','fact','month','lot','study','book','eye','job','word',
    'business','issue','side','kind','head','house','service','friend','father','power','hour',
    'game','line','end','member','law','car','city','community','name','president','team',
    'minute','idea','body','information','back','parent','face','others','level','office',
    'door','health','person','art','war','history','party','result','change','morning',
    'reason','research','girl','guy','moment','air','teacher','force','education','dog',
    'car','student','heart','language','music','example','table','state','family',
    'market','letter','value','paper','science','space','field','role','market','south',
    'cost','media','technology','report','plan','view','position','sense','experience',
    'develop','record','model','class','system','form','knowledge','action','level',
    'type','process','product','structure','pattern','practice','performance','project',
    'design','approach','source','control','support','condition','program','policy',
    'function','context','feature','environment','response','network','material',
    'require','individual','determine','significant','maintain','establish','similar',
    'available','additional','particular','fundamental','current','present','earlier',
    'successful','continue','overall','physical','apparent','occur','consider','member',
    'period','section','reflect','already','receive','building','natural','remain',
    'effect','suggest','produce','second','period','region','social','political',
    'economic','scientific','important','national','cultural','military','general',
    'personal','certain','entire','private','foreign','original','domestic','certain',
    'major','modern','traditional','advanced','complex','simple','effective','different',
    'specific','common','particular','special','standard','general','basic','recent'
  ];

  // Pre-shuffle array for faster random generation
  const _shuffleBuffer = [];
  let _shuffleIndex = 0;

  /**
   * Fisher-Yates shuffle for uniform random distribution
   */
  function _shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Get next random word using shuffle pool (avoids repeats until pool exhausted)
   */
  function _nextWord() {
    if (_shuffleIndex >= _shuffleBuffer.length) {
      _shuffleBuffer.length = 0;
      _shuffleBuffer.push(..._shuffleArray(WORD_LIST));
      _shuffleIndex = 0;
    }
    return _shuffleBuffer[_shuffleIndex++];
  }

  // ---- Fast character comparison cache ----
  const _charCache = new Map();

  /**
   * Generate random words for a test (optimized with shuffle pool)
   * @param {number} count - Number of words to generate
   * @returns {string[]} Array of random words
   */
  function generateWords(count) {
    const words = new Array(count);
    for (let i = 0; i < count; i++) {
      words[i] = _nextWord();
    }
    return words;
  }

  /**
   * Parse custom text into word array
   * @param {string} text 
   * @returns {string[]}
   */
  function parseCustomText(text) {
    if (!text || typeof text !== 'string') return generateWords(25);
    // Sanitize: remove anything that's not a letter, space, number, or common punctuation
    const sanitized = text.replace(/[<>{}()]/g, '');
    const words = sanitized.split(/\s+/).filter(w => w.length > 0);
    return words.length > 0 ? words : generateWords(25);
  }

  /**
   * Initialize a new test with words
   */
  function initTest(words) {
    AppState.resetTest({
      words: words,
      duration: AppState.getState().mode === 'time'
        ? AppState.getState().selectedDuration
        : AppState.getState().selectedWordCount,
      timeLeft: AppState.getState().mode === 'time'
        ? AppState.getState().selectedDuration
        : Infinity,
      status: 'idle'
    });
  }

  /**
   * Start the test timer
   */
  function startTest() {
    const state = AppState.getState();
    if (state.status === 'typing') return;

    const now = performance.now();
    AppState.setState({
      status: 'typing',
      startTime: now,
      testStartTime: Date.now()
    });
  }

  /**
   * Process a keystroke
   * @param {KeyboardEvent} event
   * @returns {Object} { type: 'correct' | 'incorrect' | 'backspace' | 'ignore', typed: string }
   */
  function handleKey(event) {
    const state = AppState.getState();

    // Ignore modifier keys, function keys, etc.
    if (event.ctrlKey || event.altKey || event.metaKey) {
      // Allow Ctrl+Backspace / Alt+Backspace to delete whole word
      if ((event.ctrlKey || event.altKey) && event.key === 'Backspace') {
        return handleDeleteWord();
      }
      return { type: 'ignore' };
    }

    // Tab to restart
    if (event.key === 'Tab') {
      event.preventDefault();
      return { type: 'restart' };
    }

    // Ignore other non-printable keys
    if (event.key.length > 1 && event.key !== 'Backspace') {
      return { type: 'ignore' };
    }

    // Backspace
    if (event.key === 'Backspace') {
      return handleBackspace();
    }

    // Printable character
    return handleCharacter(event.key);
  }

  /**
   * Handle a printable character input
   */
  function handleCharacter(key) {
    const state = AppState.getState();
    const { words, currentIndex, keystrokes } = state;

    // Bounds check
    if (currentIndex.word >= words.length) {
      return { type: 'ignore' };
    }

    const currentWord = words[currentIndex.word];
    const targetChar = currentWord[currentIndex.char];

    if (currentIndex.char >= currentWord.length) {
      // Space to move to next word
      if (key === ' ') {
        const newWordIndex = currentIndex.word + 1;
        const newKeystrokes = {
          total: keystrokes.total + 1,
          correct: keystrokes.correct + 1,
          incorrect: keystrokes.incorrect
        };

        // Check if test is complete
        const isComplete = isTestComplete(newWordIndex);
        if (isComplete) {
          completeTest();
        }

        AppState.setState({
          currentIndex: { word: newWordIndex, char: 0 },
          keystrokes: newKeystrokes
        });

        return { type: 'space', typed: ' ' };
      }
      return { type: 'ignore' };
    }

    // Compare characters
    const isCorrect = key === targetChar;
    const newKeystrokes = {
      total: keystrokes.total + 1,
      correct: keystrokes.correct + (isCorrect ? 1 : 0),
      incorrect: keystrokes.incorrect + (isCorrect ? 0 : 1)
    };

    let newCharIndex = currentIndex.char + 1;
    let newWordIndex = currentIndex.word;

    // Update state with new position and keystrokes
    AppState.setState({
      currentIndex: { word: newWordIndex, char: newCharIndex },
      keystrokes: newKeystrokes
    });

    return { type: isCorrect ? 'correct' : 'incorrect', typed: key };
  }

  /**
   * Handle backspace
   */
  function handleBackspace() {
    const state = AppState.getState();
    const { currentIndex } = state;

    if (currentIndex.char === 0 && currentIndex.word === 0) {
      return { type: 'ignore' };
    }

    let newWordIndex = currentIndex.word;
    let newCharIndex = currentIndex.char - 1;

    // If at beginning of word (after space), go back to end of previous word
    if (newCharIndex < 0 && newWordIndex > 0) {
      newWordIndex--;
      newCharIndex = state.words[newWordIndex].length;
    }

    AppState.setState({
      currentIndex: { word: newWordIndex, char: newCharIndex }
    });

    return { type: 'backspace' };
  }

  /**
   * Handle Ctrl/Alt+Backspace - delete whole word
   */
  function handleDeleteWord() {
    const state = AppState.getState();
    const { currentIndex } = state;

    if (currentIndex.word === 0 && currentIndex.char === 0) {
      return { type: 'ignore' };
    }

    // If in the middle of a word, go to beginning of word
    if (currentIndex.char > 0) {
      AppState.setState({
        currentIndex: { word: currentIndex.word, char: 0 }
      });
    } else {
      // Go to beginning of previous word
      const newWordIndex = Math.max(0, currentIndex.word - 1);
      AppState.setState({
        currentIndex: { word: newWordIndex, char: 0 }
      });
    }

    return { type: 'backspace' };
  }

  /**
   * Check if the test is complete
   */
  function isTestComplete(wordIndex) {
    const state = AppState.getState();

    if (state.mode === 'words') {
      // Complete when we've reached or passed the target word count
      if (wordIndex >= state.selectedWordCount) {
        return true;
      }
    }

    if (state.mode === 'custom') {
      if (wordIndex >= state.words.length) {
        return true;
      }
    }

    return false;
  }

  /**
   * Complete the test
   */
  function completeTest() {
    const state = AppState.getState();
    const elapsed = (performance.now() - state.startTime) / 1000;
    const stats = calculateStats(state, elapsed);

    AppState.setState({
      status: 'completed',
      elapsedTime: elapsed,
      ...stats
    });
  }

  /**
   * Calculate WPM, Raw WPM, and Accuracy
   * @returns {Object} { finalWpm, finalRawWpm, finalAccuracy }
   */
  function calculateStats(state, elapsed) {
    const { keystrokes } = state;
    const elapsedMinutes = elapsed / 60;

    // WPM = (correct chars / 5) / time in minutes
    const finalWpm = elapsedMinutes > 0
      ? Math.round((keystrokes.correct / 5) / elapsedMinutes)
      : 0;

    // Raw WPM = (total keystrokes / 5) / time in minutes
    const finalRawWpm = elapsedMinutes > 0
      ? Math.round((keystrokes.total / 5) / elapsedMinutes)
      : 0;

    // Accuracy = (correct / total) * 100
    const finalAccuracy = keystrokes.total > 0
      ? Math.round((keystrokes.correct / keystrokes.total) * 100)
      : 100;

    return { finalWpm, finalRawWpm, finalAccuracy };
  }

  /**
   * Timer tick - called every second during typing
   */
  function tick() {
    const state = AppState.getState();
    if (state.status !== 'typing') return;

    const elapsed = (performance.now() - state.startTime) / 1000;
    const elapsedSec = Math.floor(elapsed);

    // Record timeline data
    const currentWpm = elapsed > 0 ? Math.round((state.keystrokes.correct / 5) / (elapsed / 60)) : 0;

    // Only add timeline entry for each new second
    if (state.timeline.length === 0 || elapsedSec > state.timeline[state.timeline.length - 1].second) {
      const newTimeline = [...state.timeline, {
        second: elapsedSec,
        wpm: currentWpm,
        errors: state.keystrokes.incorrect
      }];
      AppState.setState({ timeline: newTimeline });
    }

    // Time mode countdown
    if (state.mode === 'time') {
      const timeLeft = Math.max(0, state.selectedDuration - elapsedSec);
      if (timeLeft !== state.timeLeft) {
        AppState.setState({ timeLeft });
      }
      if (timeLeft <= 0) {
        completeTest();
      }
    }
  }

  /**
   * Get current WPM in real-time
   */
  function getCurrentWpm() {
    const state = AppState.getState();
    if (!state.startTime || state.status !== 'typing') return 0;
    const elapsed = (performance.now() - state.startTime) / 1000;
    if (elapsed < 0.5) return 0;
    return Math.round((state.keystrokes.correct / 5) / (elapsed / 60));
  }

  return {
    generateWords,
    parseCustomText,
    initTest,
    startTest,
    handleKey,
    tick,
    completeTest,
    calculateStats,
    getCurrentWpm,
    DEFAULT_WORDS
  };
})();

export default Engine;
