const chapterNames = [
  "Assessment Test - Chapter 0", "Introduction - Chapter 1", "System Fundamentals - Chapter 2",
  "Cryptography - Chapter 3", "Footprinting - Chapter 4", "Scanning - Chapter 5",
  "Enumeration - Chapter 6", "System Hacking - Chapter 7", "Malware - Chapter 8",
  "Sniffers - Chapter 9", "Social Engineering - Chapter 10", "Denial of Service - Chapter 11",
  "Session Hijacking - Chapter 12", "Web Server & Applications - Chapter 13", "SQL Injection - Chapter 14",
  "Hacking Wi-Fi & Bluetooth - Chapter 15", "Mobile Device Security - Chapter 16", "Evasion - Chapter 17",
  "Cloud Technologies & Security - Chapter 18", "Physical Security - Chapter 19"
];

const state = {
  allQuestions: [], allChapters: [], questions: [], index: 0, chapter: "", mode: "", answers: {}, checked: {}, results: []
};

const $ = (id) => document.getElementById(id);
const show = (id) => document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === id));

function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function normaliseQuestion(q, chapter) {
  return {
    ...q,
    chapter: q.chapter || chapter,
    answers: (q.answers || []).map((text, i) => {
      const m = text.match(/^([A-E])\)\s*(.*)$/);
      return { letter: m ? m[1] : String.fromCharCode(65 + i), text: m ? m[2] : text, full: text };
    })
  };
}

async function loadData() {
  for (const chapter of chapterNames) {
    try {
      const r = await fetch(`data/questions/${encodeURIComponent(chapter)}.json`);
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      const questions = (data.questions || []).map((q) => normaliseQuestion(q, chapter));
      state.allChapters.push({ name: chapter, questions });
      state.allQuestions.push(...questions);
    } catch (e) { console.warn('Could not load', chapter, e); }
  }

  $('homeStatus').textContent = `${state.allQuestions.length} questions loaded • Version 1.0`;
  buildChapterList();
}

function buildChapterList() {
  $('chapterList').innerHTML = '';
  state.allChapters.forEach((chapter) => {
    const b = document.createElement('button');
    b.className = 'chapter-button';
    b.textContent = `${chapter.name} (${chapter.questions.length})`;
    b.onclick = () => startQuiz(chapter.questions, chapter.name, 'chapter');
    $('chapterList').appendChild(b);
  });
}

function buildExam() {
  const selected = [];
  const bonus = new Set(shuffle(state.allChapters).slice(0, 5));
  state.allChapters.forEach((chapter) => {
    const amount = bonus.has(chapter) ? 7 : 6;
    selected.push(...shuffle(chapter.questions).slice(0, amount));
  });
  return shuffle(selected);
}

function startQuiz(questions, chapter, mode) {
  if (!questions.length) return;
  state.questions = [...questions];
  state.chapter = chapter;
  state.mode = mode;
  state.index = 0;
  state.answers = {};
  state.checked = {};
  state.results = [];
  $('quizChapter').textContent = chapter;
  show('quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = state.questions[state.index];
  const saved = state.answers[state.index] || '';
  const checked = !!state.checked[state.index];
  $('progress').textContent = `Question ${state.index + 1} of ${state.questions.length}`;
  $('score').textContent = `Score: ${calculateScore()}`;
  $('question').textContent = q.question;
  $('answers').innerHTML = '';
  $('feedback').textContent = checked ? (saved === q.correct ? 'Correct!' : `Incorrect. Correct answer: ${q.correct}`) : '';

  q.answers.forEach((a) => {
    const b = document.createElement('button');
    b.className = 'answer';
    b.textContent = `${a.letter}) ${a.text}`;
    if (a.letter === saved) b.classList.add('selected');
    if (checked) {
      if (a.letter === q.correct) b.classList.add('correct');
      else if (a.letter === saved) b.classList.add('wrong');
      b.disabled = true;
    }
    b.onclick = () => {
      if (state.checked[state.index]) return;
      state.answers[state.index] = a.letter;
      document.querySelectorAll('.answer').forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
    };
    $('answers').appendChild(b);
  });

  $('prevBtn').disabled = state.index === 0;
  $('nextBtn').disabled = !checked || state.index === state.questions.length - 1;
  $('checkBtn').disabled = checked;
}

function calculateScore() {
  return state.questions.reduce((n, q, i) => n + (state.checked[i] && state.answers[i] === q.correct ? 1 : 0), 0);
}

function checkAnswer() {
  const choice = state.answers[state.index];
  if (!choice) { $('feedback').textContent = 'Please select an answer first.'; return; }
  if (state.checked[state.index]) return;
  state.checked[state.index] = true;
  renderQuestion();
}

function finishQuiz() {
  const total = state.questions.length;
  const score = calculateScore();
  const incorrect = total - score;
  const percent = total ? (score / total) * 100 : 0;
  $('resultChapter').textContent = state.chapter;
  $('resultScore').textContent = `Score: ${score}/${total}`;
  $('resultPercent').textContent = `${percent.toFixed(1)}%`;
  $('resultProgress').style.width = `${percent}%`;
  $('correctStat').textContent = `Correct: ${score}`;
  $('incorrectStat').textContent = `Incorrect: ${incorrect}`;
  $('rating').textContent = percent >= 90 ? '🏆 Outstanding' : percent >= 75 ? '✅ Good' : percent >= 50 ? '📚 Needs Revision' : '❌ Keep Practising';

  const analytics = {};
  state.questions.forEach((q, i) => {
    const c = q.chapter || 'Unknown';
    if (!analytics[c]) analytics[c] = { correct: 0, total: 0 };
    analytics[c].total += 1;
    if (state.answers[i] === q.correct) analytics[c].correct += 1;
  });
  $('analytics').innerHTML = '';
  Object.entries(analytics).forEach(([chapter, s]) => {
    const p = s.total ? (s.correct / s.total) * 100 : 0;
    const row = document.createElement('div'); row.className = 'analytics-row';
    row.textContent = `${chapter}: ${s.correct}/${s.total} (${p.toFixed(0)}%)`;
    $('analytics').appendChild(row);
  });
  show('results');
}

function reviewIncorrect() {
  $('reviewList').innerHTML = '';
  let wrong = 0;
  state.questions.forEach((q, i) => {
    if (state.answers[i] === q.correct) return;
    wrong += 1;
    const card = document.createElement('article'); card.className = 'review-card';
    const selected = q.answers.find((a) => a.letter === state.answers[i]);
    const correct = q.answers.find((a) => a.letter === q.correct);
    card.innerHTML = `<h3>${escapeHtml(q.question)}</h3><p class="wrong-label">❌ Your Answer</p><p>${escapeHtml(selected ? selected.full : 'Not answered')}</p><p class="correct-label">✅ Correct Answer</p><p>${escapeHtml(correct ? correct.full : q.correct)}</p>`;
    $('reviewList').appendChild(card);
  });
  if (!wrong) $('reviewList').innerHTML = '<p class="perfect">🎉 Perfect Score! Nothing to review.</p>';
  show('review');
}

function escapeHtml(value) { const d = document.createElement('div'); d.textContent = value || ''; return d.innerHTML; }

$('chaptersBtn').onclick = () => show('chapters');
$('chaptersHomeBtn').onclick = () => show('home');
$('quizHomeBtn').onclick = () => show('home');
$('chaptersRandomBtn').onclick = () => startQuiz(shuffle(state.allQuestions).slice(0, 20), 'Random Quiz', 'random');
$('randomBtn').onclick = () => startQuiz(shuffle(state.allQuestions).slice(0, 20), 'Random Quiz', 'random');
$('examBtn').onclick = () => startQuiz(buildExam(), 'CEH Practice Exam', 'exam');
$('checkBtn').onclick = checkAnswer;
$('prevBtn').onclick = () => { if (state.index > 0) { state.index -= 1; renderQuestion(); } };
$('nextBtn').onclick = () => { if (state.index < state.questions.length - 1) { state.index += 1; renderQuestion(); } };
$('finishBtn').onclick = finishQuiz;
$('reviewBtn').onclick = reviewIncorrect;
$('reviewBackBtn').onclick = () => show('results');
$('resultHomeBtn').onclick = () => show('home');
$('retryBtn').onclick = () => startQuiz(state.questions, state.chapter, state.mode);

loadData().catch((e) => { console.error(e); $('homeStatus').textContent = 'Could not load the question bank.'; });
