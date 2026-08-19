/**
 * engine.js - Core Typing Engine
 * Word generation, keystroke parsing, character alignment, WPM/accuracy calculation.
 *
 * ALGORITHMS IMPLEMENTED:
 *  1. Fisher-Yates shuffle          — uniform random word distribution
 *  2. Weighted adaptive word pool   — frequently-missed words appear more often
 *  3. WPM / Raw WPM                 — (correct chars / 5) / elapsed minutes
 *  4. Burst WPM                     — peak WPM in any 3-second sliding window
 *  5. Consistency score             — 100 - (std-dev/mean * 100), clamped 0-100
 *  6. Per-word timing               — ms to complete each word
 *  7. Per-word error tracking       — miss count per word across sessions
 *  8. Extended timeline             — per-tick: wpm, raw, accuracy, errors, burst
 */

import AppState from './state.js';

const Engine = (() => {
  // ============================================================
  // Word Dictionaries by Difficulty
  // ============================================================

  // Easy: short, high-frequency 3-5 letter words
  const EASY_WORDS = [
    'the','and','for','are','but','not','you','all','can','had','her','was','one','our','out',
    'has','its','two','use','see','now','may','way','new','get','how','man','his','old','own',
    'set','say','ran','run','big','red','hot','put','let','ask','few','got','eat','bit','hit',
    'sit','top','far','cut','yes','pay','fat','dog','cat','bed','cup','fun','sun','box','buy',
    'car','day','end','eye','fly','hat','ice','joy','key','law','leg','lie','lip','log','map',
    'mix','net','oil','pan','pen','pie','pin','pot','raw','row','rub','sad','sea','six','sky',
    'son','tap','tea','tie','tin','tip','toe','toy','van','war','wet','win','yet','age','ago',
    'air','arm','art','bag','ball','band','bank','base','bath','bear','beat','bell','best',
    'bird','bite','blow','blue','boat','body','bone','book','boss','both','burn','busy','cake',
    'call','calm','camp','card','care','case','cash','cave','cell','chat','chip','city','club',
    'coat','code','cold','come','cook','cool','copy','cord','corn','cost','crew','crop','cure',
    'dance','date','dawn','dead','deal','dear','deep','deer','desk','dirt','dish','dock','door',
    'dose','down','drag','draw','drop','drum','dust','duty','each','earn','ease','east','edge',
    'even','ever','evil','face','fact','fail','fair','fake','fall','fame','farm','fast','fear',
    'feed','feel','fell','file','fill','film','find','fine','fire','firm','fish','five','flag',
    'flat','flee','flew','flex','flip','flow','fold','folk','fond','food','fool','foot','fork',
    'form','fort','four','free','fuel','full','fund','gain','game','gang','gate','gave','gear',
    'gift','girl','give','glad','glow','glue','goal','goat','gold','golf','gone','good','grab',
    'gray','grew','grin','grip','grow','guy','hail','hair','half','hall','hand','hang','hard',
    'harm','hate','haul','have','head','heal','heap','hear','heat','heel','held','hell','help',
    'here','hero','hide','high','hill','hint','hire','hold','hole','home','hook','hope','horn',
    'host','hour','huge','hull','hunt','hurt','idea','inch','into','iron','item','jail','jam',
    'jar','jaw','jet','job','join','joke','jump','just','keen','keep','kick','kid','kill','kind',
    'king','kiss','knee','knot','know','lack','lady','lake','lamp','land','lap','last','late',
    'laugh','lead','leaf','lean','leap','learn','left','lend','lie','lift','like','line','link',
    'lion','list','live','load','loan','lock','long','look','lord','lose','loss','lot','loud',
    'love','luck','lung','made','main','make','many','mark','mass','mate','meal','mean','meat',
    'meet','mere','mess','mild','mile','milk','mill','mind','mine','miss','mode','monk','mood',
    'moon','more','most','move','much','mud','nail','name','near','neck','need','nice','nine',
    'none','noon','nor','nose','note','oak','odd','off','okay','once','open','our','oven','over',
    'pack','page','paid','pain','pair','pan','park','part','pass','path','pay','peak','pig',
    'pile','pink','pipe','play','plot','plug','plus','poem','poet','pole','pool','poor','port',
    'pose','post','pull','pump','pure','push','race','rain','raise','range','rate','read','real',
    'rent','rest','rice','rich','ride','ring','rise','risk','road','rock','role','roll','roof',
    'room','root','rope','rose','rough','round','route','row','rude','rug','rule','rush','safe',
    'sail','salt','same','sand','save','sea','seat','seed','self','sell','send','set','seven',
    'sex','shake','shape','share','sharp','sheet','shelf','shell','ship','shirt','shock','shoe',
    'shop','shore','short','shot','show','shut','side','sign','silk','sing','sink','site','six',
    'size','skin','sky','sleep','slip','slow','small','smart','smile','smoke','snap','snow',
    'soap','soft','soil','some','song','soon','sort','soul','space','speak','spend','spin',
    'split','spot','star','stay','stem','step','stick','still','stone','stop','store','storm',
    'story','stove','strip','stuff','style','such','sugar','suit','sure','surf','swim','tail',
    'tale','talk','tank','tape','task','taste','tax','team','tear','tell','ten','term','test',
    'text','than','that','theme','then','thick','thin','thing','think','this','thread','throw',
    'time','tiny','tire','title','tone','tool','tooth','tour','town','track','train','tree',
    'trend','trip','true','trust','try','tube','turn','twin','type','unit','upon','urge','used',
    'vast','very','view','vine','wait','walk','wall','want','warm','wash','wave','weak','wear',
    'week','well','west','when','wide','wife','wild','will','wind','wine','wing','wire','wise',
    'wish','word','work','yard','year','zero','zone'
  ];

  // Normal: ~500 common English words covering a broad vocabulary range
  const NORMAL_WORDS = [
    'about','above','across','action','actually','after','again','against','age','ago','agree',
    'ahead','almost','already','also','always','among','another','answer','anyone','anything',
    'around','away','back','basic','because','become','before','begin','behind','being','believe',
    'below','between','beyond','billion','bring','brother','build','business','call','came',
    'cannot','carry','cause','certain','chance','change','check','children','choose','claim',
    'clear','close','color','come','complete','concern','consider','continue','control','could',
    'country','create','current','daughter','decide','describe','despite','develop','different',
    'direct','discover','discuss','does','done','down','drive','during','each','early','earth',
    'economic','education','effect','effort','either','employee','enough','enter','entire','equal',
    'establish','even','event','every','exactly','example','exist','explain','face','factor',
    'family','father','field','figure','finally','follow','force','foreign','form','forward',
    'found','friend','from','front','fund','future','general','give','given','global','going',
    'good','government','group','growth','guide','happen','hard','have','health','help','here',
    'herself','himself','history','hold','human','identify','image','important','include',
    'increase','indicate','industry','instead','interest','into','issue','itself','just','keep',
    'knowledge','large','later','lead','learn','leave','level','light','likely','listen','little',
    'local','long','look','lose','loss','major','make','manage','many','market','mean','meet',
    'member','method','might','mind','model','money','month','more','mother','move','much','must',
    'national','nature','need','network','never','next','none','note','nothing','number','offer',
    'often','once','only','open','order','organization','other','over','own','parent','part',
    'people','perform','person','place','plan','play','point','policy','political','position',
    'possible','power','practice','present','price','problem','process','produce','program',
    'provide','public','purpose','question','quickly','quite','raise','rather','reach','reason',
    'receive','recent','reduce','region','relate','remain','remember','report','require','result',
    'return','reveal','right','role','rule','same','school','second','section','seek','seem',
    'series','serious','serve','service','several','show','significant','similar','simple',
    'since','situation','small','social','society','some','sometimes','south','speak','special',
    'specific','spend','staff','stand','standard','start','state','stay','still','story','strong',
    'student','study','subject','success','suggest','support','system','table','team','technology',
    'than','their','then','theory','there','these','they','thing','third','thought','thousand',
    'three','through','today','together','total','toward','traditional','training','travel',
    'treatment','turn','under','understand','unite','until','upon','usually','value','various',
    'very','view','voice','walk','watch','water','whether','which','while','whole','whose','wide',
    'within','without','woman','women','world','would','write','year','young','ability','accept',
    'access','account','achieve','actually','address','affect','afford','allow','already','apply',
    'approach','argue','assume','attention','attitude','audience','available','average','avoid',
    'balance','behavior','benefit','body','border','break','budget','capital','career','cause',
    'citizen','collect','college','common','community','compare','complex','connect','context',
    'contribute','conversation','cover','culture','customer','data','debate','decision','demand',
    'demonstrate','depend','design','detail','determine','direct','document','draw','dream',
    'drive','economy','effective','element','employ','energy','engage','enjoy','ensure','entire',
    'environment','equal','evaluate','evidence','expect','experience','express','extend','fail',
    'feature','feel','finance','fine','focus','forget','freedom','function','global','goal',
    'growth','happen','health','heart','highlight','hold','hope','house','identify','impact',
    'implement','improve','income','independent','information','initiative','input','inspire',
    'involve','knowledge','language','launch','leadership','learn','link','manage','matter',
    'measure','media','mission','moment','movement','operate','opinion','option','outcome',
    'output','participate','pass','pattern','performance','perspective','physical','positive',
    'potential','press','prevent','prior','process','professional','project','protect','provide',
    'quality','reach','reaction','realize','recognize','record','reflect','reform','relate',
    'release','rely','research','resolve','resource','respond','review','risk','science','security',
    'select','sense','share','skill','solution','source','specific','status','strategy','structure',
    'submit','test','transfer','trend','trust','type','understand','unique','update','user',
    'utilize','vision','volume','welcome','willing','window','write','achieve','agency','alert',
    'area','assign','base','calculate','capture','center','challenge','character','charge',
    'choice','circuit','claim','class','clear','code','collect','column','commit','condition',
    'confirm','conflict','content','core','criteria','cycle','decide','default','define','delete',
    'deliver','deploy','detect','device','display','distribute','domain','enable','enforce',
    'error','execute','filter','flag','format','frame','grant','handle','identify','input',
    'install','integrate','interface','internal','iterate','layer','limit','load','local','lock',
    'logic','lookup','loop','match','module','monitor','network','object','observe','obtain',
    'offset','output','override','parse','patch','persist','pipeline','plugin','port','priority',
    'process','query','queue','range','rebuild','refresh','register','render','replace','request',
    'require','reset','response','restore','result','return','route','runtime','schema','scope',
    'search','session','signal','sort','source','stack','state','store','string','switch','sync',
    'target','template','thread','timeout','token','track','trigger','type','update','validate',
    'value','variable','version','workflow','wrapper'
  ];

  // Hard: long, complex, academic and technical vocabulary
  const HARD_WORDS = [
    'abandon','ability','abolish','absolute','absorb','abstract','absurd','abundance','academic',
    'accelerate','acceptance','accessible','accompany','accomplish','accumulate','accurate',
    'achieve','acknowledge','acquire','activate','adaptation','adjustment','administration',
    'adolescent','adoption','advancement','adventure','advocate','affection','aggregate',
    'aggressive','allocate','alternative','ambassador','ambiguous','ambition','amendment',
    'amplify','amusement','analysis','ancestor','announce','annoyance','anxiety','apparatus',
    'application','appointment','appreciate','appropriate','approval','arbitrary','architecture',
    'arrangement','articulate','artificial','aspiration','assault','assembly','assessment',
    'assignment','assistance','association','assumption','atmosphere','attachment','attendance',
    'attitude','attorney','attraction','attribute','authority','automate','awareness','awkward',
    'bankruptcy','bargain','benchmark','beneficial','benevolent','biography','biological',
    'boundary','broadcast','bureaucracy','calculation','capability','category','celebration',
    'certificate','challenge','characteristic','circumstance','citizenship','civilization',
    'clarify','classification','coincidence','collaborate','commemorate','commence','commission',
    'commitment','communicate','compassion','compensation','competence','competition','complexity',
    'compliance','component','comprehend','comprehensive','compromise','compulsory','conceive',
    'concentrate','conception','conclusion','configuration','conformity','consciousness',
    'consequence','conservation','consistency','consolidate','constitution','construct',
    'consultation','contemporary','contradiction','controversy','conviction','coordinate',
    'corporation','correlation','correspondence','counterpart','creativity','credibility',
    'criterion','cultivation','curiosity','curriculum','database','deception','declaration',
    'dedication','deficiency','definition','deliberate','delicate','democracy','demonstrate',
    'dependence','depression','derivative','description','designation','destination','destruction',
    'deteriorate','determination','diagnosis','differential','disability','disadvantage',
    'disclosure','discourse','discrimination','displacement','disposition','disruption',
    'distinction','distribution','diversification','documentation','dominance','ecological',
    'economics','effectiveness','efficiency','elaborate','electricity','electronic','elevation',
    'eligibility','eliminate','emergency','emission','emphasis','empirical','employment',
    'encompass','encouragement','endorsement','enforcement','engineering','enhancement',
    'enterprise','enthusiasm','entitlement','entrepreneur','environment','epidemic','equality',
    'equilibrium','equivalent','establishment','evaluation','evaporation','evolution',
    'examination','excellence','exclusion','execution','exemplary','exemption','exhaustive',
    'exhibition','expansion','expectation','expedition','expenditure','experiment','expertise',
    'exploration','extraordinary','fabrication','feasibility','financial','flexibility',
    'fluctuation','forecast','formation','franchise','frequency','fulfillment','fundamental',
    'furthermore','genealogy','generalization','generosity','geography','globalization',
    'governance','grammatical','gratitude','guarantee','harassment','harmony','headquarters',
    'heritage','hierarchy','historical','humanitarian','hypothesis','identification','ignorance',
    'illustration','imagination','implication','imprisonment','improvement','inappropriate',
    'inauguration','incentive','inclination','incorporation','independence','indication',
    'indigenous','individual','inequality','inevitable','inflation','infrastructure','ingredient',
    'inheritance','innovation','inspection','inspiration','installation','institution',
    'instruction','insurance','integrity','intellectual','intelligence','interaction',
    'interdisciplinary','interference','intermediate','interpretation','intervention','intricate',
    'intuition','investigation','investment','involvement','irrigation','jeopardy','journalism',
    'jurisdiction','justification','laboratory','landscape','legislation','legitimacy','leisure',
    'likelihood','limitation','linguistic','literature','litigation','logistics','maintenance',
    'manipulation','manufacturing','masterpiece','mathematics','maturity','mechanism','mediation',
    'medication','membership','mentality','metabolism','metaphor','methodology','metropolitan',
    'migration','millennium','modification','molecular','monopoly','morality','mortality',
    'motivation','municipal','mysterious','navigation','necessity','negotiation','neighborhood',
    'nomination','nonprofit','nourishment','nutrition','obedience','obligation','observation',
    'occupation','offensive','offspring','operation','opponent','opportunity','opposition',
    'optimism','orchestra','ordinance','organization','orientation','orthodox','outbreak',
    'overlook','overwhelm','ownership','paradox','participation','patronage','pedagogy',
    'penetration','percentage','perception','performance','permanent','persistence','personality',
    'perspective','persuasion','phenomenon','philosophy','photography','placement','plentiful',
    'pluralism','polarization','population','portfolio','portrayal','possibility','postpone',
    'pragmatic','precaution','precedent','prediction','prejudice','preliminary','prescription',
    'presentation','preservation','presidency','prevention','probability','proceeding',
    'productivity','profession','proficiency','programming','progression','prohibition',
    'prominent','proposition','prosecution','prosperity','protocol','psychology','publication',
    'qualification','quantitative','questionnaire','radiation','ratification','realization',
    'rebellion','recession','recognition','recommendation','reconstruction','recruitment',
    'redundancy','reflection','rehabilitation','rehearsal','reimbursement','reinforcement',
    'relationship','relativity','reliability','reluctance','remarkable','renaissance','repetition',
    'representation','reproduction','reputation','reservation','resilience','resolution',
    'respectively','respiration','responsibility','restoration','restriction','retention',
    'revelation','revolution','rigorous','sabotage','sacrifice','satisfaction','scarcity',
    'scheduling','scholarship','scrutiny','secretariat','segmentation','sensation','sensitivity',
    'separation','settlement','significance','simulation','skepticism','sophistication',
    'sovereignty','specialization','spectacle','speculation','spokesperson','spontaneous',
    'stability','stakeholder','standardization','statistics','stereotype','stimulus',
    'stipulation','stochastic','strategy','subdivision','submission','subordinate','subsequent',
    'subsidy','substitute','succession','suffering','superintendent','supervision','supplement',
    'suppression','supremacy','susceptibility','suspension','symmetry','sympathy','symposium',
    'syndrome','synthesis','tactical','taxation','telecommunications','temperature','tendency',
    'termination','territory','testament','testimony','threshold','tolerance','tragedy',
    'transcription','transformation','transgression','transmission','transparency','transportation',
    'treasury','tremendous','tribunal','turbulence','tyranny','ultimatum','uncertainty',
    'undergraduate','unemployment','unprecedented','utilization','validation','valuation',
    'vegetation','velocity','verification','viability','vigilance','violation','vocabulary',
    'vulnerability','warfare','warranty','weaponry','widespread','wilderness','withdrawal',
    'workforce','workshop','xenophobia','youngster'
  ];

  // ============================================================
  // Weighted Adaptive Word Pool
  // ============================================================
  // Each difficulty has its own weight map: { [word]: weight }
  // Weight starts at 1.0, increases on miss, decreases on perfect type.
  const _wordWeights = { easy: {}, normal: {}, hard: {} };

  // Pre-shuffle buffer for initial random ordering
  const _shuffleBuffers = { easy: [], normal: [], hard: [] };
  const _shuffleIndices = { easy: 0, normal: 0, hard: 0 };

  /**
   * Fisher-Yates in-place shuffle for uniform random distribution.
   * Iterates backward, swapping current element with a randomly chosen
   * element from the unshuffled portion.
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
   * Get word list by difficulty
   */
  function _getWordList(difficulty) {
    switch (difficulty) {
      case 'easy': return EASY_WORDS;
      case 'hard': return HARD_WORDS;
      default: return NORMAL_WORDS;
    }
  }

  /**
   * Weighted random word selection.
   *
   * Algorithm: Build a cumulative weight array, pick a random value in
   * [0, totalWeight), then binary-search for the selected word.
   * Words with higher weights (more misses) are proportionally more likely
   * to be selected.
   *
   * @param {string} difficulty
   * @returns {string} A word from the list
   */
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

    // Binary search for the index
    let lo = 0, hi = list.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    return list[lo];
  }

  /**
   * Update a word's weight based on whether it was typed perfectly or had errors.
   *
   * @param {string} difficulty
   * @param {string} word
   * @param {boolean} hadError
   */
  function _updateWordWeight(difficulty, word, hadError) {
    const weights = _wordWeights[difficulty];
    const current = weights[word] ?? 1.0;
    if (hadError) {
      // Increase frequency for missed words (max cap 5.0)
      weights[word] = Math.min(5.0, current + 0.5);
    } else {
      // Slowly reduce frequency for mastered words (min floor 0.5)
      weights[word] = Math.max(0.5, current - 0.1);
    }
  }

  /**
   * Get next word using shuffle buffer for the first cycle (ensures every word
   * is seen before repeating), then falls back to weighted selection.
   */
  function _nextWord(difficulty = 'normal') {
    const list = _getWordList(difficulty);
    const buf = _shuffleBuffers[difficulty];
    const idx = _shuffleIndices[difficulty];

    // First pass: use classic shuffle buffer to guarantee full coverage
    if (idx < list.length) {
      if (buf.length === 0) {
        buf.push(..._shuffleArray(list));
      }
      return buf[_shuffleIndices[difficulty]++];
    }

    // Subsequent passes: use weighted selection so mistyped words reappear more
    return _getWeightedWord(difficulty);
  }

  // ============================================================
  // Consistency Score Algorithm
  // ============================================================
  /**
   * Calculate typing consistency from WPM timeline samples.
   *
   * Method: Compute the coefficient of variation (std-dev / mean) of all
   * WPM samples in the timeline, then invert it to a 0-100 score.
   * A perfectly consistent typist scores 100; high variance scores low.
   *
   * @param {Array<{wpm: number}>} timeline
   * @returns {number} Consistency score 0–100
   */
  function _calcConsistency(timeline) {
    const samples = timeline.map(t => t.wpm).filter(w => w > 0);
    if (samples.length < 2) return 100;

    const mean = samples.reduce((s, v) => s + v, 0) / samples.length;
    if (mean === 0) return 100;

    const variance = samples.reduce((s, v) => s + (v - mean) ** 2, 0) / samples.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean; // coefficient of variation

    // cv of 0 → consistency 100; cv of 1 → consistency 0; clamp to [0, 100]
    return Math.round(Math.max(0, Math.min(100, (1 - cv) * 100)));
  }

  // ============================================================
  // Burst WPM Algorithm
  // ============================================================
  /**
   * Calculate peak WPM achieved in any 3-second sliding window.
   *
   * For each timeline entry, look back up to 3 seconds in the timeline
   * and calculate the WPM across that window. Return the maximum.
   *
   * @param {Array<{second: number, wpm: number}>} timeline
   * @returns {number} Burst WPM
   */
  function _calcBurstWpm(timeline) {
    if (timeline.length < 2) {
      return timeline.length === 1 ? timeline[0].wpm : 0;
    }

    const WINDOW = 3; // seconds
    let burstWpm = 0;

    for (let i = timeline.length - 1; i >= 0; i--) {
      const end = timeline[i];
      // Find the earliest entry within the 3-second window
      let j = i;
      while (j > 0 && (end.second - timeline[j - 1].second) <= WINDOW) j--;

      // Average WPM across this window
      const windowSamples = timeline.slice(j, i + 1);
      const avgWpm = windowSamples.reduce((s, t) => s + t.wpm, 0) / windowSamples.length;
      if (avgWpm > burstWpm) burstWpm = avgWpm;
    }

    return Math.round(burstWpm);
  }

  // ============================================================
  // Average Word Time Algorithm
  // ============================================================
  /**
   * Calculate average milliseconds taken per word completion.
   * @param {number[]} wordTimes — array of ms per word
   * @returns {number} average ms
   */
  function _calcAvgWordTime(wordTimes) {
    if (!wordTimes || wordTimes.length === 0) return 0;
    return Math.round(wordTimes.reduce((s, t) => s + t, 0) / wordTimes.length);
  }

  // ============================================================
  // Problem Words Algorithm
  // ============================================================
  /**
   * Derive the top 5 most-missed words from the wordErrors map.
   * @param {{ [word: string]: number }} wordErrors
   * @returns {Array<{word: string, errors: number}>}
   */
  function _calcProblemWords(wordErrors) {
    return Object.entries(wordErrors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, errors]) => ({ word, errors }));
  }

  // ============================================================
  // Public Word Generation API
  // ============================================================
  /**
   * Generate random words for a test using the weighted adaptive pool.
   * @param {number} count - Number of words to generate
   * @param {string} [difficulty='normal'] - 'easy' | 'normal' | 'hard'
   * @returns {string[]}
   */
  function generateWords(count, difficulty = 'normal') {
    const words = new Array(count);
    for (let i = 0; i < count; i++) {
      words[i] = _nextWord(difficulty);
    }
    return words;
  }

  /**
   * Parse custom text into a word array, sanitizing special characters.
   * @param {string} text
   * @returns {string[]}
   */
  function parseCustomText(text) {
    if (!text || typeof text !== 'string') return generateWords(25);
    const sanitized = text.replace(/[<>{}()]/g, '');
    const words = sanitized.split(/\s+/).filter(w => w.length > 0);
    return words.length > 0 ? words : generateWords(25);
  }

  // ============================================================
  // Test Lifecycle
  // ============================================================
  /**
   * Initialize a new test with a pre-generated word array.
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
   * Start the test timer, recording the high-resolution start time.
   */
  function startTest() {
    const state = AppState.getState();
    if (state.status === 'typing') return;

    const now = performance.now();
    AppState.setState({
      status: 'typing',
      startTime: now,
      testStartTime: Date.now(),
      wordStartTime: now   // track start of first word
    });
  }

  // ============================================================
  // Keystroke Processing
  // ============================================================
  /**
   * Route a KeyboardEvent to the appropriate handler.
   * @param {KeyboardEvent} event
   * @returns {{ type: string, typed?: string }}
   */
  function handleKey(event) {
    const state = AppState.getState();

    // Modifier key combos — only allow Ctrl/Alt + Backspace
    if (event.ctrlKey || event.altKey || event.metaKey) {
      if ((event.ctrlKey || event.altKey) && event.key === 'Backspace') {
        return handleDeleteWord();
      }
      return { type: 'ignore' };
    }

    // Tab → restart shortcut
    if (event.key === 'Tab') {
      event.preventDefault();
      return { type: 'restart' };
    }

    // Ignore non-printable keys (except Backspace)
    if (event.key.length > 1 && event.key !== 'Backspace') {
      return { type: 'ignore' };
    }

    if (event.key === 'Backspace') return handleBackspace();

    return handleCharacter(event.key);
  }

  /**
   * Handle a printable character keystroke.
   * Tracks per-character correctness, per-word errors, and word completion timing.
   */
  function handleCharacter(key) {
    const state = AppState.getState();
    const { words, currentIndex, keystrokes, wordErrors } = state;

    if (currentIndex.word >= words.length) return { type: 'ignore' };

    const currentWord = words[currentIndex.word];

    // Space pressed at end of word → advance to next word
    if (currentIndex.char >= currentWord.length) {
      if (key !== ' ') return { type: 'ignore' };

      const newWordIndex = currentIndex.word + 1;
      const newKeystrokes = {
        total: keystrokes.total + 1,
        correct: keystrokes.correct + 1,
        incorrect: keystrokes.incorrect
      };

      // Record word completion time and update adaptive weight
      const now = performance.now();
      const wordTimeMs = state.wordStartTime ? (now - state.wordStartTime) : 0;
      const newWordTimes = [...(state.wordTimes || []), wordTimeMs];
      const wordHadError = (wordErrors[currentWord] ?? 0) > 0;
      const difficulty = state.difficulty || 'normal';
      _updateWordWeight(difficulty, currentWord, wordHadError);

      const isComplete = isTestComplete(newWordIndex);
      if (isComplete) completeTest();

      AppState.setState({
        currentIndex: { word: newWordIndex, char: 0 },
        keystrokes: newKeystrokes,
        wordTimes: newWordTimes,
        wordStartTime: now
      });

      return { type: 'space', typed: ' ' };
    }

    // Compare typed char against target char
    const targetChar = currentWord[currentIndex.char];
    const isCorrect = key === targetChar;

    const newKeystrokes = {
      total: keystrokes.total + 1,
      correct: keystrokes.correct + (isCorrect ? 1 : 0),
      incorrect: keystrokes.incorrect + (isCorrect ? 0 : 1)
    };

    // Track per-word errors for adaptive weighting and problem words
    let newWordErrors = wordErrors;
    if (!isCorrect) {
      newWordErrors = { ...wordErrors };
      newWordErrors[currentWord] = (newWordErrors[currentWord] ?? 0) + 1;
    }

    AppState.setState({
      currentIndex: { word: currentIndex.word, char: currentIndex.char + 1 },
      keystrokes: newKeystrokes,
      wordErrors: newWordErrors
    });

    return { type: isCorrect ? 'correct' : 'incorrect', typed: key };
  }

  /**
   * Handle single-character backspace — moves one character backward,
   * crossing word boundaries if at the beginning of a word.
   */
  function handleBackspace() {
    const state = AppState.getState();
    const { currentIndex } = state;

    if (currentIndex.char === 0 && currentIndex.word === 0) {
      return { type: 'ignore' };
    }

    let newWordIndex = currentIndex.word;
    let newCharIndex = currentIndex.char - 1;

    // Cross back to previous word if at char 0
    if (newCharIndex < 0 && newWordIndex > 0) {
      newWordIndex--;
      newCharIndex = state.words[newWordIndex].length;
    }

    AppState.setState({ currentIndex: { word: newWordIndex, char: newCharIndex } });
    return { type: 'backspace' };
  }

  /**
   * Handle Ctrl/Alt+Backspace — delete entire current word at once.
   */
  function handleDeleteWord() {
    const state = AppState.getState();
    const { currentIndex } = state;

    if (currentIndex.word === 0 && currentIndex.char === 0) {
      return { type: 'ignore' };
    }

    if (currentIndex.char > 0) {
      AppState.setState({ currentIndex: { word: currentIndex.word, char: 0 } });
    } else {
      const newWordIndex = Math.max(0, currentIndex.word - 1);
      AppState.setState({ currentIndex: { word: newWordIndex, char: 0 } });
    }

    return { type: 'backspace' };
  }

  // ============================================================
  // Completion Logic
  // ============================================================
  /**
   * Check if the test is complete given the current word index.
   */
  function isTestComplete(wordIndex) {
    const state = AppState.getState();
    if (state.mode === 'words' && wordIndex >= state.selectedWordCount) return true;
    if (state.mode === 'custom' && wordIndex >= state.words.length) return true;
    return false;
  }

  /**
   * Finalize the test, computing all stats and persisting them to state.
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

  // ============================================================
  // Stats Calculation — Enhanced Algorithm
  // ============================================================
  /**
   * Calculate all typing metrics from final state snapshot.
   *
   * Returns:
   *   finalWpm        — (correct chars / 5) / elapsed minutes
   *   finalRawWpm     — (total chars / 5) / elapsed minutes
   *   finalAccuracy   — correct / total * 100
   *   burstWpm        — peak WPM in any 3-second window
   *   consistency     — 0–100 stability score (inverse of WPM std-dev CV)
   *   avgWordTime     — average ms per completed word
   *   problemWords    — top-5 most missed words [{word, errors}]
   *
   * @param {object} state
   * @param {number} elapsed - seconds
   * @returns {object}
   */
  function calculateStats(state, elapsed) {
    const { keystrokes, timeline, wordTimes, wordErrors } = state;
    const elapsedMinutes = elapsed / 60;

    // Core metrics
    const finalWpm = elapsedMinutes > 0
      ? Math.round((keystrokes.correct / 5) / elapsedMinutes)
      : 0;

    const finalRawWpm = elapsedMinutes > 0
      ? Math.round((keystrokes.total / 5) / elapsedMinutes)
      : 0;

    const finalAccuracy = keystrokes.total > 0
      ? Math.round((keystrokes.correct / keystrokes.total) * 100)
      : 100;

    // Extended metrics
    const burstWpm = _calcBurstWpm(timeline || []);
    const consistency = _calcConsistency(timeline || []);
    const avgWordTime = _calcAvgWordTime(wordTimes || []);
    const problemWords = _calcProblemWords(wordErrors || {});

    return {
      finalWpm,
      finalRawWpm,
      finalAccuracy,
      burstWpm,
      consistency,
      avgWordTime,
      problemWords
    };
  }

  // ============================================================
  // Timer Tick
  // ============================================================
  /**
   * Called every 250ms during active typing.
   * Records an extended timeline entry per second:
   *   { second, wpm, raw, accuracy, errors }
   * Handles time-mode countdown and auto-completion.
   */
  function tick() {
    const state = AppState.getState();
    if (state.status !== 'typing') return;

    const elapsed = (performance.now() - state.startTime) / 1000;
    const elapsedSec = Math.floor(elapsed);
    const elapsedMin = elapsed / 60;

    const currentWpm = elapsed > 0
      ? Math.round((state.keystrokes.correct / 5) / elapsedMin)
      : 0;
    const currentRaw = elapsed > 0
      ? Math.round((state.keystrokes.total / 5) / elapsedMin)
      : 0;
    const currentAccuracy = state.keystrokes.total > 0
      ? Math.round((state.keystrokes.correct / state.keystrokes.total) * 100)
      : 100;

    // Append one entry per elapsed second (de-duped by second)
    const timeline = state.timeline;
    if (timeline.length === 0 || elapsedSec > timeline[timeline.length - 1].second) {
      const newTimeline = [...timeline, {
        second: elapsedSec,
        wpm: currentWpm,
        raw: currentRaw,
        accuracy: currentAccuracy,
        errors: state.keystrokes.incorrect
      }];
      AppState.setState({ timeline: newTimeline });
    }

    // Countdown timer for time mode
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

  // ============================================================
  // Real-Time WPM
  // ============================================================
  /**
   * Return current live WPM (suppressed for the first 0.5 seconds).
   */
  function getCurrentWpm() {
    const state = AppState.getState();
    if (!state.startTime || state.status !== 'typing') return 0;
    const elapsed = (performance.now() - state.startTime) / 1000;
    if (elapsed < 0.5) return 0;
    return Math.round((state.keystrokes.correct / 5) / (elapsed / 60));
  }

  // ============================================================
  // Word Stats Inspector
  // ============================================================
  /**
   * Get current word weight/accuracy stats for diagnostics or UI display.
   * @param {string} difficulty
   * @returns {Array<{word: string, weight: number}>} sorted by weight desc
   */
  function getWordStats(difficulty = 'normal') {
    const list = _getWordList(difficulty);
    const weights = _wordWeights[difficulty];
    return list
      .map(word => ({ word, weight: weights[word] ?? 1.0 }))
      .sort((a, b) => b.weight - a.weight);
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
    getWordStats
  };
})();

export default Engine;
