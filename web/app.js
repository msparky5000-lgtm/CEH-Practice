const chapters = [
  "Assessment Test - Chapter 0",
  "Cloud Technologies & Security - Chapter 18",
  "Cryptography - Chapter 3",
  "Denial of Service - Chapter 11",
  "Enumeration - Chapter 6",
  "Evasion - Chapter 17",
  "Footprinting - Chapter 4",
  "Hacking Wi-Fi & Bluetooth - Chapter 15",
  "Introduction - Chapter 1",
  "Malware - Chapter 8",
  "Mobile Device Security - Chapter 16",
  "Physical Security - Chapter 19",
  "SQL Injection - Chapter 14",
  "Scanning - Chapter 5",
  "Session Hijacking - Chapter 12",
  "Sniffers - Chapter 9",
  "Social Engineering - Chapter 10",
  "System Fundamentals - Chapter 2",
  "System Hacking - Chapter 7",
  "Web Server & Applications - Chapter 13"
];

const state = { questions: [], index: 0, score: 0, selected: null, checked: false };

const $ = (id) => document.getElementById(id);
const show = (id) => document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === id));

function normaliseQuestion(q) {
  const answers = q.answers.map((answer) => {
    const match = answer.match(/^([A-E])\)\s*(.*)$/);
    return match ? { letter: match[1], text: match[2] } : { letter: String.fromCharCode(65 + q.answers.indexOf(answer)), text: answer };
  });
  return { ...q, answers };
}

async function loadAllQuestions() {
  const loaded = [];
  for (const chapter of chapters) {
    const url = `../data/questions/${encodeURIComponent(chapter)}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      loaded.push(...(data.questions || []).map(normaliseQuestion));
    } catch (error) {
      console.warn(`Could not load ${chapter}`, error);
    }
  }
  return loaded;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderQuestion() {
  const q = state.questions[state.index];
  $('progress').textContent = `Question ${state.index + 1} of ${state.questions.length}`;
  $('score').textContent = `Score: ${state.score}`;
  $('question').textContent = q.question;
  $('answers').innerHTML = '';
  $('feedback').textContent = '';
  $('nextBtn').disabled = true;
  state.selected = null;
  state.checked = false;

  q.answers.forEach((answer) => {
    const button = document.createElement('button');
    button.className = 'answer';
    button.textContent = `${answer.letter}) ${answer.text}`;
    button.onclick = () => {
      if (state.checked) return;
      state.selected = answer.letter;
      document.querySelectorAll('.answer').forEach((b) => b.classList.remove('selected'));
      button.classList.add('selected');
    };
    $('answers').appendChild(button);
  });
}

function startQuiz(amount = null) {
  if (!state.questions.length) return;
  state.questions = amount ? shuffle(state.questions).slice(0, amount) : shuffle(state.questions);
  state.index = 0;
  state.score = 0;
  show('quiz');
  renderQuestion();
}

$('startBtn').onclick = () => startQuiz();
$('randomBtn').onclick = () => startQuiz(20);
$('againBtn').onclick = () => startQuiz(20);

$('checkBtn').onclick = () => {
  if (state.selected === null || state.checked) {
    $('feedback').textContent = 'Please select an answer first.';
    return;
  }
  state.checked = true;
  const q = state.questions[state.index];
  const buttons = [...document.querySelectorAll('.answer')];
  buttons.forEach((button) => {
    const letter = button.textContent.charAt(0);
    if (letter === q.correct) button.classList.add('correct');
    if (letter === state.selected && letter !== q.correct) button.classList.add('wrong');
  });

  if (state.selected === q.correct) {
    state.score += 1;
    $('feedback').textContent = 'Correct!';
  } else {
    $('feedback').textContent = `Incorrect. Correct answer: ${q.correct}`;
  }
  $('score').textContent = `Score: ${state.score}`;
  $('nextBtn').disabled = false;
};

$('nextBtn').onclick = () => {
  if (!state.checked) return;
  if (state.index >= state.questions.length - 1) {
    $('resultText').textContent = `You scored ${state.score} out of ${state.questions.length} (${Math.round((state.score / state.questions.length) * 100)}%).`;
    show('results');
    return;
  }
  state.index += 1;
  renderQuestion();
};

loadAllQuestions().then((questions) => {
  state.questions = questions;
  if (!questions.length) {
    $('startBtn').disabled = true;
    $('randomBtn').disabled = true;
    $('feedback').textContent = 'No question data could be loaded.';
  }
}).catch((error) => {
  console.error(error);
});
