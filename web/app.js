const chapters = [
  "Assessment Test - Chapter 0",
  "Introduction - Chapter 1",
  "System Fundamentals - Chapter 2",
  "Cryptography - Chapter 3",
  "Footprinting - Chapter 4",
  "Scanning - Chapter 5",
  "Enumeration - Chapter 6",
  "System Hacking - Chapter 7",
  "Malware - Chapter 8",
  "Sniffers - Chapter 9",
  "Social Engineering - Chapter 10",
  "Denial of Service - Chapter 11",
  "Session Hijacking - Chapter 12",
  "Web Server & Applications - Chapter 13",
  "SQL Injection - Chapter 14",
  "Hacking Wi-Fi & Bluetooth - Chapter 15",
  "Mobile Device Security - Chapter 16",
  "Evasion - Chapter 17",
  "Cloud Technologies & Security - Chapter 18",
  "Physical Security - Chapter 19"
];

const state = {
  allQuestions: [],
  questions: [],
  index: 0,
  score: 0,
  answers: {},
  results: [],
  mode: "random",
  chapter: ""
};

const $ = (id) => document.getElementById(id);
const show = (id) => document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === id));

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normaliseQuestion(q, chapter) {
  return {
    ...q,
    chapter: q.chapter || chapter,
    answers: (q.answers || []).map((answer, index) => {
      const match = String(answer).match(/^([A-E])\)\s*(.*)$/);
      return match
        ? { letter: match[1], text: match[2], full: answer }
        : { letter: String.fromCharCode(65 + index), text: String(answer), full: String(answer) };
    })
  };
}

async function loadAllQuestions() {
  const loaded = [];
  const failed = [];

  for (const chapter of chapters) {
    const url = `data/questions/${encodeURIComponent(chapter)}.json`;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      for (const q of data.questions || []) loaded.push(normaliseQuestion(q, chapter));
    } catch (error) {
      failed.push(`${chapter}: ${error.message}`);
      console.warn("Could not load", chapter, error);
    }
  }

  if (failed.length) console.warn("Question files not loaded:", failed);
  return loaded;
}

function setHomeStatus(text) {
  if ($('homeStatus')) $('homeStatus').textContent = text;
}

function buildChapterList() {
  const list = $('chapterList');
  list.innerHTML = '';

  chapters.forEach((chapter) => {
    const count = state.allQuestions.filter((q) => q.chapter === chapter).length;
    const button = document.createElement('button');
    button.textContent = `${chapter}  (${count} questions)`;
    button.onclick = () => startChapter(chapter);
    list.appendChild(button);
  });
}

function startQuiz(questions, chapter, mode) {
  state.questions = questions;
  state.chapter = chapter;
  state.mode = mode;
  state.index = 0;
  state.score = 0;
  state.answers = {};
  state.results = [];
  $('quizChapter').textContent = chapter;
  show('quiz');
  renderQuestion();
}

function startChapter(chapter) {
  const questions = state.allQuestions.filter((q) => q.chapter === chapter);
  if (!questions.length) return alert('No questions were loaded for this chapter.');
  startQuiz(shuffle(questions), chapter, 'chapter');
}

function startRandom(amount = 20) {
  const questions = shuffle(state.allQuestions).slice(0, Math.min(amount, state.allQuestions.length));
  startQuiz(questions, `Random Quiz (${questions.length} Questions)`, 'random');
}

function startExam() {
  const byChapter = chapters.map((chapter) => state.allQuestions.filter((q) => q.chapter === chapter));
  const valid = byChapter.filter((list) => list.length >= 7);
  if (valid.length < chapters.length) {
    alert('The question bank does not contain enough questions to build the 125-question exam.');
    return;
  }

  const bonusIndexes = shuffle([...Array(chapters.length).keys()]).slice(0, 5);
  const exam = [];
  byChapter.forEach((list, index) => {
    exam.push(...shuffle(list).slice(0, bonusIndexes.includes(index) ? 7 : 6));
  });
  startQuiz(shuffle(exam), 'CEH Practice Exam', 'exam');
}

function renderQuestion() {
  const q = state.questions[state.index];
  const saved = state.answers[state.index] || '';
  $('progress').textContent = `Question ${state.index + 1} of ${state.questions.length}`;
  $('score').textContent = `Score: ${state.score}`;
  $('question').textContent = q.question;
  $('answers').innerHTML = '';
  $('feedback').textContent = '';

  q.answers.forEach((answer) => {
    const button = document.createElement('button');
    button.className = 'answer';
    button.textContent = `${answer.letter}) ${answer.text}`;
    if (answer.letter === saved) button.classList.add('selected');
    button.onclick = () => selectAnswer(answer.letter);
    $('answers').appendChild(button);
  });

  $('prevBtn').disabled = state.index === 0;
  $('nextBtn').disabled = !state.results[state.index];
}

function selectAnswer(letter) {
  if (state.results[state.index]) return;
  state.answers[state.index] = letter;
  document.querySelectorAll('.answer').forEach((button) => {
    button.classList.toggle('selected', button.textContent.trim().startsWith(`${letter})`));
  });
}

function checkAnswer() {
  const choice = state.answers[state.index];
  if (!choice) {
    $('feedback').textContent = 'Please select an answer first.';
    return;
  }
  if (state.results[state.index]) return;

  const q = state.questions[state.index];
  const correct = choice === q.correct;
  if (correct) state.score += 1;

  const selected = q.answers.find((a) => a.letter === choice);
  const correctAnswer = q.answers.find((a) => a.letter === q.correct);
  state.results[state.index] = {
    chapter: q.chapter,
    question: q.question,
    selected: selected ? selected.full : choice,
    correct: correctAnswer ? correctAnswer.full : q.correct,
    is_correct: correct
  };

  document.querySelectorAll('.answer').forEach((button) => {
    const letter = button.textContent.trim().charAt(0);
    button.disabled = true;
    if (letter === q.correct) button.classList.add('correct');
    else if (letter === choice) button.classList.add('wrong');
  });

  $('feedback').textContent = correct ? 'Correct!' : `Incorrect. Correct answer: ${q.correct}`;
  $('score').textContent = `Score: ${state.score}`;
  $('nextBtn').disabled = false;
}

function nextQuestion() {
  if (!state.results[state.index]) return;
  if (state.index >= state.questions.length - 1) return finishQuiz();
  state.index += 1;
  renderQuestion();
}

function previousQuestion() {
  if (state.index <= 0) return;
  state.index -= 1;
  renderQuestion();
  const result = state.results[state.index];
  if (result) {
    document.querySelectorAll('.answer').forEach((button) => {
      const letter = button.textContent.trim().charAt(0);
      button.disabled = true;
      if (letter === state.questions[state.index].correct) button.classList.add('correct');
      else if (letter === state.answers[state.index]) button.classList.add('wrong');
    });
  }
}

function finishQuiz() {
  // Unanswered questions count as incorrect, matching the Python analytics.
  state.questions.forEach((q, index) => {
    if (!state.results[index]) {
      const correctAnswer = q.answers.find((a) => a.letter === q.correct);
      state.results[index] = {
        chapter: q.chapter,
        question: q.question,
        selected: state.answers[index] ? (q.answers.find((a) => a.letter === state.answers[index])?.full || state.answers[index]) : 'Not answered',
        correct: correctAnswer ? correctAnswer.full : q.correct,
        is_correct: false
      };
    }
  });

  const total = state.questions.length;
  const percent = total ? (state.score / total) * 100 : 0;
  $('resultChapter').textContent = state.chapter;
  $('resultScore').textContent = `Score: ${state.score}/${total}`;
  $('resultPercent').textContent = `${percent.toFixed(1)}%`;
  $('resultProgress').style.width = `${percent}%`;
  $('correctStat').textContent = `Correct: ${state.score}`;
  $('incorrectStat').textContent = `Incorrect: ${total - state.score}`;
  $('rating').textContent = percent >= 90 ? '🏆 Outstanding' : percent >= 75 ? '✅ Good' : percent >= 50 ? '📚 Needs Revision' : '❌ Keep Practising';

  const analytics = {};
  state.results.forEach((result) => {
    const chapter = result.chapter || 'Unknown';
    if (!analytics[chapter]) analytics[chapter] = { correct: 0, total: 0 };
    analytics[chapter].total += 1;
    if (result.is_correct) analytics[chapter].correct += 1;
  });

  const analyticsBox = $('analytics');
  analyticsBox.innerHTML = '';
  let best = null;
  let worst = null;
  Object.entries(analytics).sort().forEach(([chapter, stats]) => {
    const pct = stats.correct / stats.total * 100;
    const row = document.createElement('div');
    row.textContent = `${chapter}: ${stats.correct}/${stats.total} (${pct.toFixed(0)}%)`;
    analyticsBox.appendChild(row);
    if (!best || pct > best.pct) best = { chapter, pct };
    if (!worst || pct < worst.pct) worst = { chapter, pct };
  });
  if (best) analyticsBox.insertAdjacentHTML('beforeend', `<strong>🏆 Strongest: ${best.chapter} (${best.pct.toFixed(0)}%)</strong>`);
  if (worst) analyticsBox.insertAdjacentHTML('beforeend', `<strong>📚 Needs Revision: ${worst.chapter} (${worst.pct.toFixed(0)}%)</strong>`);

  $('retryBtn').textContent = state.mode === 'chapter' ? '🔄 Retry Chapter' : state.mode === 'exam' ? '📝 New Practice Exam' : '🎲 New Random Quiz';
  show('results');
}

function reviewIncorrect() {
  const list = $('reviewList');
  list.innerHTML = '';
  const wrong = state.results.filter((r) => !r.is_correct);
  if (!wrong.length) {
    list.innerHTML = '<p class="perfect">🎉 Perfect Score! Nothing to review.</p>';
  } else {
    wrong.forEach((result) => {
      const card = document.createElement('article');
      card.className = 'review-card';
      card.innerHTML = `<h3>${escapeHtml(result.question)}</h3><p><strong>❌ Your Answer</strong><br>${escapeHtml(result.selected)}</p><p><strong>✅ Correct Answer</strong><br>${escapeHtml(result.correct)}</p>`;
      list.appendChild(card);
    });
  }
  show('review');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

$('chaptersBtn').onclick = () => { buildChapterList(); show('chapters'); };
$('examBtn').onclick = startExam;
$('randomBtn').onclick = () => startRandom(20);
$('chaptersHomeBtn').onclick = () => show('home');
$('chaptersRandomBtn').onclick = () => startRandom(20);
$('quizHomeBtn').onclick = () => show('home');
$('checkBtn').onclick = checkAnswer;
$('prevBtn').onclick = previousQuestion;
$('nextBtn').onclick = nextQuestion;
$('finishBtn').onclick = finishQuiz;
$('reviewBtn').onclick = reviewIncorrect;
$('reviewBackBtn').onclick = () => show('results');
$('resultHomeBtn').onclick = () => show('home');
$('retryBtn').onclick = () => {
  if (state.mode === 'chapter') startChapter(state.chapter);
  else if (state.mode === 'exam') startExam();
  else startRandom(20);
};

loadAllQuestions().then((questions) => {
  state.allQuestions = questions;
  buildChapterList();
  setHomeStatus(`${questions.length} questions loaded. Ready to practice.`);
}).catch((error) => {
  console.error(error);
  setHomeStatus('Could not load the question bank.');
});
