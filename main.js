let dashboardState = {
  theme: "dark",
  focusDuration: 25,
  breakDuration: 5,
  timeFormat: "12",
  autoBreak: false,
  notifications: true,
  backgroundGradient: "gradient-bg",
  chimeSound: true,
  fullScreen: false,
  backgroundAnimation: false,
};

let tempSettings = {};
let timerState = {
  isRunning: false,
  isPaused: false,
  currentTime: 0,
  isBreak: false,
  interval: null,
};

function initDashboard() {
  const elements = {
    themeToggle: document.getElementById("theme-toggle"),
    themeIcon: document.getElementById("theme-icon"),
    settingsBtn: document.getElementById("settings-btn"),
    fullscreenBtn: document.getElementById("fullscreen-btn"),
    currentTime: document.getElementById("current-time"),
    currentDate: document.getElementById("current-date"),
    timerDisplay: document.getElementById("timer-display"),
    timerLabel: document.getElementById("timer-label"),
    progressCircle: document.getElementById("progress-circle"),
    timerStart: document.getElementById("timer-start"),
    timerPause: document.getElementById("timer-pause"),
    timerReset: document.getElementById("timer-reset"),
    settingsModal: document.getElementById("settings-modal"),
    closeSettings: document.getElementById("close-settings"),
    focusDuration: document.getElementById("focus-duration"),
    breakDuration: document.getElementById("break-duration"),
    timeFormat: document.getElementById("time-format"),
    autoBreak: document.getElementById("auto-break"),
    notifications: document.getElementById("notifications"),
    chimeSound: document.getElementById("chime-sound"),
    saveSettings: document.getElementById("save-settings"),
    resetSettings: document.getElementById("reset-settings"),
    focusDurationValue: document.getElementById("focus-duration-value"),
    breakDurationValue: document.getElementById("break-duration-value"),
  };

  loadSettings();
  setupEventListeners(elements);
  initTheme(elements);
  updateClock(elements);
  resetTimer(elements);
  setInterval(() => updateClock(elements), 1000);
  if ("Notification" in window) {
    Notification.requestPermission();
  }
}

function loadSettings() {
  const saved = localStorage.getItem("focusDashboard");
  if (saved) {
    dashboardState = { ...dashboardState, ...JSON.parse(saved) };
  }
  const customGradient = localStorage.getItem("customGradient");
  if (customGradient) {
    dashboardState.customGradient = customGradient;
  }
  applyBackgroundGradient();
}

function saveSettings() {
  localStorage.setItem("focusDashboard", JSON.stringify(dashboardState));
  if (dashboardState.customGradient) {
    localStorage.setItem("customGradient", dashboardState.customGradient);
  } else {
    localStorage.removeItem("customGradient");
  }
}

function initTheme(elements) {
  const savedTheme = localStorage.getItem("theme") || "dark";
  dashboardState.theme = savedTheme;
  updateTheme(elements);
}

function toggleTheme(elements) {
  dashboardState.theme = dashboardState.theme === "light" ? "dark" : "light";
  updateTheme(elements);
  localStorage.setItem("theme", dashboardState.theme);
}

function updateTheme(elements) {
  const html = document.documentElement;
  if (dashboardState.theme === "dark") {
    html.classList.add("dark");
    elements.themeIcon.setAttribute(
      "d",
      "M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z",
    );
  } else {
    html.classList.remove("dark");
    elements.themeIcon.setAttribute(
      "d",
      "M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z",
    );
  }
}

function updateClock(elements) {
  const now = new Date();
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: dashboardState.timeFormat === "12",
  };
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let timeString = now.toLocaleTimeString("en-US", timeOptions);
  let ampm = "";
  if (dashboardState.timeFormat === "12") {
    const match = timeString.match(/\s?(AM|PM)$/);
    if (match) {
      ampm = match[1];
      timeString = timeString.replace(/\s?(AM|PM)$/, "");
    }
  }
  elements.currentTime.textContent = timeString;
  const ampmElem = document.getElementById("current-ampm");
  if (ampmElem) {
    ampmElem.textContent = ampm;
    ampmElem.style.display = dashboardState.timeFormat === "12" ? "" : "none";
  }
  elements.currentDate.textContent = now.toLocaleDateString(
    "en-US",
    dateOptions,
  );
}

function resetTimer(elements) {
  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.currentTime = timerState.isBreak
    ? dashboardState.breakDuration * 60
    : dashboardState.focusDuration * 60;
  updateTimerDisplay(elements);
  updateTimerButtons(elements);
  updateProgressCircle(elements);
}

function startTimer(elements) {
  if (timerState.isPaused) {
    timerState.isPaused = false;
  } else {
    timerState.currentTime = timerState.isBreak
      ? dashboardState.breakDuration * 60
      : dashboardState.focusDuration * 60;
  }
  timerState.isRunning = true;
  updateTimerButtons(elements);
  timerState.interval = setInterval(() => {
    timerState.currentTime--;
    updateTimerDisplay(elements);
    updateProgressCircle(elements);
    if (timerState.currentTime <= 0) {
      timerComplete(elements);
    }
  }, 1000);
}

function pauseTimer(elements) {
  timerState.isRunning = false;
  timerState.isPaused = true;
  clearInterval(timerState.interval);
  updateTimerButtons(elements);
}

function timerComplete(elements) {
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  timerState.isPaused = false;
  if (
    dashboardState.notifications &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    const title = timerState.isBreak
      ? "Break Complete!"
      : "Focus Session Complete!";
    const body = timerState.isBreak
      ? "Time to get back to work!"
      : "Great job! Time for a break.";
    new Notification(title, {
      body: body,
      icon: "/logo.png",
    });
  }
  if (dashboardState.chimeSound) {
    const audio = document.getElementById("chime-audio");
    audio.currentTime = 0;
    audio.play();
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 5000);
  }
  timerState.isBreak = !timerState.isBreak;
  if (dashboardState.autoBreak && timerState.isBreak) {
    setTimeout(() => {
      resetTimer(elements);
      startTimer(elements);
    }, 1000);
  } else {
    resetTimer(elements);
  }
}

function updateTimerDisplay(elements) {
  const minutes = Math.floor(timerState.currentTime / 60);
  const seconds = timerState.currentTime % 60;
  elements.timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  elements.timerLabel.textContent = timerState.isBreak
    ? "Break Time"
    : "Focus Time";
}

function updateTimerButtons(elements) {
  elements.timerStart.disabled = timerState.isRunning;
  elements.timerPause.disabled = !timerState.isRunning;
  if (timerState.isRunning) {
    elements.timerStart.innerHTML = `
      Running
    `;
    elements.timerPause.innerHTML = `
      Pause
    `;
  } else if (timerState.isPaused) {
    elements.timerStart.innerHTML = `
      Resume
    `;
    elements.timerPause.innerHTML = `
      Paused
    `;
  } else {
    elements.timerStart.innerHTML = `
      Start
    `;
    elements.timerPause.innerHTML = `
      Pause
    `;
  }
}

function updateProgressCircle(elements) {
  const totalTime = timerState.isBreak
    ? dashboardState.breakDuration * 60
    : dashboardState.focusDuration * 60;
  const progress = (totalTime - timerState.currentTime) / totalTime;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - progress * circumference;
  elements.progressCircle.style.strokeDashoffset = offset;
  elements.progressCircle.setAttribute(
    "stroke",
    timerState.isBreak ? "url(#break-gradient)" : "url(#gradient)",
  );
}

function applyBackgroundGradient() {
  const gradients = [
    "gradient-bg",
    "gradient-sunset",
    "gradient-mint",
    "gradient-night",
  ];
  const body = document.body;
  gradients.forEach((g) => body.classList.remove(g));
  if (
    dashboardState.customGradient &&
    dashboardState.customGradient.trim() !== ""
  ) {
    body.style.background = dashboardState.customGradient;
  } else {
    body.style.background = "";
    body.classList.add(dashboardState.backgroundGradient || "gradient-bg");
  }
}

function updateFullscreenIcon(isFull) {
  const iconPath = document.getElementById("fullscreen-icon-path");
  if (isFull) {
    iconPath.setAttribute("d", "M6 18L18 6M6 6l12 12");
  } else {
    iconPath.setAttribute(
      "d",
      "M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3",
    );
  }
}

function setFullScreen(enabled) {
  if (enabled) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  } else {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }
  updateFullscreenIcon(enabled);
}

function openSettings(elements) {
  tempSettings = { ...dashboardState };
  elements.settingsModal.classList.remove("hidden");
  elements.focusDuration.value = tempSettings.focusDuration;
  elements.breakDuration.value = tempSettings.breakDuration;
  elements.timeFormat.value = tempSettings.timeFormat;
  elements.autoBreak.checked = tempSettings.autoBreak;
  elements.notifications.checked = tempSettings.notifications;
  elements.chimeSound.checked = tempSettings.chimeSound;
  elements.focusDurationValue.textContent = tempSettings.focusDuration + " min";
  elements.breakDurationValue.textContent = tempSettings.breakDuration + " min";
  document.querySelectorAll(".gradient-option").forEach((btn) => {
    if (btn.dataset.gradient === tempSettings.backgroundGradient) {
      btn.classList.add("ring-2", "ring-blue-400");
    } else {
      btn.classList.remove("ring-2", "ring-blue-400");
    }
  });
  const customGradientInput = document.getElementById("custom-gradient");
  if (customGradientInput) {
    customGradientInput.value = tempSettings.customGradient || "";
  }
  const color1 = document.getElementById("gradient-color1");
  const color2 = document.getElementById("gradient-color2");
  const direction = document.getElementById("gradient-direction");
  if (
    tempSettings.customGradient &&
    tempSettings.customGradient.startsWith("linear-gradient")
  ) {
    const match = tempSettings.customGradient.match(
      /linear-gradient\\(([^,]+),\\s*([^,]+),\\s*([^\\)]+)\\)/,
    );
    if (match) {
      direction.value = match[1].trim();
      color1.value = match[2].trim();
      color2.value = match[3].trim();
    }
  } else {
    color1.value = "#667eea";
    color2.value = "#764ba2";
    direction.value = "135deg";
  }
}

function closeSettings(elements) {
  elements.settingsModal.classList.add("hidden");
}

function applySettings(elements) {
  dashboardState = { ...dashboardState, ...tempSettings };
  saveSettings();
  applyBackgroundGradient();
  resetTimer(elements);
  closeSettings(elements);
}

function resetToDefaults(elements) {
  dashboardState.focusDuration = 25;
  dashboardState.breakDuration = 5;
  dashboardState.timeFormat = "12";
  dashboardState.autoBreak = false;
  dashboardState.notifications = true;
  dashboardState.chimeSound = true;
  openSettings(elements);
}

function setupEventListeners(elements) {
  elements.themeToggle.addEventListener("click", () => toggleTheme(elements));
  elements.settingsBtn.addEventListener("click", () => openSettings(elements));
  if (elements.closeSettings) {
    elements.closeSettings.addEventListener("click", () =>
      closeSettings(elements),
    );
  }
  if (elements.saveSettings) {
    elements.saveSettings.addEventListener("click", () =>
      applySettings(elements),
    );
  }
  if (elements.resetSettings) {
    elements.resetSettings.addEventListener("click", () =>
      resetToDefaults(elements),
    );
  }
  elements.timerStart.addEventListener("click", () => startTimer(elements));
  elements.timerPause.addEventListener("click", () => pauseTimer(elements));
  elements.timerReset.addEventListener("click", () => resetTimer(elements));
  elements.focusDuration.addEventListener("input", (e) => {
    tempSettings.focusDuration = parseInt(e.target.value);
    elements.focusDurationValue.textContent = e.target.value + " min";
  });
  elements.breakDuration.addEventListener("input", (e) => {
    tempSettings.breakDuration = parseInt(e.target.value);
    elements.breakDurationValue.textContent = e.target.value + " min";
  });
  elements.timeFormat.addEventListener("change", (e) => {
    tempSettings.timeFormat = e.target.value;
  });
  elements.autoBreak.addEventListener("change", (e) => {
    tempSettings.autoBreak = e.target.checked;
  });
  elements.notifications.addEventListener("change", (e) => {
    tempSettings.notifications = e.target.checked;
  });
  elements.chimeSound.addEventListener("change", (e) => {
    tempSettings.chimeSound = e.target.checked;
  });
  document.querySelectorAll(".gradient-option").forEach((btn) => {
    btn.addEventListener("click", function () {
      tempSettings.backgroundGradient = this.dataset.gradient;
      tempSettings.customGradient = "";
      document
        .querySelectorAll(".gradient-option")
        .forEach((b) => b.classList.remove("ring-2", "ring-blue-400"));
      this.classList.add("ring-2", "ring-blue-400");
      const customGradientInput = document.getElementById("custom-gradient");
      if (customGradientInput) customGradientInput.value = "";
    });
  });
  const customGradientInput = document.getElementById("custom-gradient");
  const color1 = document.getElementById("gradient-color1");
  const color2 = document.getElementById("gradient-color2");
  const direction = document.getElementById("gradient-direction");
  if (customGradientInput) {
    customGradientInput.addEventListener("input", function () {
      tempSettings.customGradient = this.value;
      if (this.value.trim() !== "") {
        tempSettings.backgroundGradient = "";
        document
          .querySelectorAll(".gradient-option")
          .forEach((b) => b.classList.remove("ring-2", "ring-blue-400"));
        const match = this.value.match(
          /linear-gradient\\(([^,]+),\\s*([^,]+),\\s*([^\\)]+)\\)/,
        );
        if (match) {
          direction.value = match[1].trim();
          color1.value = match[2].trim();
          color2.value = match[3].trim();
        }
      }
    });
  }
  if (color1 && color2 && direction) {
    function updateCustomGradientFromPickers() {
      const grad = `linear-gradient(${direction.value}, ${color1.value}, ${color2.value})`;
      customGradientInput.value = grad;
      tempSettings.customGradient = grad;
      tempSettings.backgroundGradient = "";
      document
        .querySelectorAll(".gradient-option")
        .forEach((b) => b.classList.remove("ring-2", "ring-blue-400"));
    }
    color1.addEventListener("input", updateCustomGradientFromPickers);
    color2.addEventListener("input", updateCustomGradientFromPickers);
    direction.addEventListener("change", updateCustomGradientFromPickers);
  }
  elements.settingsModal.addEventListener("click", (e) => {
    if (e.target === elements.settingsModal) {
      closeSettings(elements);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSettings(elements);
    }
    if (e.key === " " && !e.target.matches("input, textarea, select")) {
      e.preventDefault();
      if (timerState.isRunning) {
        pauseTimer(elements);
      } else {
        startTimer(elements);
      }
    }
  });
  elements.fullscreenBtn.addEventListener("click", () => {
    const isFull = !document.fullscreenElement;
    setFullScreen(isFull);
    dashboardState.fullScreen = isFull;
    tempSettings.fullScreen = isFull;
    saveSettings();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
});
