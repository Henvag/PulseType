const testEl = document.getElementById("test");
const inputEl = document.getElementById("input");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");
const resetBtn = document.getElementById("resetBtn");
const timeButtons = Array.from(document.querySelectorAll(".chip[data-time]"));
const resultOverlay = document.getElementById("resultOverlay");
const resultWpm = document.getElementById("resultWpm");
const resultAccuracy = document.getElementById("resultAccuracy");
const resultWords = document.getElementById("resultWords");
const resultChars = document.getElementById("resultChars");
const resultChart = document.getElementById("resultChart");
const retryBtn = document.getElementById("retryBtn");
const loginMenu = document.getElementById("loginMenu");
const logoutBtn = document.getElementById("logoutBtn");
const leaderboardList = document.getElementById("leaderboardList");
const userBtn = document.getElementById("userBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardOverlay = document.getElementById("leaderboardOverlay");
const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
const leaderboardTitle = document.getElementById("leaderboardTitle");
const leaderboardTabs = Array.from(document.querySelectorAll(".tab-btn"));
const publicProfileOverlay = document.getElementById("publicProfileOverlay");
const publicAvatar = document.getElementById("publicAvatar");
const publicName = document.getElementById("publicName");
const publicKeyboard = document.getElementById("publicKeyboard");
const publicJoin = document.getElementById("publicJoin");
const publicBest = document.getElementById("publicBest");
const closePublicProfileBtn = document.getElementById("closePublicProfileBtn");
const themeBtn = document.getElementById("themeBtn");
const themeOverlay = document.getElementById("themeOverlay");
const closeThemeBtn = document.getElementById("closeThemeBtn");
const themeList = document.getElementById("themeList");
const themeSearch = document.getElementById("themeSearch");
const profileOverlay = document.getElementById("profileOverlay");
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileProvider = document.getElementById("profileProvider");
const profileJoin = document.getElementById("profileJoin");
const profileBest = document.getElementById("profileBest");
const profileRecent = document.getElementById("profileRecent");
const closeProfileBtn = document.getElementById("closeProfileBtn");
const keyboardStatus = document.getElementById("keyboardStatus");
const keyboardSelect = document.getElementById("keyboardSelect");
const keyboardCustomWrap = document.getElementById("keyboardCustomWrap");
const keyboardCustomInput = document.getElementById("keyboardCustomInput");
const keyboardCustomSave = document.getElementById("keyboardCustomSave");
const loginOverlay = document.getElementById("loginOverlay");
const closeLoginBtn = document.getElementById("closeLoginBtn");
const logo = document.getElementById("logo");

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
let windowStartIndex = 0;
let startTime = null;
let timerId = null;
let timeLimit = 15;
let totalTyped = 0;
let totalCorrect = 0;
let completedWords = 0;
let isFinished = false;
let wordStates = [];
let wpmHistory = [];
let lastSampleSecond = -1;
let currentUser = null;
let restartArmed = false;
let restartTimer = null;

const THEMES = [
  {
    name: "PulseType",
    bg: "#f6f4f1",
    surface: "#ffffff",
    surface2: "#f6f4f1",
    text: "#0b0b0b",
    accent: "#0b0b0b",
    accentContrast: "#ffffff",
  },
  {
    name: "Nord Light",
    bg: "#eceff4",
    surface: "#ffffff",
    surface2: "#e5e9f0",
    text: "#2e3440",
    accent: "#5e81ac",
    accentContrast: "#ffffff",
  },
  {
    name: "Solarized Light",
    bg: "#fdf6e3",
    surface: "#fffdf5",
    surface2: "#f3ead0",
    text: "#586e75",
    accent: "#268bd2",
    accentContrast: "#ffffff",
  },
  {
    name: "Serika",
    bg: "#f4ead4",
    surface: "#fffaf0",
    surface2: "#efe0c0",
    text: "#2f2a24",
    accent: "#d68f00",
    accentContrast: "#ffffff",
  },
  {
    name: "Tangerine",
    bg: "#fff2e1",
    surface: "#ffffff",
    surface2: "#ffe0c2",
    text: "#3b2b1f",
    accent: "#ff7a00",
    accentContrast: "#ffffff",
  },
  {
    name: "Obsidian",
    bg: "#0f1115",
    surface: "#141821",
    surface2: "#1c2230",
    text: "#f5f7ff",
    accent: "#7aa2f7",
    accentContrast: "#0b0b0b",
    muted: "rgba(245, 247, 255, 0.6)",
  },
  {
    name: "Rose",
    bg: "#fff0f3",
    surface: "#ffffff",
    surface2: "#ffe2e8",
    text: "#3c1f28",
    accent: "#e11d48",
    accentContrast: "#ffffff",
  },
];

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--surface-2", theme.surface2);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-contrast", theme.accentContrast || "#ffffff");
  root.style.setProperty("--muted", theme.muted || "rgba(0, 0, 0, 0.6)");
  localStorage.setItem("pulsetype-theme", theme.name);
}

function renderThemeList(filter = "") {
  themeList.innerHTML = "";
  const filtered = THEMES.filter((t) => t.name.toLowerCase().includes(filter.toLowerCase()));
  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "theme-item";
    empty.textContent = "No matching themes";
    themeList.appendChild(empty);
    return;
  }
  filtered.forEach((theme) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "theme-item";
    item.innerHTML = `
      <span>${theme.name}</span>
      <span class="theme-swatch">
        <span class="theme-dot" style="background:${theme.text}"></span>
        <span class="theme-dot" style="background:${theme.accent}"></span>
        <span class="theme-dot" style="background:${theme.surface2}"></span>
      </span>
    `;
    item.addEventListener("click", () => applyTheme(theme));
    themeList.appendChild(item);
  });
}

const KEYBOARD_CUSTOM_VALUE = "Unlisted / Custom";
const KEYBOARD_BRANDS = ["Keychron", "Razer", "Logitech", "Corsair", "Ducky", "HHKB"];

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
  windowStartIndex = 0;
}

function renderWords() {
  const visibleCount = 60;
  testEl.innerHTML = "";
  const maxStart = Math.max(words.length - visibleCount, 0);
  const windowStart = Math.min(windowStartIndex, maxStart);
  const visibleWords = words.slice(windowStart, windowStart + visibleCount);
  visibleWords.forEach((word, index) => {
    const delay = index * 0.02;
    const absoluteIndex = windowStart + index;
    const wordEl = document.createElement("span");
    wordEl.className = "word";
    wordEl.style.animationDelay = `${delay}s`;
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
  resultOverlay.classList.remove("show");
  resultOverlay.setAttribute("aria-hidden", "true");
  renderWords();
  testEl.classList.remove("fade");
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

function adjustWindowForLines() {
  const wordEls = Array.from(testEl.querySelectorAll(".word"));
  if (!wordEls.length) return;
  const baseIndex = windowStartIndex;
  const lineStarts = [];
  let lastTop = null;
  wordEls.forEach((el, idx) => {
    const top = el.offsetTop;
    if (lastTop == null || top > lastTop) {
      lineStarts.push(baseIndex + idx);
      lastTop = top;
    }
  });
  const currentLineIndex = lineStarts
    .map((start, i) => ({ start, i }))
    .filter(({ start }) => currentIndex >= start)
    .pop()?.i ?? 0;

  if (currentLineIndex >= 2 && lineStarts[1] != null) {
    windowStartIndex = lineStarts[1];
    renderWords();
  }
}

function finishTest() {
  isFinished = true;
  clearInterval(timerId);
  timerId = null;
  inputEl.blur();

  const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const wpm = elapsed > 0 ? Math.round((totalCorrect / 5) / (elapsed / 60)) : 0;
  const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;

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
    loginMenu.classList.add("hidden");
  } else {
    loginMenu.classList.add("hidden");
  }
}

async function loadLeaderboard(duration = 15) {
  const res = await fetch(`/api/leaderboard?duration=${duration}`);
  const data = await res.json();
  leaderboardList.innerHTML = "";
  data.scores.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "leaderboard-row";

    const rank = document.createElement("span");
    if (index === 0) {
      rank.className = "leaderboard-rank";
      rank.innerHTML = `
        <svg viewBox="0 0 64 80" aria-hidden="true">
          <path d="M32 6c13.25 0 24 10.75 24 24S45.25 54 32 54 8 43.25 8 30 18.75 6 32 6Z" fill="none" stroke="currentColor" stroke-width="6" />
          <path d="M32 14c9.94 0 18 8.06 18 18S41.94 50 32 50 14 41.94 14 32 22.06 14 32 14Z" fill="none" stroke="currentColor" stroke-width="6" />
          <path d="M29 21h6v24h-6z" fill="currentColor" />
          <path d="M27 23l8-4v6l-8 4z" fill="currentColor" />
          <path d="M8 52l-6 22 16-10 4-12z" fill="currentColor" />
          <path d="M56 52l6 22-16-10-4-12z" fill="currentColor" />
        </svg>
      `;
    } else {
      rank.textContent = `${index + 1}`;
    }

    const name = document.createElement("button");
    name.type = "button";
    name.className = "leaderboard-name";
    name.dataset.userId = entry.user_id;
    if (entry.avatar_url) {
      const avatar = document.createElement("img");
      avatar.src = entry.avatar_url;
      avatar.alt = entry.display_name;
      name.appendChild(avatar);
    }
    const label = document.createElement("span");
    label.textContent = entry.display_name;
    name.appendChild(label);
    name.addEventListener("click", () => openPublicProfile(entry.user_id));

    const wpm = document.createElement("span");
    wpm.textContent = entry.wpm;

    const accuracy = document.createElement("span");
    accuracy.textContent = `${entry.accuracy}%`;

    const date = document.createElement("span");
    const dateValue = new Date(entry.created_at);
    date.textContent = dateValue.toLocaleDateString();

    item.append(rank, name, wpm, accuracy, date);
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

async function loadProfile() {
  if (!currentUser) return;
  profileName.textContent = currentUser.displayName;
  profileProvider.textContent = `Signed in with ${currentUser.provider}`;
  if (currentUser.createdAt) {
    const joinDate = new Date(currentUser.createdAt).toLocaleDateString();
    profileJoin.textContent = `Joined ${joinDate}`;
  } else {
    profileJoin.textContent = "";
  }
  keyboardStatus.textContent = currentUser.keyboardModel
    ? `Using ${currentUser.keyboardModel}`
    : "Choose your keyboard to display it on your profile.";
  if (currentUser.avatarUrl) {
    profileAvatar.src = currentUser.avatarUrl;
    profileAvatar.classList.remove("hidden");
  } else {
    profileAvatar.classList.add("hidden");
  }

  const res = await fetch("/api/me/scores");
  const data = await res.json();
  profileBest.innerHTML = "";
  profileRecent.innerHTML = "";

  if (!data.best.length) {
    profileBest.innerHTML = "<li>No scores yet.</li>";
  } else {
    data.best.forEach((entry) => {
      const item = document.createElement("li");
      item.textContent = `${entry.wpm} WPM · ${entry.accuracy}% · ${entry.duration_seconds}s`;
      profileBest.appendChild(item);
    });
  }

  if (!data.recent.length) {
    profileRecent.innerHTML = "<li>No recent runs.</li>";
  } else {
    data.recent.forEach((entry) => {
      const item = document.createElement("li");
      item.textContent = `${entry.wpm} WPM · ${entry.accuracy}% · ${entry.duration_seconds}s`;
      profileRecent.appendChild(item);
    });
  }

  const model = currentUser.keyboardModel || "";
  if (KEYBOARD_BRANDS.includes(model)) {
    keyboardSelect.value = model;
    keyboardCustomWrap.classList.add("hidden");
  } else if (model) {
    keyboardSelect.value = KEYBOARD_CUSTOM_VALUE;
    keyboardCustomInput.value = model;
    keyboardCustomWrap.classList.remove("hidden");
  } else {
    keyboardSelect.value = "";
    keyboardCustomWrap.classList.add("hidden");
  }
}

async function saveKeyboard(label) {
  keyboardStatus.textContent = "Saving...";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch("/api/me/keyboard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyboardModel: label }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Save failed (${res.status})`);
    }
    const data = await res.json();
    currentUser.keyboardModel = data.keyboardModel;
    keyboardStatus.textContent = data.keyboardModel
      ? `Using ${data.keyboardModel}`
      : "Choose your keyboard to display it on your profile.";
  } catch (err) {
    keyboardStatus.textContent = "Save failed. Try again.";
  } finally {
    clearTimeout(timeout);
  }
}

function openProfile() {
  profileOverlay.classList.add("show");
  profileOverlay.setAttribute("aria-hidden", "false");
}

function closeProfile() {
  profileOverlay.classList.remove("show");
  profileOverlay.setAttribute("aria-hidden", "true");
}

function openPublicProfileOverlay() {
  publicProfileOverlay.classList.add("show");
  publicProfileOverlay.setAttribute("aria-hidden", "false");
}

function closePublicProfileOverlay() {
  publicProfileOverlay.classList.remove("show");
  publicProfileOverlay.setAttribute("aria-hidden", "true");
}

async function openPublicProfile(userId) {
  const res = await fetch(`/api/users/${userId}`);
  if (!res.ok) return;
  const data = await res.json();
  publicName.textContent = data.user.displayName;
  publicKeyboard.textContent = data.user.keyboardModel
    ? `Keyboard: ${data.user.keyboardModel}`
    : "Keyboard: Unlisted";
  if (data.user.createdAt) {
    const joinDate = new Date(data.user.createdAt).toLocaleDateString();
    publicJoin.textContent = `Joined ${joinDate}`;
  } else {
    publicJoin.textContent = "";
  }
  if (data.user.avatarUrl) {
    publicAvatar.src = data.user.avatarUrl;
    publicAvatar.classList.remove("hidden");
  } else {
    publicAvatar.classList.add("hidden");
  }
  publicBest.innerHTML = "";
  if (!data.best.length) {
    publicBest.innerHTML = "<li>No scores yet.</li>";
  } else {
    data.best.forEach((entry) => {
      const item = document.createElement("li");
      item.textContent = `${entry.wpm} WPM · ${entry.accuracy}% · ${entry.duration_seconds}s`;
      publicBest.appendChild(item);
    });
  }
  openPublicProfileOverlay();
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

function armRestart() {
  restartArmed = true;
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    restartArmed = false;
  }, 1200);
}

function attemptRestart(key) {
  if (key === "Tab") {
    armRestart();
    return true;
  }
  if (key === "Enter" && restartArmed) {
    restartArmed = false;
    resetTest();
    inputEl.focus();
    return true;
  }
  return false;
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
    adjustWindowForLines();
    inputEl.value = "";
    updateStats();
    return;
  }

  gradeWord(value);
  updateStats();
});

inputEl.addEventListener("keydown", (event) => {
  if (attemptRestart(event.key)) {
    event.preventDefault();
  }
});

document.addEventListener("keydown", (event) => {
  if (isFinished) return;
  if (document.activeElement && document.activeElement.closest(".overlay")) {
    return;
  }
  if (attemptRestart(event.key)) {
    event.preventDefault();
    return;
  }
  if (document.activeElement !== inputEl && event.key.length === 1) {
    inputEl.focus();
    inputEl.value += event.key;
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    event.preventDefault();
  }
});

document.addEventListener("click", (event) => {
  if (isFinished) return;
  if (event.target.closest(".overlay")) return;
  inputEl.focus();
});

resetBtn.addEventListener("click", () => {
  resetTest();
  inputEl.focus();
});

logo.addEventListener("click", () => {
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
  closeProfile();
});

userBtn.addEventListener("click", () => {
  if (currentUser) {
    loadProfile();
    openProfile();
  } else {
    loginOverlay.classList.add("show");
    loginOverlay.setAttribute("aria-hidden", "false");
  }
});

leaderboardBtn.addEventListener("click", () => {
  leaderboardOverlay.classList.add("show");
  leaderboardOverlay.setAttribute("aria-hidden", "false");
  const activeTab = leaderboardTabs.find((tab) => tab.classList.contains("active"));
  const duration = Number(activeTab?.dataset.duration || 15);
  leaderboardTitle.textContent = `Time ${duration} Leaderboard`;
  loadLeaderboard(duration);
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".auth")) return;
  loginMenu.classList.add("hidden");
});

resultOverlay.addEventListener("click", (event) => {
  if (event.target === resultOverlay) {
    resetTest();
    inputEl.focus();
  }
});

closeProfileBtn.addEventListener("click", closeProfile);
closePublicProfileBtn.addEventListener("click", closePublicProfileOverlay);

publicProfileOverlay.addEventListener("click", (event) => {
  if (event.target === publicProfileOverlay) {
    closePublicProfileOverlay();
  }
});

themeBtn.addEventListener("click", () => {
  themeOverlay.classList.add("show");
  themeOverlay.setAttribute("aria-hidden", "false");
  renderThemeList();
  themeSearch.value = "";
  themeSearch.focus();
});

closeThemeBtn.addEventListener("click", () => {
  themeOverlay.classList.remove("show");
  themeOverlay.setAttribute("aria-hidden", "true");
});

themeOverlay.addEventListener("click", (event) => {
  if (event.target === themeOverlay) {
    themeOverlay.classList.remove("show");
    themeOverlay.setAttribute("aria-hidden", "true");
  }
});

themeSearch.addEventListener("input", (event) => {
  renderThemeList(event.target.value);
});

themeSearch.addEventListener("keyup", (event) => {
  renderThemeList(event.target.value);
});

keyboardSelect.addEventListener("change", () => {
  if (!currentUser) return;
  const value = keyboardSelect.value;
  if (value === KEYBOARD_CUSTOM_VALUE) {
    keyboardCustomWrap.classList.remove("hidden");
    keyboardCustomInput.focus();
    return;
  }
  keyboardCustomWrap.classList.add("hidden");
  if (!value) {
    saveKeyboard("");
  } else {
    saveKeyboard(value);
  }
});

keyboardCustomSave.addEventListener("click", () => {
  const value = keyboardCustomInput.value.trim();
  if (!value) return;
  saveKeyboard(value);
  keyboardCustomWrap.classList.add("hidden");
  keyboardSelect.value = value;
});

closeLeaderboardBtn.addEventListener("click", () => {
  leaderboardOverlay.classList.remove("show");
  leaderboardOverlay.setAttribute("aria-hidden", "true");
});

leaderboardOverlay.addEventListener("click", (event) => {
  if (event.target === leaderboardOverlay) {
    leaderboardOverlay.classList.remove("show");
    leaderboardOverlay.setAttribute("aria-hidden", "true");
  }
});

leaderboardTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    leaderboardTabs.forEach((btn) => btn.classList.remove("active"));
    tab.classList.add("active");
    const duration = Number(tab.dataset.duration);
    leaderboardTitle.textContent = `Time ${duration} Leaderboard`;
    loadLeaderboard(duration);
  });
});

loginOverlay.addEventListener("click", (event) => {
  if (event.target === loginOverlay) {
    loginOverlay.classList.remove("show");
    loginOverlay.setAttribute("aria-hidden", "true");
  }
});

closeLoginBtn.addEventListener("click", () => {
  loginOverlay.classList.remove("show");
  loginOverlay.setAttribute("aria-hidden", "true");
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
const savedTheme = localStorage.getItem("pulsetype-theme");
if (savedTheme) {
  const theme = THEMES.find((t) => t.name === savedTheme);
  if (theme) applyTheme(theme);
} else {
  applyTheme(THEMES[0]);
}
