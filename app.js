const testEl = document.getElementById("test");
const inputEl = document.getElementById("input");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");
const sessionLine = document.getElementById("sessionLine");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const timeButtons = Array.from(document.querySelectorAll(".chip[data-time]"));
const resultOverlay = document.getElementById("resultOverlay");
const resultWpm = document.getElementById("resultWpm");
const resultAccuracy = document.getElementById("resultAccuracy");
const resultWords = document.getElementById("resultWords");
const resultChars = document.getElementById("resultChars");
const resultChart = document.getElementById("resultChart");
const retryBtn = document.getElementById("retryBtn");
const userBadge = document.getElementById("userBadge");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const loginMenu = document.getElementById("loginMenu");
const logoutBtn = document.getElementById("logoutBtn");
const leaderboardList = document.getElementById("leaderboardList");
const userBtn = document.getElementById("userBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardSection = document.getElementById("leaderboard");

const WORD_BANK = [
  "neon",
  "cascade",
  "orbit",
  "signal",
  "echo",
  "woven",
  "ember",
  "lumen",
  "flux",
  "magnet",
  "horizon",
  "atlas",
  "vector",
  "pulse",
  "crystal",
  "shift",
  "glow",
  "current",
  "terrain",
  "cinder",
  "nova",
  "orbitals",
  "tempo",
  "stellar",
  "prairie",
  "signal",
  "cobalt",
  "drift",
  "vortex",
  "bridge",
  "groove",
  "motion",
  "alloy",
  "prism",
  "emberline",
  "sprinter",
  "signal",
  "umbra",
  "lattice",
  "mirage",
  "solstice",
  "caldera",
  "sprint",
  "axiom",
  "hollow",
  "vector",
  "swerve",
  "hush",
  "tangent",
  "draft",
  "synth",
  "chromatic",
  "glacier",
  "voyager",
  "ripple",
  "marble",
  "hinter",
  "canvas",
  "loft",
  "ember",
  "staccato",
  "ambient",
  "grove",
  "timber",
  "haze",
  "summit",
  "passage",
  "relay",
  "brisk",
  "citadel",
  "tonic",
  "fable",
  "ember",
  "aurora",
  "loam",
  "density",
  "flare",
  "shelter",
  "stride",
  "bloom",
  "canyon",
  "breeze",
  "harbor",
  "magnet",
  "vivid",
  "alpha",
  "crest",
  "delta",
  "rune",
  "sound",
  "static",
  "shimmer",
  "quiet",
  "humming",
  "signal",
  "thread",
  "ignite",
  "tide",
  "fuse",
  "chrome",
];

let words = [];
let currentIndex = 0;
let startTime = null;
let timerId = null;
let timeLimit = 30;
let totalTyped = 0;
let totalCorrect = 0;
let completedWords = 0;
let isFinished = false;
let wordStates = [];
let wpmHistory = [];
let lastSampleSecond = -1;
let currentUser = null;

function shuffleArray(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildWords() {
  const shuffled = shuffleArray(WORD_BANK);
  const extra = shuffleArray(WORD_BANK);
  words = [...shuffled, ...extra].slice(0, 80);
  wordStates = Array(words.length).fill(null);
}

function renderWords() {
  const visibleCount = 12;
  testEl.innerHTML = "";
  const halfWindow = Math.floor(visibleCount / 2);
  const maxStart = Math.max(words.length - visibleCount, 0);
  const windowStart = Math.min(Math.max(currentIndex - halfWindow, 0), maxStart);
  const visibleWords = words.slice(windowStart, windowStart + visibleCount);
  visibleWords.forEach((word, index) => {
    const absoluteIndex = windowStart + index;
    const wordEl = document.createElement("span");
    wordEl.className = "word";
    if (absoluteIndex === currentIndex) {
      wordEl.classList.add("active");
    } else if (absoluteIndex > currentIndex) {
      wordEl.classList.add("pending");
    } else if (wordStates[absoluteIndex] === "correct") {
      wordEl.classList.add("correct");
    } else if (wordStates[absoluteIndex] === "incorrect") {
      wordEl.classList.add("incorrect");
    }
    [...word].forEach((letter) => {
      const letterEl = document.createElement("span");
      letterEl.className = "letter";
      letterEl.textContent = letter;
      wordEl.appendChild(letterEl);
    });
    if (absoluteIndex === currentIndex) {
      const caret = document.createElement("span");
      caret.className = "caret";
      wordEl.prepend(caret);
    }
    testEl.appendChild(wordEl);
  });
}

function setTime(seconds) {
  timeLimit = seconds;
  timeEl.textContent = `${seconds}s`;
}

function resetTest() {
  buildWords();
  currentIndex = 0;
  totalTyped = 0;
  totalCorrect = 0;
  completedWords = 0;
  startTime = null;
  isFinished = false;
  wordStates = Array(words.length).fill(null);
  wpmHistory = Array(timeLimit + 1).fill(null);
  lastSampleSecond = -1;
  inputEl.value = "";
  clearInterval(timerId);
  timerId = null;
  setTime(timeLimit);
  updateStats();
  sessionLine.textContent = "Start typing to see your stats.";
  resultOverlay.classList.remove("show");
  resultOverlay.setAttribute("aria-hidden", "true");
  renderWords();
}

function updateStats() {
  const elapsed = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wordsPerMinute = elapsed > 0 ? Math.round((totalCorrect / 5) / elapsed) : 0;
  const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;
  wpmEl.textContent = Number.isFinite(wordsPerMinute) ? wordsPerMinute : 0;
  accuracyEl.textContent = `${accuracy}%`;
}

function updateActiveWord() {
  renderWords();
}

function finishTest() {
  isFinished = true;
  clearInterval(timerId);
  timerId = null;
  inputEl.blur();

  const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const wpm = elapsed > 0 ? Math.round((totalCorrect / 5) / (elapsed / 60)) : 0;
  const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;

  sessionLine.textContent = `Finished! ${completedWords} words, ${wpm} WPM, ${accuracy}% accuracy.`;
  resultWpm.textContent = `WPM: ${wpm}`;
  resultAccuracy.textContent = `Accuracy: ${accuracy}%`;
  resultWords.textContent = `Words: ${completedWords}`;
  resultChars.textContent = `Characters: ${totalTyped}`;
  resultOverlay.classList.add("show");
  resultOverlay.setAttribute("aria-hidden", "false");
  drawChart();
  if (currentUser) {
    submitScore({ wpm, accuracy, charsTyped: totalTyped, durationSeconds: timeLimit });
  }
}

function startTimer() {
  startTime = Date.now();
  timerId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(timeLimit - elapsed, 0);
    timeEl.textContent = `${remaining}s`;
    updateStats();
    if (elapsed !== lastSampleSecond) {
      lastSampleSecond = elapsed;
      const minutes = elapsed / 60 || 1 / 60;
      const wpm = Math.round((totalCorrect / 5) / minutes);
      if (elapsed <= timeLimit) {
        wpmHistory[elapsed] = wpm;
      }
    }
    if (remaining === 0) {
      finishTest();
    }
  }, 250);
}

function drawChart() {
  if (!resultChart) return;
  const rect = resultChart.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  resultChart.width = Math.max(1, Math.floor(rect.width * pixelRatio));
  resultChart.height = Math.max(1, Math.floor(rect.height * pixelRatio));
  const ctx = resultChart.getContext("2d");
  if (!ctx) return;

  const width = resultChart.width;
  const height = resultChart.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#f6f4f1";
  ctx.fillRect(0, 0, width, height);

  const padding = 16;
  const labelSpace = 28;
  const innerWidth = width - padding * 2 - labelSpace;
  const innerHeight = height - padding * 2 - labelSpace;
  const definedHistory = wpmHistory.filter((value) => value != null);
  const maxWpm = Math.max(10, ...definedHistory);

  const originX = padding + labelSpace;
  const originY = height - padding - labelSpace;

  ctx.fillStyle = "#0b0b0b";
  ctx.font = `${12 * pixelRatio}px "Space Grotesk", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("Time (s)", originX + innerWidth / 2, height - padding);

  ctx.save();
  ctx.translate(padding, originY - innerHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("WPM", 0, 0);
  ctx.restore();

  ctx.strokeStyle = "#d6d6d6";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + innerWidth, originY);
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX, originY - innerHeight);
  ctx.stroke();

  const yTickCount = 5;
  ctx.fillStyle = "#8a7f73";
  ctx.textAlign = "right";
  for (let i = 0; i <= yTickCount; i += 1) {
    const tick = Math.round((maxWpm * i) / yTickCount);
    const y = originY - (innerHeight * tick) / maxWpm;
    ctx.fillText(`${tick}`, originX - 6, y + 4);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
    ctx.beginPath();
    ctx.moveTo(originX, y);
    ctx.lineTo(originX + innerWidth, y);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#8a7f73";
  for (let tick = 0; tick <= timeLimit; tick += 1) {
    const x = originX + (innerWidth * tick) / timeLimit;
    ctx.fillText(`${tick}`, x, originY + 16);
    if (tick !== 0 && tick !== timeLimit) {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
      ctx.beginPath();
      ctx.moveTo(x, originY);
      ctx.lineTo(x, originY - innerHeight);
      ctx.stroke();
    }
  }

  if (definedHistory.length < 2) return;

  ctx.strokeStyle = "#0b0b0b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  let started = false;
  wpmHistory.forEach((wpm, second) => {
    if (wpm == null) return;
    const x = originX + (innerWidth * second) / timeLimit;
    const y = originY - (innerHeight * wpm) / maxWpm;
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
}

async function loadMe() {
  const res = await fetch("/api/me");
  const data = await res.json();
  currentUser = data.user;
  if (currentUser) {
    userBadge.classList.remove("hidden");
    loginMenu.classList.add("hidden");
    userName.textContent = currentUser.displayName;
    if (currentUser.avatarUrl) {
      userAvatar.src = currentUser.avatarUrl;
      userAvatar.classList.remove("hidden");
    } else {
      userAvatar.classList.add("hidden");
    }
  } else {
    userBadge.classList.add("hidden");
    loginMenu.classList.add("hidden");
  }
}

async function loadLeaderboard() {
  const res = await fetch("/api/leaderboard");
  const data = await res.json();
  leaderboardList.innerHTML = "";
  data.scores.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "leaderboard-item";
    const left = document.createElement("div");
    left.className = "leaderboard-left";
    if (entry.avatar_url) {
      const avatar = document.createElement("img");
      avatar.src = entry.avatar_url;
      avatar.alt = entry.display_name;
      left.appendChild(avatar);
    }
    const name = document.createElement("span");
    name.textContent = `${index + 1}. ${entry.display_name}`;
    left.appendChild(name);
    const score = document.createElement("span");
    score.className = "leaderboard-score";
    score.textContent = `${entry.wpm} WPM · ${entry.accuracy}% · ${entry.duration_seconds}s`;
    item.append(left, score);
    leaderboardList.appendChild(item);
  });
}

async function submitScore(payload) {
  try {
    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await loadLeaderboard();
  } catch (err) {
    console.error(err);
  }
}

function gradeWord(typedValue) {
  const targetWord = words[currentIndex];
  const wordEl = testEl.querySelector(".word.active");
  if (!wordEl) {
    return {
      correctCount: 0,
      targetLength: targetWord.length,
    };
  }
  const letters = Array.from(wordEl.querySelectorAll(".letter"));

  let correctCount = 0;
  const typedChars = typedValue.split("");

  letters.forEach((letterEl, index) => {
    if (typedChars[index] === letterEl.textContent) {
      letterEl.classList.add("correct");
      letterEl.classList.remove("incorrect");
      correctCount += 1;
    } else if (typedChars[index] == null) {
      letterEl.classList.remove("correct", "incorrect");
    } else {
      letterEl.classList.add("incorrect");
      letterEl.classList.remove("correct");
    }
  });

  if (typedChars.length > letters.length) {
    for (let i = letters.length; i < typedChars.length; i += 1) {
      const extra = document.createElement("span");
      extra.className = "letter extra";
      extra.textContent = typedChars[i];
      wordEl.appendChild(extra);
    }
  }

  const extras = Array.from(wordEl.querySelectorAll(".letter.extra"));
  extras.forEach((extra, index) => {
    if (index >= Math.max(typedChars.length - letters.length, 0)) {
      extra.remove();
    }
  });

  const existingCaret = wordEl.querySelector(".caret");
  if (existingCaret) {
    existingCaret.remove();
  }
  const caret = document.createElement("span");
  caret.className = "caret";
  const caretIndex = Math.min(typedChars.length, letters.length);
  if (caretIndex >= letters.length) {
    wordEl.appendChild(caret);
  } else {
    wordEl.insertBefore(caret, letters[caretIndex]);
  }

  return {
    correctCount,
    targetLength: targetWord.length,
  };
}

inputEl.addEventListener("input", (event) => {
  if (isFinished) return;

  if (!startTime) {
    startTimer();
  }

  const value = event.target.value;
  if (value.endsWith(" ")) {
    const typedWord = value.trim();
    const { correctCount, targetLength } = gradeWord(typedWord);
    totalTyped += targetLength;
    totalCorrect += correctCount;
    completedWords += 1;

    wordStates[currentIndex] = typedWord === words[currentIndex] ? "correct" : "incorrect";
    currentIndex += 1;
    if (currentIndex >= words.length) {
      buildWords();
      renderWords();
      currentIndex = 0;
    }

    updateActiveWord();
    inputEl.value = "";
    updateStats();
    return;
  }

  gradeWord(value);
  updateStats();
});

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
  }
});

document.addEventListener("keydown", (event) => {
  if (isFinished) return;
  if (document.activeElement !== inputEl && event.key.length === 1) {
    inputEl.focus();
    inputEl.value += event.key;
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    event.preventDefault();
  }
});

document.addEventListener("click", () => {
  if (isFinished) return;
  inputEl.focus();
});

nextBtn.addEventListener("click", () => {
  buildWords();
  renderWords();
  inputEl.value = "";
  inputEl.focus();
});

resetBtn.addEventListener("click", () => {
  resetTest();
  inputEl.focus();
});

retryBtn.addEventListener("click", () => {
  resetTest();
  inputEl.focus();
});

logoutBtn.addEventListener("click", async () => {
  await fetch("/auth/logout", { method: "POST" });
  await loadMe();
});

userBtn.addEventListener("click", () => {
  if (currentUser) {
    userBadge.classList.toggle("hidden");
  } else {
    loginMenu.classList.toggle("hidden");
  }
});

leaderboardBtn.addEventListener("click", () => {
  leaderboardSection.scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".auth")) return;
  userBadge.classList.add("hidden");
  loginMenu.classList.add("hidden");
});

resultOverlay.addEventListener("click", (event) => {
  if (event.target === resultOverlay) {
    resetTest();
    inputEl.focus();
  }
});

timeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    timeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    setTime(Number(button.dataset.time));
    resetTest();
    inputEl.focus();
  });
});

buildWords();
renderWords();
inputEl.focus();
loadMe();
loadLeaderboard();
