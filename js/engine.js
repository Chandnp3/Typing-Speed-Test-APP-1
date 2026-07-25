/**
 * engine.js - Core Typing Engine
 * Word generation, keystroke parsing, character alignment, WPM/accuracy calculation
 */

import AppState from './state.js';

const Engine = (() => {
  // ---- Word Dictionaries by Difficulty ----
  // Easy: short, common 3-4 letter words
  const EASY_WORDS = [
    'the','and','for','are','but','not','you','all','can','had','her','was','one','our','out',
    'has','its','two','use','see','now','may','way','new','get','how','man','his','old','own',
    'set','say','sat','ran','run','big','red','hot','put','let','ask','men','say','few','got',
    'eat','bit','hit','sit','top','far','cut','yes','pay','fat','dog','cat','bed','cup','fun',
    'sun','big','box','buy','car','day','eat','end','eye','fly','god','hat','ice','joy','key',
    'law','leg','lie','lip','log','map','mix','net','oil','owe','pan','pen','pie','pin','pot',
    'raw','row','rub','sad','sea','sir','six','sky','son','tap','tea','tie','tin','tip','toe',
    'toy','van','war','wet','win','yet','age','ago','air','arm','art','bag','ball','band','bank',
    'base','bath','bear','beat','bell','best','bird','bite','blow','blue','boat','body','bomb',
    'bone','book','born','boss','both','burn','busy','cafe','cake','call','calm','camp','card',
    'care','case','cash','cast','cave','cell','chat','chip','city','club','coat','code','cold',
    'come','cook','cool','copy','cord','corn','cost','crew','crop','crowd','cure','dance','date',
    'dawn','dead','deal','dear','deep','deer','desk','diet','dirt','dish','dock','does','doll',
    'door','dose','down','draft','drag','draw','dress','drink','drop','drug','drum','dual','dull',
    'dumb','dump','dust','duty','each','earn','ease','east','edge','else','even','ever','evil',
    'exam','exit','face','fact','fail','fair','fake','fall','fame','farm','fast','fate','fear',
    'feed','feel','fell','fence','file','fill','film','find','fine','fire','firm','fish','five',
    'flag','flat','flee','flew','flex','flip','float','flood','floor','flow','flower','fold',
    'folk','fond','food','fool','foot','ford','fore','fork','form','fort','four','free','from',
    'fuel','full','fund','fuss','gain','game','gang','gape','garden','gas','gate','gather','gave',
    'gaze','gear','gift','girl','give','glad','glow','glue','goal','goat','goes','gold','golf',
    'gone','good','grab','grass','gray','grew','grin','grip','grow','guard','guess','guest',
    'guide','gulf','guy','habit','hail','hair','half','hall','hand','hang','happy','hard','harm',
    'harsh','harvest','hatch','hate','haul','have','head','heal','heap','hear','heat','heavy',
    'heel','held','hell','help','here','hero','hide','high','hill','hint','hire','hobby','hold',
    'hole','home','hook','hope','horn','horse','host','hotel','hour','house','huge','hull','hunt',
    'hurt','husband','ice','idea','inch','into','iron','island','item','jacket','jail','jam','jar',
    'jaw','jazz','jeans','jet','jewel','job','join','joke','joy','judge','juice','jump','just',
    'keen','keep','ketch','key','kick','kid','kill','kind','king','kiss','kitchen','knee','knife',
    'knock','knot','know','label','lace','lack','lady','lake','lamp','land','lap','large','last',
    'late','laugh','launch','law','lay','lazy','lead','leaf','league','lean','leap','learn','lease',
    'leave','left','leg','legal','lemon','lend','length','lesson','let','letter','level','lie',
    'life','lift','light','like','limit','line','link','lion','lip','list','listen','little','live',
    'load','loan','lock','log','long','look','lord','lose','loss','lost','lot','loud','love','luck',
    'lunch','lung','mad','made','magic','main','make','man','many','map','march','mark','market',
    'mass','match','mate','may','maybe','mayor','meal','mean','measure','meat','meet','member',
    'menu','mere','mess','metal','meter','mid','might','mild','mile','milk','mill','mind','mine',
    'minor','minute','miss','mix','model','mom','moment','money','monk','month','mood','moon',
    'moral','more','most','mother','motor','mountain','mouse','mouth','move','movie','much','mud',
    'music','myth','nail','name','narrow','nation','native','nature','near','nearly','neat','neck',
    'need','needle','neighbor','neither','nerve','nest','net','network','never','new','news','next',
    'nice','night','nine','noble','noise','none','noon','nor','norm','north','nose','not','note',
    'nothing','notice','novel','now','number','nurse','nut','oak','object','observe','obtain','occupy',
    'ocean','odd','off','offer','office','often','oil','okay','old','olive','once','one','onion',
    'open','option','or','orange','orbit','order','organ','other','ought','ounce','our','outcome',
    'outer','output','oven','over','own','oxygen','pack','page','paid','pain','paint','pair','palace',
    'pan','panel','panic','paper','parent','park','part','party','pass','passage','past','path','pause',
    'pay','peace','peak','pen','pencil','people','per','period','permit','person','pet','phase','phone',
    'photo','phrase','piano','pick','picture','piece','pig','pile','pin','pink','pipe','plane','plant',
    'plate','play','player','pleasure','plenty','plug','plus','pocket','poem','poet','point','poison',
    'pole','police','pool','poor','popular','port','pose','position','post','potato','powder','power',
    'practice','pray','prefer','present','press','price','pride','prime','print','prior','prison',
    'private','prize','problem','process','produce','profit','program','project','proper','prove',
    'psychology','public','pull','pump','punish','pupil','purchase','pure','purpose','push','put',
    'quality','quarter','queen','question','quick','quiet','quit','quite','quote','race','radio','rain',
    'raise','range','rapid','rate','rather','raw','reach','read','ready','real','reason','receive',
    'record','red','region','reject','relate','release','relief','religion','rely','remain','remember',
    'remove','rent','repair','repeat','replace','report','represent','request','reset','resign','resist',
    'resolution','resolve','resource','respond','rest','restore','result','retain','retire','return',
    'reveal','review','revolution','reward','rhythm','rice','rich','ride','ring','riot','rise','risk',
    'river','road','rock','role','roll','romantic','roof','room','root','rope','rose','rough','round',
    'route','row','royal','rubber','rude','rug','rule','run','rural','rush','sacred','sad','safe',
    'safety','sail','salad','salary','sale','salt','same','sample','sand','satisfy','save','scale',
    'scene','school','science','score','screen','sea','search','season','seat','second','secret',
    'section','secure','seed','seek','select','self','sell','senate','send','senior','sense','sentence',
    'separate','sequence','serve','service','session','set','settle','seven','sex','shadow','shake',
    'shall','shape','share','sharp','she','sheet','shelf','shell','shelter','shift','shine','ship',
    'shirt','shock','shoe','shoot','shop','shore','short','shot','should','shoulder','shout','show',
    'shut','side','sight','sign','signal','silence','silver','similar','simple','sin','since','sing',
    'single','sink','sister','sit','site','situation','six','size','skill','skin','sky','slave','sleep',
    'slice','slide','slight','slip','slow','small','smart','smell','smile','smoke','smooth','snap','snow',
    'soap','social','society','soft','soil','solar','soldier','solid','solution','some','son','song',
    'soon','sort','sound','source','south','space','speak','special','speech','speed','spell','spend',
    'spirit','split','sport','spot','spread','spring','square','stable','staff','stage','stair','stand',
    'standard','star','stare','start','state','station','status','stay','steady','steal','steam','steel',
    'step','stick','still','stock','stomach','stone','stop','store','storm','story','stove','stream',
    'street','strength','stretch','strike','string','strip','strong','structure','student','study','stuff',
    'style','subject','submit','substance','succeed','success','such','suffer','sugar','suggest','summer',
    'sun','super','supply','support','suppose','sure','surface','surgery','surprise','surround','survey',
    'survive','suspect','sweet','swim','swing','switch','symbol','system','table','tail','take','tale',
    'talent','talk','tank','tape','target','task','taste','tax','teach','teacher','team','tear','telephone',
    'television','tell','ten','tend','tennis','term','test','text','than','thank','that','theme','then',
    'theory','therapy','there','thick','thin','thing','think','third','this','thought','thousand','thread',
    'threat','three','throat','through','throw','thumb','ticket','tide','tie','tight','till','time','tiny',
    'tip','tire','title','toast','today','together','tomorrow','tone','tongue','tonight','tool','tooth',
    'top','total','touch','tour','toward','tower','town','toy','track','trade','traffic','train','transfer',
    'transform','travel','treat','treatment','tree','trend','trial','tribe','trick','trip','troop','trouble',
    'truck','true','truly','trust','truth','try','tube','turn','twice','twin','type','uncle','under',
    'understand','unit','universe','university','unless','unlike','until','unusual','update','upon','upper',
    'upset','urban','urge','use','used','useful','user','usual','valley','value','van','variety','various',
    'vast','vehicle','venture','version','very','vessel','veteran','via','victim','victory','video','view',
    'village','violence','virtue','vision','visit','visual','vital','voice','volume','vote','wage','wait',
    'wake','walk','wall','wander','want','war','warm','warn','wash','waste','watch','water','wave','way',
    'weak','wealth','weapon','wear','weather','web','wedding','week','weekend','weight','welcome','well',
    'west','western','wet','wheel','when','where','whether','which','while','whisper','white','whole','wide',
    'wife','wild','will','win','wind','window','wine','wing','winner','winter','wire','wise','wish','with',
    'within','without','witness','woman','wonder','wood','word','work','worker','world','worry','worth',
    'would','wrap','write','writer','wrong','yard','year','yellow','yes','yesterday','yet','yield','you',
    'young','your','yourself','youth','zero','zone'
  ];

  // Normal: medium-difficulty words (current list ~500 common words)
  const NORMAL_WORDS = [
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

  // Hard: longer, more complex words
  const HARD_WORDS = [
    'abandon','ability','abolish','absolute','absorb','abstract','absurd','abundance','academic',
    'accelerate','acceptance','accessible','accompany','accomplish','account','accumulate','accurate',
    'achieve','acknowledge','acquire','activate','adaptation','adjustment','administration','admission',
    'adolescent','adoption','advancement','advantage','adventure','advertise','advocate','affection',
    'aggregate','aggressive','allocate','alternative','amateur','ambassador','ambiguous','ambition',
    'amendment','amplify','amusement','analysis','ancestor','ancient','announce','annoyance','anxiety',
    'apparatus','apparent','appeal','application','appointment','appreciate','approach','appropriate',
    'approval','arbitrary','architecture','argument','arrangement','articulate','artificial','ascertain',
    'aspiration','assault','assembly','assessment','assignment','assistance','association','assumption',
    'atmosphere','attachment','attempt','attendance','attention','attitude','attorney','attraction',
    'attribute','authority','automate','available','awareness','awkward','background','bankruptcy',
    'bargain','behavior','benchmark','beneath','beneficial','benevolent','biography','biological',
    'boundary','brilliant','broadcast','brochure','budget','bulletin','bureaucracy','calculation',
    'campaign','capability','capacity','capture','catalog','category','caution','celebration','ceremony',
    'certificate','challenge','champion','character','characteristic','circumstance','citizenship',
    'civilization','clarify','classic','classification','clientele','coincidence','collaborate',
    'collection','college','combination','commemorate','commence','commerce','commission','commitment',
    'commodity','communicate','community','companion','comparable','comparative','compassion',
    'compensation','competence','competition','complement','complexity','compliance','compliment',
    'component','comprehend','comprehensive','compromise','compulsory','conceal','conceive','concentrate',
    'concept','conception','concern','conclusion','concrete','condition','conduct','conference','confess',
    'confidence','configuration','confirm','conflict','conformity','confront','congress','connection',
    'consciousness','consequence','conservation','considerable','consistency','consolidate','conspicuous',
    'constitution','construct','consultation','consume','consumption','contemporary','contempt','contend',
    'content','contest','context','continent','continual','contract','contradiction','contribute',
    'controversy','convenience','convention','conversation','conversion','conviction','coordinate',
    'corporation','correction','correlation','correspondence','council','counsel','counterpart','courage',
    'creativity','credibility','criminal','criterion','critical','criticism','cultivate','curiosity',
    'currency','curriculum','custom','database','deadline','debate','debt','decade','deceive','decent',
    'deception','decision','declaration','decline','decoration','decrease','dedication','defeat','defect',
    'defense','deficiency','definition','degenerate','delegate','deliberate','delicate','delivery','demand',
    'democracy','demonstrate','denial','department','departure','dependence','deposit','depression','deputy',
    'derivative','descend','describe','description','desert','deserve','design','designate','desperate',
    'destination','destruction','detachment','detection','deteriorate','determination','develop','deviation',
    'device','diagnosis','dialogue','dietary','differential','difficulty','dimension','diminish','diploma',
    'direction','disability','disadvantage','disaster','discipline','disclosure','discount','discourse',
    'discovery','discretion','discrimination','discussion','disease','dismiss','disorder','displacement',
    'display','disposal','disposition','dispute','disruption','dissolve','distance','distinction',
    'distortion','distribution','district','diversity','documentation','domestic','dominance','donation',
    'dramatic','duration','dynamic','earnings','eccentric','ecology','economics','edition','education',
    'effectiveness','efficiency','elaborate','election','electricity','electronic','element','elevation',
    'eligibility','eliminate','embrace','emergency','emission','emotion','emphasis','empirical',
    'employment','enable','encompass','encounter','encouragement','endeavor','endorsement','enforcement',
    'engagement','engineering','enhancement','enormous','enterprise','enthusiasm','entitlement',
    'entrepreneur','environment','epidemic','equality','equation','equilibrium','equipment','equivalent',
    'erosion','essential','establishment','estate','estimate','evaluate','evaporation','eventually',
    'evidence','evolution','examination','exceed','excellence','exception','excess','exchange','excitement',
    'exclusion','exclusive','execution','executive','exemplary','exemption','exhaustive','exhibition',
    'existence','expansion','expectation','expedition','expenditure','experiment','expertise','explanation',
    'explicit','exploration','explosion','export','exposure','expression','extension','extensive','extent',
    'external','extinction','extraordinary','extreme','fabrication','facility','factor','faculty','familiar',
    'fantasy','fascination','fatigue','feasibility','feature','federal','feedback','fertility','fiction',
    'fierce','financial','flexibility','fluctuation','folklore','forecast','formation','formula','fortune',
    'fraction','franchise','frequency','friction','fulfillment','function','fundamental','furniture',
    'furthermore','gallery','gathering','genealogy','generalization','generation','generosity','genetics',
    'geography','geology','gesture','glacier','globalization','governance','gradual','grammatical','gratitude',
    'guarantee','guidance','handicap','harassment','harmony','hazard','headquarters','healing','heritage',
    'hierarchy','highlight','historical','hospitality','humanitarian','hypothesis','identical','identification',
    'identity','ignorance','illegal','illiteracy','illuminate','illustration','imaginary','imagination',
    'imitation','immediate','immense','immigration','immune','impact','impartial','implement','implication',
    'implicit','importance','imposition','impression','imprisonment','improvement','impulse','inability',
    'inappropriate','inauguration','incentive','incidence','incident','inclination','inclusion','income',
    'incorporate','incredible','independence','indication','indicator','indigenous','indispensable',
    'individual','inducement','industrial','inequality','inevitable','infancy','inflation','influence',
    'informal','information','infrastructure','ingredient','inhabitant','inheritance','initial','initiative',
    'injection','injury','innovation','input','inquiry','insight','inspection','inspiration','installation',
    'instance','institution','instruction','instrument','insurance','integrity','intellectual','intelligence',
    'intense','intention','interaction','interdisciplinary','interface','interference','interim','interior',
    'intermediate','internal','international','interpretation','interruption','intersection','intervention',
    'interview','intimate','intricate','introduction','intuition','invasion','invention','inventory',
    'investigation','investment','invitation','involvement','irrigation','isolation','jeopardy','journalism',
    'judgment','judicial','junction','jurisdiction','justification','knowledge','laboratory','landscape',
    'language','launch','lawsuit','legacy','legislation','legitimacy','leisure','liberal','liberty',
    'likelihood','limitation','linguistic','literacy','literature','litigation','logistics','longitude',
    'maintenance','management','manipulation','manufacturing','marginal','marriage','masterpiece','material',
    'mathematics','maturity','maximum','mechanism','mediation','medication','membership','memorial',
    'mentality','merchandise','metabolism','metaphor','methodology','metropolitan','migration','military',
    'millennium','mineral','minimal','minimum','ministry','misfortune','mission','mobility','moderate',
    'modification','molecular','monopoly','morality','mortality','motivation','municipal','mutation',
    'mutual','mysterious','narrative','navigation','necessity','negotiation','neighborhood','nerve',
    'neutral','nomination','nonprofit','normative','notable','notebook','notorious','nourishment','nuclear',
    'numerous','nutrition','obedience','objective','obligation','observation','obstacle','occupation',
    'offensive','official','offspring','operation','opinion','opponent','opportunity','opposition','optimism',
    'optional','orbit','orchestra','ordinance','ordinary','organization','orientation','original','orthodox',
    'outbreak','outcome','outdoor','outlook','output','outrage','outsider','overcome','overlook','overseas',
    'overwhelm','ownership','oxygen','paradox','paragraph','parallel','parameter','participation','particle',
    'passion','passive','password','patience','patient','patriotic','patronage','payment','peculiar','pedagogy',
    'penalty','penetration','pension','perceive','percentage','perception','performance','peripheral',
    'permanent','permission','persistence','personality','perspective','persuasion','phenomenon','philosophy',
    'photography','physician','placement','platform','pleasure','plentiful','pluralism','pneumonia','poetry',
    'polarization','police','policy','politician','pollution','popularity','population','portfolio','portrayal',
    'position','positive','possession','possibility','posterity','postpone','potential','poverty','practical',
    'pragmatic','precaution','precedent','precision','prediction','preference','pregnancy','prejudice',
    'preliminary','premise','premium','preparation','prescription','presentation','preservation','presidency',
    'prestige','presume','prevention','previous','primary','primitive','principal','prior','priority','privacy',
    'privilege','probability','procedure','proceeding','process','processor','production','productivity',
    'profession','proficiency','profit','profound','programming','progression','prohibition','projection',
    'prominent','promotion','proposal','proposition','prosecution','prospect','prosperity','protection',
    'protocol','province','provision','psychology','publication','publicity','purchase','pursuit','qualification',
    'qualitative','quantitative','quarterly','questionnaire','quota','radiation','radical','ratification',
    'rational','reaction','reality','realization','rebellion','recession','recipe','recognition','recommendation',
    'reconstruction','recreation','recruitment','reduction','redundancy','reference','reflection','reform',
    'refugee','refusal','regard','regeneration','regional','registration','regression','regulation',
    'rehabilitation','rehearsal','reimbursement','reinforcement','rejection','relationship','relativity',
    'relevance','reliability','religion','reluctance','remainder','remarkable','remedy','reminder','remission',
    'removal','renaissance','renewal','repetition','replacement','representation','reproduction','republic',
    'reputation','requirement','rescue','research','reservation','residence','residue','resignation',
    'resilience','resistance','resolution','resource','respectively','respiration','response','responsibility',
    'restoration','restraint','restriction','retail','retention','retirement','retrieval','revelation',
    'revenue','reversal','review','revision','revival','revolution','rhetoric','rigorous','romance','rotation',
    'sabotage','sacrifice','salvation','sanction','sanctuary','satellite','satisfaction','scarcity','scenario',
    'scheduling','scholarship','scientific','scrutiny','secondary','secrecy','secretariat','section','security',
    'segmentation','selection','sensation','sensitivity','sentence','sentiment','separation','sequence',
    'settlement','severity','sexuality','shelter','shortage','signature','significance','simulation',
    'skepticism','slavery','sociology','software','sophistication','sovereignty','specialization','specific',
    'spectacle','spectrum','speculation','spiritual','spokesperson','sponsorship','spontaneous','stability',
    'stakeholder','standardization','statistics','statute','stereotype','stimulus','stipulation','stochastic',
    'strategic','strategy','strength','structure','subcommittee','subdivision','subject','submission',
    'subordinate','subsequent','subsidy','substance','substitute','subtraction','succession','successor',
    'suffering','sufficiency','suggestion','summit','superintendent','superiority','supervision','supplement',
    'supplier','suppression','supremacy','surgery','surrender','surrogate','surveillance','survey','survival',
    'susceptibility','suspension','suspicion','symmetry','sympathy','symphony','symposium','symptom',
    'syndrome','synthesis','tactical','taxation','technical','technique','technology','telecommunications',
    'temperature','temporary','tendency','tension','termination','territory','testament','testimony',
    'threshold','timetable','tolerance','tradition','tragedy','transaction','transcription','transformation',
    'transgression','transition','translation','transmission','transparency','transportation','trauma',
    'treasury','treatment','treaty','tremendous','triathlon','tribunal','triumph','trivial','tuition',
    'turbulence','turnover','tyranny','ultimatum','uncertainty','undergraduate','understanding','unemployment',
    'unification','universe','university','unprecedented','upbringing','upgrade','usability','utilization',
    'vacuum','validation','validity','valuation','variation','vegetation','velocity','vendor','venture',
    'verdict','verification','version','veteran','viability','vicinity','victim','vigilance','violation',
    'virtue','visibility','visitor','vocabulary','volatile','voltage','volume','voluntary','vulnerability',
    'warehouse','warfare','warranty','warrior','weaponry','welfare','widespread','wilderness','withdrawal',
    'witness','workforce','workplace','workshop','xenophobia','yield','youngster','zodiac'
  ];

  // Pre-shuffle buffer for each difficulty
  const _shuffleBuffers = { easy: [], normal: [], hard: [] };
  const _shuffleIndices = { easy: 0, normal: 0, hard: 0 };

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
   * Get next random word using shuffle pool (avoids repeats until pool exhausted)
   */
  function _nextWord(difficulty = 'normal') {
    const list = _getWordList(difficulty);
    const buf = _shuffleBuffers[difficulty];
    const idx = _shuffleIndices[difficulty];

    if (idx >= buf.length) {
      buf.length = 0;
      buf.push(..._shuffleArray(list));
      _shuffleIndices[difficulty] = 0;
    }

    return buf[_shuffleIndices[difficulty]++];
  }

  // ---- Fast character comparison cache ----
  const _charCache = new Map();

  /**
   * Generate random words for a test (optimized with shuffle pool)
   * @param {number} count - Number of words to generate
   * @param {string} [difficulty='normal'] - 'easy' | 'normal' | 'hard'
   * @returns {string[]} Array of random words
   */
  function generateWords(count, difficulty = 'normal') {
    const words = new Array(count);
    for (let i = 0; i < count; i++) {
      words[i] = _nextWord(difficulty);
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
    getCurrentWpm
  };
})();

export default Engine;
