'use strict';

/* ════════════════════════════════════════
   DOM REFERENCES
════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const screens = { start: $('screen-start'), pick: $('screen-pick'), game: $('screen-game') };

const btnStart        = $('btn-start');
const btnReset        = $('btn-reset');
const btnGuess        = $('btn-guess');
const btnUndo         = $('btn-undo');
const btnClear        = $('btn-clear');
const btnPeek         = $('btn-peek');
const btnTurnMe       = $('btn-turn-me');
const btnTurnThem     = $('btn-turn-them');
const btnHelper       = $('btn-helper');
const btnHelperClose  = $('btn-helper-close');
const btnTimerToggle  = $('btn-timer-toggle');
const btnCloseGuess   = $('btn-close-guess');
const btnCancelGuess  = $('btn-cancel-guess');
const btnConfirmGuess = $('btn-confirm-guess');

const pickGrid      = $('pick-grid');
const gameGrid      = $('game-grid');
const guessGrid     = $('guess-grid');
const filterBar     = $('filter-bar');
const helperPanel   = $('helper-panel');
const helperContent = $('helper-content');

const myCharBadge = $('my-char-badge');
const myCharName  = $('my-char-name');

const elimNum   = $('elim-num');
const remainNum = $('remain-num');

const modalGuess       = $('modal-guess');
const modalResult      = $('modal-result');
const guessSearch      = $('guess-search');
const guessPreview     = $('guess-preview');
const guessPreviewName = $('guess-preview-name');

const resultEmoji    = $('result-emoji');
const resultTitle    = $('result-title');
const resultSubtitle = $('result-subtitle');
const resultMyName   = $('result-my-name');
const resultGuessName = $('result-guess-name');
const resultActions  = $('result-actions');

const turnTimerEl  = $('turn-timer');
const timerDisplay = $('timer-display');

const confettiCanvas = $('confetti-canvas');
const confettiCtx    = confettiCanvas.getContext('2d');

/* ════════════════════════════════════════
   STATE
════════════════════════════════════════ */
let state = {
  myCharId:        null,
  eliminated:      new Set(),
  undoStack:       [],
  guessSelectedId: null,
};

let pickSelectedCard = null;
let pickConfirmBtn   = null;
let activeFilters    = new Set(); /* empty = show all */

// Timer
let timerEnabled  = false;
let timerSecs     = 30;
let timerInterval = null;

// Confetti
let confettiParticles = [];
let confettiRafId     = null;

/* ════════════════════════════════════════
   UTILITIES
════════════════════════════════════════ */
function el(tag, cls) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
}

const getChar    = id => window.CHARACTERS.find(c => c.id === id);
const totalChars = ()  => window.CHARACTERS.length;
const cap        = s   => s.charAt(0).toUpperCase() + s.slice(1);

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo(0, 0);
}

/* Hair colour → name mapping */
const HAIR_MAP = {
  '#f0e68c': 'blonde', '#f4d03f': 'blonde',
  '#0d0d0d': 'black',  '#1a1a1a': 'black',
  '#c0392b': 'red',    '#e74c3c': 'red',
  '#95a5a6': 'gray',   '#bdc3c7': 'gray',
  '#6b4226': 'brown',  '#8b5e3c': 'brown', '#7d5a3c': 'brown',
};
const getHairName = char =>
  (!char.hairColor || char.hairStyle === 'bald') ? 'bald' : (HAIR_MAP[char.hairColor] ?? 'other');

function getTraitText(char) {
  const p = [];
  if (char.hairStyle === 'bald') p.push('Bald');
  else p.push(`${cap(getHairName(char))} ${char.hairStyle} hair`);
  if (char.glasses)                   p.push('Glasses');
  if (char.hat)                       p.push('Hat');
  if (char.facialHair === 'beard')    p.push('Beard');
  if (char.facialHair === 'mustache') p.push('Mustache');
  if (char.earrings)                  p.push('Earrings');
  if (char.freckles)                  p.push('Freckles');
  p.push(cap(char.age));
  p.push(cap(char.gender));
  if (char.job) p.push(char.job);
  return p.join(' · ');
}

/* ════════════════════════════════════════
   FACE BUILDER
════════════════════════════════════════ */
function buildFace(char, container) {
  container.innerHTML = '';
  container.style.setProperty('--skin', char.skin);
  container.style.setProperty('--eye',  char.eye);
  if (char.hairColor) container.style.setProperty('--hair', char.hairColor);

  if (char.hat) {
    const w = el('div', 'f-hat-wrap');
    w.append(el('div', 'f-hat-top'), el('div', 'f-hat-brim'));
    container.appendChild(w);
  }

  if (char.hairStyle === 'long') {
    container.append(
      el('div', 'f-hair f-hair--long-side left'),
      el('div', 'f-hair f-hair--long-side right')
    );
  }

  const head = el('div', 'f-head');
  switch (char.hairStyle) {
    case 'short': head.appendChild(el('div', 'f-hair f-hair--short'));    break;
    case 'long':  head.appendChild(el('div', 'f-hair f-hair--long-top')); break;
    case 'curly': head.appendChild(el('div', 'f-hair f-hair--curly'));    break;
    case 'bald':  head.appendChild(el('div', 'f-bald-shine'));            break;
  }

  if (char.earrings) {
    head.append(el('div', 'f-earring left'), el('div', 'f-earring right'));
  }

  const eyes = el('div', 'f-eyes');
  eyes.append(el('div', 'f-eye'), el('div', 'f-eye'));
  head.append(eyes, el('div', 'f-nose'), el('div', 'f-mouth'));

  if (char.freckles) {
    ['left', 'right'].forEach(side => {
      const g = el('div', `f-freckle-group ${side}`);
      g.append(el('span', 'f-freckle'), el('span', 'f-freckle'), el('span', 'f-freckle'));
      head.appendChild(g);
    });
  }

  if (char.glasses) {
    const g = el('div', 'f-glasses');
    g.appendChild(el('div', 'f-glasses-bridge'));
    head.appendChild(g);
  }
  if (char.facialHair === 'beard')    head.appendChild(el('div', 'f-beard'));
  if (char.facialHair === 'mustache') head.appendChild(el('div', 'f-mustache'));

  container.appendChild(head);
}

/* ════════════════════════════════════════
   CARD BUILDER
════════════════════════════════════════ */
function buildCard(char, mode) {
  const card = el('div', 'char-card');
  card.dataset.id = char.id;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  const face = el('div', 'char-face');
  buildFace(char, face);
  card.appendChild(face);

  const nameEl = el('span', 'char-name');
  nameEl.textContent = char.name;
  card.appendChild(nameEl);

  /* Always-visible subtitle — age + occupation (works on mobile, no hover needed) */
  const sub = el('div', 'char-subtitle');
  const ageSpan = el('span', 'char-age');
  ageSpan.textContent = cap(char.age);
  const jobSpan = el('span', 'char-job');
  jobSpan.textContent = char.job || '';
  sub.append(ageSpan, jobSpan);
  card.appendChild(sub);

  /* Tooltip — full detail on desktop hover, hidden on touch via CSS */
  const tip = el('div', 'char-tooltip');
  tip.textContent = getTraitText(char);
  card.appendChild(tip);

  if (mode === 'pick') {
    card.setAttribute('aria-label', `Select ${char.name}`);
    card.addEventListener('click',   () => onPickSelect(char.id, card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPickSelect(char.id, card); }
    });
  }
  if (mode === 'game') {
    card.setAttribute('aria-label', `${char.name} – click to eliminate`);
    card.addEventListener('click',   () => onEliminate(char.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEliminate(char.id); }
    });
  }
  if (mode === 'guess') {
    card.setAttribute('aria-label', `Guess ${char.name}`);
    card.addEventListener('click',   () => onGuessSelect(char.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGuessSelect(char.id); }
    });
  }

  return card;
}

/* ════════════════════════════════════════
   RENDER GRIDS
════════════════════════════════════════ */
function renderPickGrid() {
  pickGrid.innerHTML = '';
  window.CHARACTERS.forEach(c => pickGrid.appendChild(buildCard(c, 'pick')));

  const footer = document.querySelector('.pick-footer');
  footer.querySelector('.btn-pick-confirm')?.remove();

  pickConfirmBtn = el('button', 'btn btn-primary btn-lg btn-pick-confirm');
  pickConfirmBtn.textContent = 'Confirm Selection →';
  pickConfirmBtn.disabled = true;
  pickConfirmBtn.addEventListener('click', onPickConfirm);
  footer.prepend(pickConfirmBtn);
}

function renderGameGrid() {
  gameGrid.innerHTML = '';
  window.CHARACTERS.forEach(c => {
    const card = buildCard(c, 'game');
    if (state.eliminated.has(c.id)) {
      card.classList.add('eliminated');
      card.setAttribute('aria-label', `${c.name} – eliminated, click to restore`);
    }
    gameGrid.appendChild(card);
  });
  applyFilters(false);
}

function renderGuessGrid() {
  guessGrid.innerHTML = '';
  window.CHARACTERS.forEach(c => guessGrid.appendChild(buildCard(c, 'guess')));
}

/* ════════════════════════════════════════
   PICK FLOW
════════════════════════════════════════ */
function onPickSelect(id, card) {
  pickSelectedCard?.classList.remove('selected');
  pickSelectedCard = card;
  card.classList.add('selected');
  state.myCharId = id;
  if (pickConfirmBtn) pickConfirmBtn.disabled = false;
}

function onPickConfirm() {
  if (!state.myCharId) return;
  const char = getChar(state.myCharId);

  buildFace(char, $('my-char-face'));
  myCharName.textContent = char.name;
  myCharBadge.classList.add('concealed');

  renderGameGrid();
  updateCounts();
  saveState();
  showScreen('game');
}

/* ════════════════════════════════════════
   ELIMINATION
════════════════════════════════════════ */
function onEliminate(id) {
  const card = gameGrid.querySelector(`[data-id="${id}"]`);

  card?.classList.add('tapping');
  setTimeout(() => card?.classList.remove('tapping'), 220);

  if (state.eliminated.has(id)) {
    state.eliminated.delete(id);
    const i = state.undoStack.lastIndexOf(id);
    if (i !== -1) state.undoStack.splice(i, 1);
    card?.classList.remove('eliminated');
    card?.setAttribute('aria-label', `${getChar(id).name} – click to eliminate`);
  } else {
    state.eliminated.add(id);
    state.undoStack.push(id);
    card?.classList.add('eliminated');
    card?.setAttribute('aria-label', `${getChar(id).name} – eliminated, click to restore`);
  }

  syncAfterElim();
}

function undoLast() {
  if (!state.undoStack.length) return;
  const id = state.undoStack.pop();
  state.eliminated.delete(id);
  gameGrid.querySelector(`[data-id="${id}"]`)?.classList.remove('eliminated');
  syncAfterElim();
}

function clearBoard() {
  if (!state.eliminated.size) return;
  if (!confirm('Clear all eliminated characters?')) return;
  state.eliminated.clear();
  state.undoStack = [];
  gameGrid.querySelectorAll('.char-card.eliminated').forEach(c => {
    c.classList.remove('eliminated');
    c.setAttribute('aria-label', `${getChar(Number(c.dataset.id)).name} – click to eliminate`);
  });
  syncAfterElim();
}

function syncAfterElim() {
  updateCounts();
  btnUndo.disabled  = state.undoStack.length === 0;
  btnClear.disabled = state.eliminated.size === 0;
  applyFilters(false);
  if (!helperPanel.hidden) renderHelper();
  saveState();
}

function updateCounts() {
  const out = state.eliminated.size;
  elimNum.textContent   = out;
  remainNum.textContent = totalChars() - out;
}

/* ════════════════════════════════════════
   PEEK
════════════════════════════════════════ */
const revealBadge  = () => myCharBadge.classList.remove('concealed');
const concealBadge = () => myCharBadge.classList.add('concealed');

/* ════════════════════════════════════════
   TURN & TIMER
════════════════════════════════════════ */
function setTurn(who) {
  btnTurnMe.classList.toggle('active',   who === 'me');
  btnTurnThem.classList.toggle('active', who === 'them');
  btnTurnMe.setAttribute('aria-pressed',   who === 'me'   ? 'true' : 'false');
  btnTurnThem.setAttribute('aria-pressed', who === 'them' ? 'true' : 'false');
  if (timerEnabled) startTimer();
}

function toggleTimer() {
  timerEnabled = !timerEnabled;
  turnTimerEl.hidden = !timerEnabled;
  btnTimerToggle.classList.toggle('timer-on', timerEnabled);
  if (timerEnabled) startTimer();
  else { clearInterval(timerInterval); timerInterval = null; }
}

function startTimer() {
  clearInterval(timerInterval);
  timerSecs = 30;
  renderTimer();
  timerInterval = setInterval(() => {
    timerSecs--;
    renderTimer();
    if (timerSecs <= 0) {
      clearInterval(timerInterval);
      setTurn(btnTurnMe.classList.contains('active') ? 'them' : 'me');
    }
  }, 1000);
}

function renderTimer() {
  timerDisplay.textContent = timerSecs;
  timerDisplay.classList.toggle('urgent', timerSecs <= 5);
}

/* ════════════════════════════════════════
   QUESTION HELPER
════════════════════════════════════════ */
const QUESTIONS = [
  { label: 'Do they have glasses?',         check: c => !!c.glasses },
  { label: 'Are they wearing a hat?',       check: c => !!c.hat },
  { label: 'Do they have any facial hair?', check: c => !!c.facialHair },
  { label: 'Do they have a beard?',         check: c => c.facialHair === 'beard' },
  { label: 'Do they have a mustache?',      check: c => c.facialHair === 'mustache' },
  { label: 'Are they female?',              check: c => c.gender === 'female' },
  { label: 'Are they male?',                check: c => c.gender === 'male' },
  { label: 'Are they young?',               check: c => c.age === 'young' },
  { label: 'Are they old?',                 check: c => c.age === 'old' },
  { label: 'Are they middle-aged?',         check: c => c.age === 'middle' },
  { label: 'Do they have blonde hair?',     check: c => getHairName(c) === 'blonde' },
  { label: 'Do they have dark/black hair?', check: c => getHairName(c) === 'black' },
  { label: 'Do they have red hair?',        check: c => getHairName(c) === 'red' },
  { label: 'Do they have gray hair?',       check: c => getHairName(c) === 'gray' },
  { label: 'Do they have brown hair?',      check: c => getHairName(c) === 'brown' },
  { label: 'Are they bald?',                check: c => c.hairStyle === 'bald' },
  { label: 'Do they have long hair?',       check: c => c.hairStyle === 'long' },
  { label: 'Do they have curly hair?',      check: c => c.hairStyle === 'curly' },
  { label: 'Do they have earrings?',        check: c => !!c.earrings },
  { label: 'Do they have freckles?',        check: c => !!c.freckles },
];

function renderHelper() {
  const remaining = window.CHARACTERS.filter(c => !state.eliminated.has(c.id));
  helperContent.innerHTML = '';

  if (remaining.length <= 1) {
    const msg = el('p', 'helper-empty');
    msg.textContent = remaining.length === 1
      ? `Only 1 left — it must be ${remaining[0].name}!`
      : 'All characters eliminated.';
    helperContent.appendChild(msg);
    return;
  }

  const top = QUESTIONS
    .map(q => {
      const yes     = remaining.filter(c => q.check(c)).length;
      const no      = remaining.length - yes;
      const balance = 1 - Math.abs(yes - no) / remaining.length;
      return { ...q, yes, no, balance };
    })
    .filter(q => q.yes > 0 && q.no > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  if (!top.length) {
    const msg = el('p', 'helper-empty');
    msg.textContent = 'No useful questions for the remaining characters.';
    helperContent.appendChild(msg);
    return;
  }

  top.forEach((q, i) => {
    const row      = el('div', `helper-item${i === 0 ? ' helper-best' : ''}`);
    const question = el('span', 'helper-question');
    question.textContent = q.label;

    const bar  = el('div', 'helper-bar');
    const fill = el('div', 'helper-bar-fill');
    fill.style.width = `${Math.round(q.balance * 100)}%`;
    bar.appendChild(fill);

    const split = el('span', 'helper-split');
    split.textContent = `Yes: ${q.yes}  ·  No: ${q.no}`;

    row.append(question, bar, split);
    helperContent.appendChild(row);
  });
}

function toggleHelper() {
  helperPanel.hidden = !helperPanel.hidden;
  if (!helperPanel.hidden) renderHelper();
}

/* ════════════════════════════════════════
   TRAIT FILTER
════════════════════════════════════════ */
const FILTER_FNS = {
  'all':           ()  => true,
  'glasses':       c  => !!c.glasses,
  'hat':           c  => !!c.hat,
  'facialHair':    c  => !!c.facialHair,
  'age-young':     c  => c.age === 'young',
  'age-old':       c  => c.age === 'old',
  'gender-female': c  => c.gender === 'female',
  'hair-blonde':   c  => getHairName(c) === 'blonde',
  'hair-long':     c  => c.hairStyle === 'long',
  'earrings':      c  => !!c.earrings,
  'freckles':      c  => !!c.freckles,
};

/* AND logic — card shown only if it matches every active filter */
function applyFilters(updateButtons = true) {
  const none = activeFilters.size === 0;

  gameGrid.querySelectorAll('.char-card').forEach(card => {
    const char    = getChar(Number(card.dataset.id));
    const matches = none || [...activeFilters].every(key => (FILTER_FNS[key] ?? (() => true))(char));
    const dimmed  = !none && !matches && !card.classList.contains('eliminated');
    card.classList.toggle('filter-dim', dimmed);
  });

  if (updateButtons) {
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      const key    = btn.dataset.filter;
      const active = key === 'all' ? none : activeFilters.has(key);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
}

/* ════════════════════════════════════════
   CONFETTI
════════════════════════════════════════ */
const CONFETTI_COLORS = ['#00e5aa','#7dd3fc','#ffd700','#ff6b6b','#c084fc','#fb923c'];

function launchConfetti() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  confettiParticles = Array.from({ length: 140 }, () => ({
    x:   Math.random() * confettiCanvas.width,
    y:   -(Math.random() * confettiCanvas.height * 0.4),
    w:   Math.random() * 9 + 4,
    h:   Math.random() * 5 + 3,
    col: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    vx:  (Math.random() - 0.5) * 2.5,
    vy:  Math.random() * 3.5 + 1.5,
    rot: Math.random() * Math.PI * 2,
    spin:(Math.random() - 0.5) * 0.18,
  }));

  if (confettiRafId) cancelAnimationFrame(confettiRafId);
  tickConfetti();
}

function tickConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.rot += p.spin;
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rot);
    confettiCtx.fillStyle = p.col;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
  });

  confettiParticles = confettiParticles.filter(p => p.y < confettiCanvas.height + 30);

  if (confettiParticles.length) {
    confettiRafId = requestAnimationFrame(tickConfetti);
  } else {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiRafId = null;
  }
}

/* ════════════════════════════════════════
   FOCUS TRAP
════════════════════════════════════════ */
function trapFocus(modal) {
  const SEL = 'button:not([disabled]),input,[tabindex]:not([tabindex="-1"])';
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll(SEL)].filter(n => !n.closest('[hidden]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

/* ════════════════════════════════════════
   LOCAL STORAGE
════════════════════════════════════════ */
const SAVE_KEY = 'guess-who-v1';

function saveState() {
  if (!state.myCharId) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      myCharId:  state.myCharId,
      eliminated:[...state.eliminated],
      undoStack: [...state.undoStack],
    }));
  } catch {}
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data?.myCharId !== 'number' || !getChar(data.myCharId)) return null;
    if (!Array.isArray(data.eliminated) || !Array.isArray(data.undoStack)) return null;
    const validIds = new Set(window.CHARACTERS.map(c => c.id));
    if (!data.eliminated.every(id => validIds.has(id))) return null;
    if (!data.undoStack.every(id => validIds.has(id))) return null;
    return data;
  } catch { return null; }
}

function clearSaved() { localStorage.removeItem(SAVE_KEY); }

function checkResume() {
  const saved = loadSaved();
  if (!saved?.myCharId || !getChar(saved.myCharId)) return;

  const resumeBtn = el('button', 'btn btn-ghost btn-lg resume-btn');
  resumeBtn.textContent = '▶ Resume Previous Game';
  resumeBtn.addEventListener('click', () => {
    state.myCharId   = saved.myCharId;
    state.eliminated = new Set(saved.eliminated ?? []);
    state.undoStack  = [...(saved.undoStack ?? [])];

    const char = getChar(state.myCharId);
    buildFace(char, $('my-char-face'));
    myCharName.textContent = char.name;
    myCharBadge.classList.add('concealed');

    renderGameGrid();
    updateCounts();
    btnUndo.disabled  = state.undoStack.length === 0;
    btnClear.disabled = state.eliminated.size === 0;
    showScreen('game');
  });

  btnStart.insertAdjacentElement('afterend', resumeBtn);
}

/* ════════════════════════════════════════
   GUESS MODAL
════════════════════════════════════════ */
function openGuessModal() {
  state.guessSelectedId    = null;
  guessSearch.value        = '';
  guessPreview.hidden      = true;
  btnConfirmGuess.disabled = true;
  renderGuessGrid();
  modalGuess.hidden = false;
  setTimeout(() => guessSearch.focus(), 80);
}

function closeGuessModal() { modalGuess.hidden = true; }

function filterGuessGrid(q) {
  const query = q.trim().toLowerCase();
  guessGrid.querySelectorAll('.char-card').forEach(card => {
    const name  = card.querySelector('.char-name').textContent.toLowerCase();
    card.classList.toggle('guess-hidden', !!query && !name.includes(query));
  });
}

function onGuessSelect(id) {
  guessGrid.querySelectorAll('.char-card.selected').forEach(c => c.classList.remove('selected'));
  guessGrid.querySelector(`[data-id="${id}"]`)?.classList.add('selected');
  state.guessSelectedId = id;

  const char = getChar(id);
  buildFace(char, $('guess-preview-face'));
  guessPreviewName.textContent = char.name;
  guessPreview.hidden          = false;
  btnConfirmGuess.disabled     = false;
}

/* ════════════════════════════════════════
   RESULT FLOW
════════════════════════════════════════ */
function confirmGuess() {
  if (!state.guessSelectedId) return;
  closeGuessModal();

  const guessed = getChar(state.guessSelectedId);
  const mine    = getChar(state.myCharId);

  buildFace(guessed, $('result-guess-face'));
  resultGuessName.textContent = guessed.name;
  buildFace(mine,   $('result-my-face'));
  resultMyName.textContent = mine.name;

  resultEmoji.textContent    = '🎯';
  resultTitle.textContent    = 'Did You Get It?';
  resultTitle.style.color    = '';
  resultSubtitle.textContent = `You guessed ${guessed.name}. Ask your opponent to confirm!`;

  setResultActions([
    { text: '🎉 I Was Right!', cls: 'btn btn-primary',
      fn: () => resolveResult(true, guessed) },
    { text: '😞 I Was Wrong',  cls: 'btn btn-ghost btn-ghost-danger',
      fn: () => resolveResult(false, guessed) },
  ]);

  modalResult.hidden = false;
}

function resolveResult(won, guessedChar) {
  if (won) {
    resultEmoji.textContent    = '🎉';
    resultTitle.textContent    = 'You Win!';
    resultTitle.style.color    = 'var(--clr-accent)';
    resultSubtitle.textContent = `Correct! You identified the opponent's secret character.`;
    launchConfetti();
  } else {
    resultEmoji.textContent    = '😞';
    resultTitle.textContent    = 'Wrong Guess!';
    resultTitle.style.color    = 'var(--clr-danger)';
    resultSubtitle.textContent = `You guessed ${guessedChar.name} — but that wasn't right.`;
  }
  setResultActions([{ text: '🎮 Play Again', cls: 'btn btn-primary btn-lg', fn: resetGame }]);
}

function setResultActions(defs) {
  resultActions.innerHTML = '';
  defs.forEach(({ text, cls, fn }) => {
    const b = el('button', cls);
    b.textContent = text;
    b.addEventListener('click', fn);
    resultActions.appendChild(b);
  });
}

/* ════════════════════════════════════════
   RESET
════════════════════════════════════════ */
function resetGame() {
  clearSaved();
  clearInterval(timerInterval);
  timerInterval = null;
  timerEnabled  = false;
  turnTimerEl.hidden = true;
  btnTimerToggle.classList.remove('timer-on');

  if (confettiRafId) { cancelAnimationFrame(confettiRafId); confettiRafId = null; }
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  state = { myCharId: null, eliminated: new Set(), undoStack: [], guessSelectedId: null };
  pickSelectedCard = null;
  activeFilters.clear();

  $('my-char-face').innerHTML = '';
  myCharName.textContent      = '';
  myCharBadge.classList.add('concealed');
  helperPanel.hidden = true;
  modalGuess.hidden  = true;
  modalResult.hidden = true;
  btnUndo.disabled   = true;
  btnClear.disabled  = true;

  document.querySelector('.resume-btn')?.remove();
  showScreen('start');
  checkResume();
}

/* ════════════════════════════════════════
   EVENT WIRING
════════════════════════════════════════ */
btnStart.addEventListener('click', () => { renderPickGrid(); showScreen('pick'); });

btnReset.addEventListener('click', () => {
  if (confirm('Reset the game and return to the start screen?')) resetGame();
});

btnUndo.addEventListener('click',  undoLast);
btnClear.addEventListener('click', clearBoard);
btnGuess.addEventListener('click', openGuessModal);

btnHelper.addEventListener('click',      toggleHelper);
btnHelperClose.addEventListener('click', () => { helperPanel.hidden = true; });

btnTimerToggle.addEventListener('click', toggleTimer);
btnTurnMe.addEventListener('click',    () => setTurn('me'));
btnTurnThem.addEventListener('click',  () => setTurn('them'));

btnPeek.addEventListener('mousedown',   revealBadge);
btnPeek.addEventListener('touchstart',  revealBadge, { passive: true });
btnPeek.addEventListener('mouseup',     concealBadge);
btnPeek.addEventListener('mouseleave',  concealBadge);
btnPeek.addEventListener('touchend',    concealBadge);
btnPeek.addEventListener('touchcancel', concealBadge);

filterBar.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  const key = btn.dataset.filter;
  if (key === 'all') {
    activeFilters.clear();
  } else {
    if (activeFilters.has(key)) activeFilters.delete(key);
    else activeFilters.add(key);
  }
  applyFilters();
});

btnCloseGuess.addEventListener('click',   closeGuessModal);
btnCancelGuess.addEventListener('click',  closeGuessModal);
btnConfirmGuess.addEventListener('click', confirmGuess);
guessSearch.addEventListener('input', e => filterGuessGrid(e.target.value));
modalGuess.addEventListener('click', e => { if (e.target === modalGuess) closeGuessModal(); });

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!modalGuess.hidden)  closeGuessModal();
  /* result modal stays open — player must choose won/lost or play again */
});

/* ════════════════════════════════════════
   FOCUS TRAPS
════════════════════════════════════════ */
trapFocus(modalGuess);
trapFocus(modalResult);

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
checkResume();
