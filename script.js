function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let questions = [];
let userAnswers = [];
let currentIndex = 0;
let timer;
let timeLeft;

async function startQuiz() {
  const subjectSelect = document.getElementById("subject-select");
  const subject = subjectSelect.value;
  const subjectName = subjectSelect.selectedOptions[0].innerText;

  const timeSelect = document.getElementById("time-select");
  const limit = parseInt(
    timeSelect.selectedOptions[0].getAttribute("data-limit"),
  );

  timeLeft = parseInt(timeSelect.value) * 60;

  try {
    const response = await fetch(`data/${subject}.json`);

    if (!response.ok) throw new Error("File not found");

    const data = await response.json();

    questions = data.sort(() => 0.5 - Math.random()).slice(0, limit);
    userAnswers = new Array(questions.length).fill(null);

    document.getElementById("setup-container").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");

    renderQuestion();
    runTimer();
  } catch (e) {
    alert(
      `I am still working on populating the questions for ${subjectName}.\n\nIn the meantime, please check out the other courses—they are already full of questions! You can also remind me to prioritize this course via the WhatsApp link at the footer.`,
    );
  }
}

function renderQuestion() {
  const q = questions[currentIndex];
  const area = document.getElementById("question-area");

  area.innerHTML = `
    <div class="question-box">
      <p class="q-meta">Question ${currentIndex + 1} of ${questions.length}</p>
      <p class="question-text">${escapeHTML(q.question)}</p>
      <div class="options-list">
        ${q.options
          .map(
            (opt, i) => `
            <label class="option">
              <input type="radio" name="quiz-answer" value="${i}" 
                onclick="saveAnswer(${i})" ${userAnswers[currentIndex] === i ? "checked" : ""}>
              <span class="option-text">${escapeHTML(opt)}</span>
            </label>
          `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function saveAnswer(index) {
  userAnswers[currentIndex] = index;
}

function changeQuestion(dir) {
  const newIndex = currentIndex + dir;
  if (newIndex >= 0 && newIndex < questions.length) {
    currentIndex = newIndex;
    renderQuestion();
  }
}

function runTimer() {
  const timerDisplay = document.getElementById("timer");
  timer = setInterval(() => {
    timeLeft--;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.innerText = `Time: ${mins}:${secs < 10 ? "0" : ""}${secs}`;

    if (timeLeft <= 30) {
      timerDisplay.style.color = "#dc2626";
      timerDisplay.style.background = "#fee2e2";
    }

    if (timeLeft <= 0) endQuiz();
  }, 1000);
}

function endQuiz() {
  clearInterval(timer);
  document.getElementById("quiz-container").classList.add("hidden");
  document.getElementById("result-container").classList.remove("hidden");

  let score = 0;
  const grid = document.getElementById("review-grid");
  grid.innerHTML = "";

  questions.forEach((q, i) => {
    const isCorrect = userAnswers[i] === q.answerIndex;
    if (isCorrect) score++;

    const btn = document.createElement("button");
    btn.innerText = i + 1;
    btn.className = isCorrect ? "btn-correct" : "btn-wrong";
    btn.onclick = () => showSolution(i);
    grid.appendChild(btn);
  });

  document.getElementById("score-text").innerText =
    `Final Score: ${score} / ${questions.length}`;
}

function showSolution(index) {
  const q = questions[index];
  const display = document.getElementById("solution-display");
  const isCorrect = userAnswers[index] === q.answerIndex;

  display.innerHTML = `
    <div class="sol-card">
      <p><strong>Q${index + 1}:</strong> ${escapeHTML(q.question)}</p>
      <p>Your Choice: <span class="${isCorrect ? "green" : "red"}">${
        userAnswers[index] !== null
          ? escapeHTML(q.options[userAnswers[index]])
          : "Skipped"
      }</span></p>
      <p>Correct: <span class="green">${escapeHTML(q.options[q.answerIndex])}</span></p>
      <div class="explanation"><em>Note: ${escapeHTML(q.explanation)}</em></div>
    </div>
  `;
  display.scrollIntoView({ behavior: "smooth" });
}
