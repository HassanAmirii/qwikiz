let questions = [];
let userAnswers = [];
let currentIndex = 0;
let timer;
let timeLeft;

async function startQuiz() {
  const subject = document.getElementById("subject-select").value;
  const timeSelect = document.getElementById("time-select");
  const limit = parseInt(
    timeSelect.selectedOptions[0].getAttribute("data-limit"),
  );

  timeLeft = parseInt(timeSelect.value) * 60;

  try {
    const response = await fetch(`data/${subject}.json`);
    const data = await response.json();

    // Shuffle and slice questions based on the limit
    questions = data.sort(() => 0.5 - Math.random()).slice(0, limit);
    userAnswers = new Array(questions.length).fill(null);

    document.getElementById("setup-container").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");

    renderQuestion();
    runTimer();
  } catch (e) {
    alert(
      "Error loading data file. Ensure 'data/" + subject + ".json' exists.",
    );
  }
}

function renderQuestion() {
  const q = questions[currentIndex];
  const area = document.getElementById("question-area");
  area.innerHTML = `
        <div class="question-box">
            <p><strong>Question ${currentIndex + 1} of ${questions.length}</strong></p>
            <p class="text-large">${q.question}</p>
            ${q.options
              .map(
                (opt, i) => `
                <div class="option">
                    <input type="radio" name="q" id="o${i}" value="${i}" 
                        onclick="saveAnswer(${i})" ${userAnswers[currentIndex] === i ? "checked" : ""}>
                    <label for="o${i}">${opt}</label>
                </div>
            `,
              )
              .join("")}
        </div>
    `;
}

function saveAnswer(index) {
  userAnswers[currentIndex] = index;
}

function changeQuestion(dir) {
  currentIndex += dir;
  if (currentIndex >= 0 && currentIndex < questions.length) {
    renderQuestion();
  } else {
    currentIndex -= dir;
  }
}

function runTimer() {
  timer = setInterval(() => {
    timeLeft--;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById("timer").innerText =
      `Time: ${mins}:${secs < 10 ? "0" : ""}${secs}`;
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
    `Score: ${score} / ${questions.length}`;
}

function showSolution(index) {
  const q = questions[index];
  const display = document.getElementById("solution-display");
  display.innerHTML = `
        <div class="sol-card">
            <p><strong>Q${index + 1}:</strong> ${q.question}</p>
            <p>Correct: <span class="green">${q.options[q.answerIndex]}</span></p>
            <p><em>Note: ${q.explanation}</em></p>
        </div>
    `;
}
