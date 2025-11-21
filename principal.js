document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // ELEMENTOS BASE
  // ===============================
  const menuToggle = document.getElementById("menuToggle");
  const customPanel = document.getElementById("customPanel");
  const overlay = document.getElementById("overlay");
  const colorPicker = document.getElementById("colorPicker");
  const resetBtn = document.getElementById("resetBtn");
  const PAGE_KEY = "themeColor_" + location.pathname;
  // --- AUDIO DE MEDITACIÓN ---
  const medAudio = document.getElementById("medAudio"); // Cambia la ruta si es necesario
  medAudio.loop = true;
  medAudio.volume = 0.7;

  // ===============================
  // CREAR CONTENEDOR DE NOTIFICACIONES
  // ===============================
  if (!document.getElementById("notification-container")) {
    const container = document.createElement("div");
    container.id = "notification-container";
    document.body.appendChild(container);
  }

  // ===============================
  // FUNCIÓN NOTIFICACIONES TOAST
  // ===============================
  window.mostrarNotificacion = function (titulo, mensaje, tipo = "success") {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const notification = document.createElement("div");
    notification.className = `notification ${tipo}`;

    const icon = tipo === "success" ? "✓" : tipo === "error" ? "⚠" : "ℹ";

    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <h4>${titulo}</h4>
        <p>${mensaje}</p>
      </div>
      <button class="notification-close">×</button>
    `;

    container.appendChild(notification);

    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => cerrarNotificacion(notification));

    setTimeout(() => cerrarNotificacion(notification), 4000);
  };

  function cerrarNotificacion(notif) {
    notif.style.animation = "slideOutRight 0.4s ease-out";
    setTimeout(() => notif.remove(), 400);
  }

  // ===============================
  // PANEL DE PERSONALIZACIÓN
  // ===============================
  const defaultColor = "#81c784";

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      customPanel.classList.toggle("active");
      overlay.classList.toggle("active");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      customPanel.classList.remove("active");
      overlay.classList.remove("active");
    });
  }

  if (colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      aplicarColores(e.target.value);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      aplicarColores(defaultColor);
      colorPicker.value = defaultColor;
      mostrarNotificacion(
        "Colores restaurados",
        "Los colores se han regresado a su estado original.",
        "success"
      );
    });
  }

  function aplicarColores(color) {
    const header = document.querySelector("header");
    if (header) {
      header.style.background = `linear-gradient(135deg, ${color}, ${ajustarColor(
        color,
        -20
      )})`;
    }

    const footer = document.querySelector(".footer");
    if (footer) {
      footer.style.background = `linear-gradient(135deg, ${color}, ${ajustarColor(
        color,
        -20
      )})`;
    }

    document.querySelectorAll(".activities .card button").forEach((btn) => {
      btn.style.background = `linear-gradient(135deg, ${color}, ${ajustarColor(
        color,
        -20
      )})`;
    });

    localStorage.setItem(PAGE_KEY, color);
  }

  function ajustarColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    return "#" + ((R << 16) | (G << 8) | B).toString(16).padStart(6, "0");
  }

  const savedColor = localStorage.getItem(PAGE_KEY);
  if (savedColor && colorPicker) {
    colorPicker.value = savedColor;
    aplicarColores(savedColor);
  }

  // ===============================
  // MOSTRAR PANELES DE ACTIVIDADES
  // ===============================
  window.mostrarPanel = function (panelId) {
    // Cerrar todos los paneles
    document.querySelectorAll(".panel-actividad").forEach((panel) => {
      panel.style.display = "none";
    });

    // Abrir el panel seleccionado
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.style.display = "block";
    }
  };
});
// ===============================
// MODAL DE EJERCICIO FÍSICO
// ===============================

const exerciseOverlay = document.getElementById("exerciseOverlay");
const exerciseModal = document.getElementById("exerciseModal");
const closeExercise = document.getElementById("closeExercise");
const exerciseSelectionScreen = document.getElementById(
  "exerciseSelectionScreen"
);
const exerciseProgressScreen = document.getElementById(
  "exerciseProgressScreen"
);

const routineTitle = document.getElementById("routineTitle");
const exerciseTimeDisplay = document.getElementById("exerciseTimeDisplay");
const exerciseName = document.getElementById("exerciseName");
const exerciseDescription = document.getElementById("exerciseDescription");
const currentStepDisplay = document.getElementById("currentStep");
const totalStepsDisplay = document.getElementById("totalSteps");
const progressFill = document.getElementById("progressFill");
const pauseExercise = document.getElementById("pauseExercise");
const skipExercise = document.getElementById("skipExercise");
const restartExercise = document.getElementById("restartExercise");
const exerciseSVG = document.getElementById("exerciseSVG");

let currentRoutine = null;
let exerciseTimeLeft = 0;
let exerciseIsPlaying = false;
let currentExerciseStep = 0;
let exerciseTimerInterval = null;
let exerciseStepInterval = null;

// Definición de rutinas
const routines = {
  morning: {
    name: "Estiramiento Matutino",
    duration: 300,
    steps: [
      {
        name: "Respiración Profunda",
        description: "Inhala por la nariz (4 seg), exhala por la boca (6 seg)",
        duration: 60,
        animation: "breathing",
      },
      {
        name: "Estiramiento de Cuello",
        description: "Inclina suavemente la cabeza hacia cada lado",
        duration: 45,
        animation: "neck",
      },
      {
        name: "Rotación de Hombros",
        description: "Círculos lentos hacia atrás y adelante",
        duration: 45,
        animation: "shoulders",
      },
      {
        name: "Estiramiento de Columna",
        description: "Inclínate hacia adelante lentamente, brazos colgando",
        duration: 60,
        animation: "spine",
      },
      {
        name: "Estiramiento de Brazos",
        description: "Extiende los brazos arriba, estira todo el cuerpo",
        duration: 45,
        animation: "arms",
      },
      {
        name: "Relajación Final",
        description: "Respira profundo y siente tu cuerpo relajado",
        duration: 45,
        animation: "relax",
      },
    ],
  },
  mobility: {
    name: "Movilidad y Caminata",
    duration: 300,
    steps: [
      {
        name: "Movilidad de Tobillos",
        description: "Gira los tobillos en círculos, ambos lados",
        duration: 40,
        animation: "ankles",
      },
      {
        name: "Movilidad de Rodillas",
        description: "Flexiona y extiende las rodillas suavemente",
        duration: 40,
        animation: "knees",
      },
      {
        name: "Rotación de Cadera",
        description: "Círculos amplios con las caderas",
        duration: 50,
        animation: "hips",
      },
      {
        name: "Caminata en el Lugar",
        description: "Camina levantando las rodillas moderadamente",
        duration: 90,
        animation: "walking",
      },
      {
        name: "Respiración Diafragmática",
        description: "Manos en el abdomen, respira profundamente",
        duration: 50,
        animation: "breathing",
      },
      {
        name: "Estiramiento Final",
        description: "Brazos arriba, estira todo el cuerpo",
        duration: 30,
        animation: "stretch",
      },
    ],
  },
};

// Función para iniciar una rutina
window.iniciarRutina = function (routineType) {
  currentRoutine = routines[routineType];
  currentExerciseStep = 0;
  exerciseTimeLeft = currentRoutine.duration;

  routineTitle.textContent = currentRoutine.name;
  totalStepsDisplay.textContent = currentRoutine.steps.length;

  exerciseSelectionScreen.classList.add("hidden");
  exerciseProgressScreen.classList.remove("hidden");

  updateExerciseDisplay();
  startExercise();
};

// Abrir modal de ejercicio
window.openExerciseModal = function () {
  exerciseOverlay.style.display = "block";
  exerciseModal.style.display = "block";

  setTimeout(() => {
    exerciseOverlay.classList.add("active");
    exerciseModal.classList.add("active");
  }, 10);

  showExerciseSelectionScreen();
};

// Cerrar modal de ejercicio
function closeExerciseModal() {
  stopExercise();
  exerciseOverlay.classList.remove("active");
  exerciseModal.classList.remove("active");

  setTimeout(() => {
    exerciseOverlay.style.display = "none";
    exerciseModal.style.display = "none";
    showExerciseSelectionScreen();
  }, 300);
}

// Mostrar pantalla de selección
function showExerciseSelectionScreen() {
  exerciseSelectionScreen.classList.remove("hidden");
  exerciseProgressScreen.classList.add("hidden");
}

// Iniciar ejercicio
function startExercise() {
  exerciseIsPlaying = true;
  updatePauseButton();

  exerciseTimerInterval = setInterval(() => {
    if (exerciseTimeLeft > 0) {
      exerciseTimeLeft--;
      updateExerciseTimeDisplay();
    } else {
      finishExercise();
    }
  }, 1000);

  startExerciseStep();
}

// Pausar ejercicio
function pauseExerciseFunc() {
  exerciseIsPlaying = false;
  updatePauseButton();
  clearInterval(exerciseTimerInterval);
  clearTimeout(exerciseStepInterval);
}

// Detener ejercicio completamente
function stopExercise() {
  pauseExerciseFunc();
  exerciseTimeLeft = 0;
  currentExerciseStep = 0;
}

// Iniciar un paso específico
function startExerciseStep() {
  const step = currentRoutine.steps[currentExerciseStep];

  exerciseName.textContent = step.name;
  exerciseDescription.textContent = step.description;
  currentStepDisplay.textContent = currentExerciseStep + 1;

  updateProgressBar();
  animateExercise(step.animation);

  exerciseStepInterval = setTimeout(() => {
    nextExerciseStep();
  }, step.duration * 1000);
}

// Avanzar al siguiente paso
function nextExerciseStep() {
  if (currentExerciseStep < currentRoutine.steps.length - 1) {
    currentExerciseStep++;
    startExerciseStep();
  } else {
    finishExercise();
  }
}

// Actualizar barra de progreso
function updateProgressBar() {
  const progress =
    ((currentExerciseStep + 1) / currentRoutine.steps.length) * 100;
  progressFill.style.width = `${progress}%`;
}

// Actualizar display de tiempo
function updateExerciseTimeDisplay() {
  const minutes = Math.floor(exerciseTimeLeft / 60);
  const seconds = exerciseTimeLeft % 60;
  exerciseTimeDisplay.textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function updateExerciseDisplay() {
  updateExerciseTimeDisplay();
  if (currentRoutine && currentRoutine.steps.length > 0) {
    startExerciseStep();
  }
}

// Actualizar botón de pausa
function updatePauseButton() {
  const playIcon = pauseExercise.querySelector(".play-icon");
  const pauseIcon = pauseExercise.querySelector(".pause-icon");

  if (exerciseIsPlaying) {
    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");
  } else {
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
  }
}

// Finalizar ejercicio
function finishExercise() {
  stopExercise();
  exerciseName.textContent = "¡Rutina Completada!";
  exerciseDescription.textContent =
    "Excelente trabajo, tu cuerpo te lo agradece 💪";

  mostrarNotificacion(
    "¡Ejercicio completado!",
    "Has dedicado tiempo para cuidar tu cuerpo. ¡Sigue así! 🎉",
    "success"
  );
}

// Animaciones de ejercicios
function svgDefsStickman() {
  return `
    <defs>
      <style>
        .stick { stroke:#2e7d32; stroke-width:6; stroke-linecap:round; stroke-linejoin:round; fill:none; }
        .head { fill:#81c784; stroke:#2e7d32; stroke-width:3; }
        .joint { fill:#4caf50; opacity:0.9; }
        .label { fill:#2e7d32; font-size:14px; text-anchor:middle; font-family:Arial, sans-serif; }
      </style>
    </defs>
  `;
}
function animateExercise(type) {
  exerciseSVG.innerHTML = "";

  const animations = {
    breathing: createBreathingAnimation,
    neck: createNeckAnimation,
    shoulders: createShouldersAnimation,
    spine: createSpineAnimation,
    arms: createArmsAnimation,
    relax: createRelaxAnimation,
    ankles: createAnklesAnimation,
    knees: createKneesAnimation,
    hips: createHipsAnimation,
    walking: createWalkingAnimation,
    stretch: createStretchAnimation,
  };

  if (animations[type]) {
    animations[type]();
  }
}

// Funciones de creación de animaciones SVG mejoradas
function createBreathingAnimation() {
  exerciseSVG.innerHTML = `
    ${svgDefsStickman()}
    <!-- stickman base -->
    <g id="stickman" transform="translate(0,0)">
      <circle class="head" cx="150" cy="55" r="14"/>
      <line class="stick" x1="150" y1="70" x2="150" y2="120"/> <!-- upper torso -->
      <!-- torso/abdomen as ellipse that scales -->
      <ellipse id="torsoEllipse" cx="150" cy="150" rx="26" ry="40" fill="#66bb6a" stroke="#2e7d32" stroke-width="2">
        <animate attributeName="ry" values="40;50;40" dur="12s" repeatCount="5"/>
        <animate attributeName="rx" values="26;30;26" dur="12s" repeatCount="5"/>
      </ellipse>
      <!-- arms (relaxed) -->
      <line class="stick" x1="150" y1="90" x2="120" y2="120"/>
      <line class="stick" x1="150" y1="90" x2="180" y2="120"/>
      <!-- legs -->
      <line class="stick" x1="150" y1="180" x2="130" y2="230"/>
      <line class="stick" x1="150" y1="180" x2="170" y2="230"/>
      <!-- small breathing circles to visualize diaphragm -->
      <circle cx="150" cy="150" r="6" class="joint" opacity="0.9">
        <animate attributeName="r" values="6;10;6" dur="12s" repeatCount="5"/>
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="12s" repeatCount="5"/>
      </circle>
    </g>

    <text x="150" y="280" class="label">Respiración diafragmática </text>
  `;
}

function createNeckAnimation() {
  exerciseSVG.innerHTML = `
    ${svgDefsStickman()}
    <g id="stick" transform="translate(0,0)">
      <g id="headGroup" transform="translate(0,0)">
        <circle class="head" cx="150" cy="55" r="14"/>
        <!-- rotate head around neck pivot (150,70) -->
        <animateTransform xlink:href="#headGroup"
          attributeName="transform" type="rotate"
          values="0 150 70; -25 150 70; 0 150 70; 25 150 70; 0 150 70"
          dur="10s" repeatCount="indefinite"/>
      </g>
      <line class="stick" x1="150" y1="70" x2="150" y2="120"/>
      <line class="stick" x1="150" y1="120" x2="120" y2="160"/>
      <line class="stick" x1="150" y1="120" x2="180" y2="160"/>
    </g>

    <text x="150" y="280" class="label">Inclinación lateral de cuello — ritmo lento</text>
  `;
}

function createShouldersAnimation() {
  exerciseSVG.innerHTML = `
    ${svgDefsStickman()}
    <g id="stick" transform="translate(0,0)">
      <circle class="head" cx="150" cy="50" r="14"/>
      <line class="stick" x1="150" y1="64" x2="150" y2="110"/>
      <!-- left arm: upper then lower as single line pivoting at shoulder (150,80) -->
      <g id="leftArm" transform="translate(0,0)">
        <line class="stick" x1="150" y1="82" x2="110" y2="110"/>
        <animateTransform xlink:href="#leftArm" attributeName="transform" type="rotate"
          values="0 150 82; 30 150 82; 0 150 82; -30 150 82; 0 150 82"
          dur="6s" repeatCount="indefinite"/>
      </g>
      <g id="rightArm" transform="translate(0,0)">
        <line class="stick" x1="150" y1="82" x2="190" y2="110"/>
        <animateTransform xlink:href="#rightArm" attributeName="transform" type="rotate"
          values="0 150 82; -30 150 82; 0 150 82; 30 150 82; 0 150 82"
          dur="6s" repeatCount="indefinite"/>
      </g>

      <line class="stick" x1="150" y1="120" x2="130" y2="180"/>
      <line class="stick" x1="150" y1="120" x2="170" y2="180"/>
    </g>

  `;
}

function createSpineAnimation() {
  exerciseSVG.innerHTML = `
    ${svgDefsStickman()}
    <g id="stick" transform="translate(0,0)">
      <g id="upper" transform="translate(0,0)">
        <circle class="head" cx="150" cy="50" r="14"/>
        <line class="stick" x1="150" y1="64" x2="150" y2="110"/>
      </g>

      <!-- torso pivoting at hip (150,120) to simulate flexion -->
      <g id="torsoGroup" transform="translate(0,0)">
        <line class="stick" x1="150" y1="110" x2="150" y2="160"/>
        <!-- legs attached to hip pivot area -->
        <line class="stick" x1="150" y1="160" x2="125" y2="220"/>
        <line class="stick" x1="150" y1="160" x2="175" y2="220"/>
        <animateTransform xlink:href="#torsoGroup" attributeName="transform" type="rotate"
          values="0 150 110; 20 150 110; 0 150 110" dur="5s" repeatCount="indefinite"/>
      </g>
    </g>

  `;
}

function createArmsAnimation() {
  exerciseSVG.innerHTML = `
    ${svgDefsStickman()}
    <g id="stick">
      <circle class="head" cx="150" cy="50" r="14"/>

      <!-- torso -->
      <line class="stick" x1="150" y1="64" x2="150" y2="120"/>

      <!-- left arm pivots at shoulder (150,80) -->
      <g id="left" transform="translate(0,0)">
        <line class="stick" x1="150" y1="80" x2="120" y2="120"/>
        <animateTransform xlink:href="#left" attributeName="transform" type="rotate"
          values="0 150 80; -70 150 80; 0 150 80" dur="3s" repeatCount="indefinite"/>
      </g>

      <!-- right arm -->
      <g id="right" transform="translate(0,0)">
        <line class="stick" x1="150" y1="80" x2="180" y2="120"/>
        <animateTransform xlink:href="#right" attributeName="transform" type="rotate"
          values="0 150 80; 70 150 80; 0 150 80" dur="3s" repeatCount="indefinite"/>
      </g>

      <!-- legs static -->
      <line class="stick" x1="150" y1="120" x2="130" y2="180"/>
      <line class="stick" x1="150" y1="120" x2="170" y2="180"/>
    </g>

  `;
}

function createRelaxAnimation() {
  exerciseSVG.innerHTML = `
    ${svgDefsStickman()}
    <g id="stick">
      <circle class="head" cx="150" cy="55" r="14"/>
      <line class="stick" x1="150" y1="70" x2="150" y2="140"/>
      <line class="stick" x1="150" y1="100" x2="120" y2="120"/>
      <line class="stick" x1="150" y1="100" x2="180" y2="120"/>
      <line class="stick" x1="150" y1="140" x2="130" y2="200"/>
      <line class="stick" x1="150" y1="140" x2="170" y2="200"/>

      <!-- calm pulse -->
      <circle cx="150" cy="140" r="10" class="joint" opacity="0.6">
        <animate attributeName="r" values="10;14;10" dur="6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="6s" repeatCount="indefinite"/>
      </circle>
    </g>

  `;
}

function createAnklesAnimation() {
  exerciseSVG.innerHTML = `
    ${svgDefsStickman()}
    <g id="stick">
      <circle class="head" cx="150" cy="40" r="12"/>
      <line class="stick" x1="150" y1="52" x2="150" y2="110"/>

      <!-- left leg group (hip->knee->ankle->foot) -->
      <g id="leftLeg" transform="translate(0,0)">
        <line class="stick" x1="150" y1="110" x2="130" y2="160"/> <!-- upper leg -->
        <g id="leftLower" transform="translate(0,0)">
          <line class="stick" x1="130" y1="160" x2="130" y2="210"/> <!-- lower leg -->
          <!-- foot group pivot at ankle (130,210) -->
          <g id="leftFoot" transform="translate(0,0)">
            <line class="stick" x1="130" y1="210" x2="150" y2="210"/> <!-- foot -->
            <animateTransform xlink:href="#leftFoot" attributeName="transform" type="rotate"
              values="0 130 210; 360 130 210" dur="2.2s" repeatCount="10"/>
          </g>
        </g>
      </g>

      <!-- right leg group -->
      <g id="rightLeg" transform="translate(0,0)">
        <line class="stick" x1="150" y1="110" x2="170" y2="160"/>
        <g id="rightLower" transform="translate(0,0)">
          <line class="stick" x1="170" y1="160" x2="170" y2="210"/>
          <g id="rightFoot" transform="translate(0,0)">
            <line class="stick" x1="170" y1="210" x2="190" y2="210"/>
            <animateTransform xlink:href="#rightFoot" attributeName="transform" type="rotate"
              values="0 170 210; -360 170 210" dur="2.2s" begin="0.12s" repeatCount="10"/>
          </g>
        </g>
      </g>
    </g>

  `;
}

function createKneesAnimation() {
  exerciseSVG.innerHTML = `
    ${svgDefsStickman()}
    <g id="stick">
      <circle class="head" cx="150" cy="40" r="12"/>
      <line class="stick" x1="150" y1="52" x2="150" y2="110"/>

      <!-- left knee: lower leg pivots around knee (130,160) -->
      <g id="leftK" transform="translate(0,0)">
        <line class="stick" x1="150" y1="110" x2="130" y2="160"/> <!-- upper -->
        <line class="stick" x1="130" y1="160" x2="130" y2="210"/> <!-- lower -->
        <!-- small circles to show rotation -->
        <circle cx="130" cy="160" r="6" class="joint"/>
        <animateTransform xlink:href="#leftK" attributeName="transform" type="rotate"
          values="0 130 160; 12 130 160; -8 130 160; 0 130 160" dur="2s" repeatCount="indefinite"/>
      </g>

      <!-- right knee -->
      <g id="rightK" transform="translate(0,0)">
        <line class="stick" x1="150" y1="110" x2="170" y2="160"/>
        <line class="stick" x1="170" y1="160" x2="170" y2="210"/>
        <circle cx="170" cy="160" r="6" class="joint"/>
        <animateTransform xlink:href="#rightK" attributeName="transform" type="rotate"
          values="0 170 160; -12 170 160; 8 170 160; 0 170 160" dur="2s" begin="0.25s" repeatCount="indefinite"/>
      </g>
    </g>

  `;
}

function createHipsAnimation() {
  exerciseSVG.innerHTML = `
    ${svgDefsStickman()}
    <g id="stick">
      <circle class="head" cx="150" cy="40" r="12"/>
      <!-- torso -->
      <line class="stick" x1="150" y1="52" x2="150" y2="110"/>

      <!-- pelvis group: rotate around pelvis center (150,120) -->
      <g id="pelvis" transform="translate(0,0)">
        <!-- legs attached to pelvis -->
        <line class="stick" x1="150" y1="120" x2="125" y2="180"/>
        <line class="stick" x1="150" y1="120" x2="175" y2="180"/>
        <animateTransform xlink:href="#pelvis" attributeName="transform" type="rotate"
          values="0 150 120; 25 150 120; -25 150 120; 0 150 120" dur="4.5s" repeatCount="indefinite"/>
      </g>

      <!-- visual guide -->
      <circle cx="150" cy="120" r="6" class="joint"/>
    </g>

  `;
}

function createWalkingAnimation() {
  exerciseSVG.innerHTML = `
    ${svgDefsStickman()}
    <g id="stick">
      <circle class="head" cx="150" cy="40" r="12"/>
      <line class="stick" x1="150" y1="52" x2="150" y2="110"/>

      <!-- left leg: rotate lower at hip (150,110) -->
      <g id="leftWalk" transform="translate(0,0)">
        <line class="stick" x1="150" y1="110" x2="130" y2="180"/>
        <animateTransform xlink:href="#leftWalk" attributeName="transform" type="rotate"
          values="0 150 110; -45 150 110; 0 150 110" dur="0.9s" repeatCount="indefinite"/>
      </g>

      <!-- right leg opposite phase -->
      <g id="rightWalk" transform="translate(0,0)">
        <line class="stick" x1="150" y1="110" x2="170" y2="180"/>
        <animateTransform xlink:href="#rightWalk" attributeName="transform" type="rotate"
          values="0 150 110; 45 150 110; 0 150 110" dur="0.9s" begin="0.45s" repeatCount="indefinite"/>
      </g>

      <!-- arms swing opposite to legs -->
      <g id="leftArmWalk">
        <line class="stick" x1="150" y1="80" x2="120" y2="120"/>
        <animateTransform xlink:href="#leftArmWalk" attributeName="transform" type="rotate"
          values="0 150 80; 30 150 80; 0 150 80" dur="0.9s" begin="0.45s" repeatCount="indefinite"/>
      </g>
      <g id="rightArmWalk">
        <line class="stick" x1="150" y1="80" x2="180" y2="120"/>
        <animateTransform xlink:href="#rightArmWalk" attributeName="transform" type="rotate"
          values="0 150 80; -30 150 80; 0 150 80" dur="0.9s" repeatCount="indefinite"/>
      </g>
    </g>
  `;
}

function createStretchAnimation() {
  exerciseSVG.innerHTML = `
    <!-- Cabeza -->
    <circle cx="150" cy="90" r="22" fill="#81c784"/>
    
    <!-- Torso -->
    <ellipse cx="150" cy="140" rx="30" ry="35" fill="#66bb6a"/>
    
    <!-- Brazos extendidos hacia arriba -->
    <line x1="150" y1="125" x2="120" y2="50" stroke="#81c784" stroke-width="10" stroke-linecap="round">
      <animate attributeName="y2" values="50;35;50" dur="2.5s" repeatCount="indefinite"/>
    </line>
    <line x1="150" y1="125" x2="180" y2="50" stroke="#81c784" stroke-width="10" stroke-linecap="round">
      <animate attributeName="y2" values="50;35;50" dur="2.5s" repeatCount="indefinite"/>
    </line>
    
    <!-- Manos brillantes -->
    <circle cx="120" cy="50" r="8" fill="#4caf50">
      <animate attributeName="cy" values="50;35;50" dur="2.5s" repeatCount="indefinite"/>
      <animate attributeName="r" values="8;10;8" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="180" cy="50" r="8" fill="#4caf50">
      <animate attributeName="cy" values="50;35;50" dur="2.5s" repeatCount="indefinite"/>
      <animate attributeName="r" values="8;10;8" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    
    <!-- Líneas de energía -->
    <line x1="120" y1="40" x2="120" y2="25" stroke="#4caf50" stroke-width="3" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite"/>
    </line>
    <line x1="180" y1="40" x2="180" y2="25" stroke="#4caf50" stroke-width="3" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite"/>
    </line>
    
    <!-- Piernas -->
    <rect x="135" y="175" width="12" height="50" fill="#81c784" rx="4"/>
    <rect x="153" y="175" width="12" height="50" fill="#81c784" rx="4"/>
    
    <!-- Torso expandido -->
    <ellipse cx="150" cy="140" rx="32" ry="37" fill="none" stroke="#4caf50" stroke-width="2" opacity="0.5">
      <animate attributeName="rx" values="32;35;32" dur="2.5s" repeatCount="indefinite"/>
      <animate attributeName="ry" values="37;40;37" dur="2.5s" repeatCount="indefinite"/>
    </ellipse>
    
    <text x="150" y="270" text-anchor="middle" fill="#4caf50" font-size="15" font-weight="bold">
      ↑↑ ESTÍRATE AL MÁXIMO ↑↑
    </text>
  `;
}

// Event Listeners para ejercicio
if (closeExercise) {
  closeExercise.addEventListener("click", closeExerciseModal);
}

if (exerciseOverlay) {
  exerciseOverlay.addEventListener("click", closeExerciseModal);
}

if (pauseExercise) {
  pauseExercise.addEventListener("click", () => {
    if (exerciseIsPlaying) {
      pauseExerciseFunc();
    } else {
      startExercise();
    }
  });
}

if (skipExercise) {
  skipExercise.addEventListener("click", () => {
    clearTimeout(exerciseStepInterval);
    nextExerciseStep();
  });
}

if (restartExercise) {
  restartExercise.addEventListener("click", () => {
    stopExercise();
    closeExerciseModal();
  });
}

// ===============================
// MODAL DE MEDITACIÓN GUIADA
// ===============================

function iniciarMeditacion() {
  const timeInput = document.getElementById("meditation-time");

  if (!timeInput || !timeInput.value) {
    mostrarNotificacion(
      "Hora requerida",
      "Por favor selecciona una hora para tu sesión.",
      "error"
    );
    return;
  }

  document.getElementById("panel-meditacion").style.display = "none";
  openMeditationModal();
}

const meditationOverlay = document.getElementById("meditationOverlay");
const meditationModal = document.getElementById("meditationModal");
const closeMeditation = document.getElementById("closeMeditation");
const selectionScreen = document.getElementById("selectionScreen");
const meditationScreen = document.getElementById("meditationScreen");
const durationBtns = document.querySelectorAll(".duration-btn");

const breathText = document.getElementById("breathText");
const meditationMessage = document.getElementById("meditationMessage");
const timeDisplay = document.getElementById("timeDisplay");
const playPauseBtn = document.getElementById("playPauseBtn");
const resetBtnMed = document.getElementById("resetBtnMed");
const muteBtnMed = document.getElementById("muteBtnMed");
const phaseDots = document.querySelectorAll(".phase-dot");

let duration = 0;
let timeLeft = 0;
let isPlaying = false;
let isMuted = false;
let currentPhase = 0;
let messageInterval = null;
let timerInterval = null;
let breathInterval = null;

const phases = [
  {
    name: "inicio",
    messages: [
      "Bienvenida a tu espacio de calma 🌸",
      "Siéntate con la espalda recta y relajada",
      "Coloca tus manos sobre las rodillas",
      "Hombros hacia atrás, mentón ligeramente hacia dentro",
      "Cierra los ojos suavemente",
      "Este es tu momento de paz",
    ],
  },
  {
    name: "respiracion",
    messages: [
      "Inhala profundamente... 1, 2, 3, 4",
      "Sostén el aire... 2, 3, 4",
      "Exhala lentamente... 1, 2, 3, 4, 5, 6",
      "Mantén la espalda erguida mientras respiras",
      "Siente cómo te relajas con cada respiración",
    ],
  },
  {
    name: "cuerpo",
    messages: [
      "Relaja tus hombros, déjalos caer",
      "Suaviza tu mandíbula y tu rostro",
      "Relaja tus manos sobre las rodillas",
      "Tu columna está alineada y fuerte",
      "Siente tu cuerpo presente y relajado",
    ],
  },
  {
    name: "mente",
    messages: [
      "Los exámenes pasarán, pero tú permaneces",
      "Eres más que tus calificaciones",
      "Tienes el tiempo que necesitas",
      "Confía en tu capacidad de aprender",
      "Este momento de estrés es temporal",
      "Mereces esta pausa de calma",
    ],
  },
  {
    name: "cierre",
    messages: [
      "Agradece este momento de pausa",
      "Reconoce tu esfuerzo y valentía",
      "Mueve suavemente tus dedos y manos",
      "Lentamente, vuelve al presente",
      "Abre los ojos cuando estés lista 💚",
    ],
  },
];

const breathCycle = [
  { text: "Inhala...", duration: 4000 },
  { text: "Sostén...", duration: 4000 },
  { text: "Exhala...", duration: 6000 },
  { text: "Descansa...", duration: 2000 },
];
let breathIndex = 0;

function openMeditationModal() {
  meditationOverlay.classList.add("active");
  meditationModal.classList.add("active");
  showSelectionScreen();
}

function closeMeditationModal() {
  stopMeditation();
  meditationOverlay.classList.remove("active");
  meditationModal.classList.remove("active");
  setTimeout(() => {
    showSelectionScreen();
  }, 300);
}

function showSelectionScreen() {
  selectionScreen.classList.remove("hidden");
  meditationScreen.classList.add("hidden");
}

function startMeditationWithDuration(selectedDuration) {
  duration = selectedDuration * 60;
  timeLeft = duration;
  currentPhase = 0;

  selectionScreen.classList.add("hidden");
  meditationScreen.classList.remove("hidden");

  updateTimeDisplay();
  updatePhaseIndicator();
  startMeditation();
}

function startMeditation() {
  isPlaying = true;

  if (!isMuted) {
    medAudio.play();
  }
  updatePlayPauseButton();

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimeDisplay();
      checkPhaseTransition();
    } else {
      finishMeditation();
    }
  }, 1000);

  startMessageRotation();
  startBreathCycle();
}

function pauseMeditation() {
  isPlaying = false;
  medAudio.pause();
  updatePlayPauseButton();
  clearInterval(timerInterval);
  clearInterval(messageInterval);
  clearInterval(breathInterval);
}

function stopMeditation() {
  isPlaying = false;
  medAudio.currentTime = 0;
  pauseMeditation();
  timeLeft = 0;
  currentPhase = 0;
  breathIndex = 0;
}

function updateTimeDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function checkPhaseTransition() {
  const progress = 1 - timeLeft / duration;
  const newPhase = Math.min(
    Math.floor(progress * phases.length),
    phases.length - 1
  );

  if (newPhase !== currentPhase) {
    currentPhase = newPhase;
    updatePhaseIndicator();
    startMessageRotation();
  }
}

function updatePhaseIndicator() {
  phaseDots.forEach((dot, index) => {
    if (index === currentPhase) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function startMessageRotation() {
  clearInterval(messageInterval);
  let messageIndex = 0;

  const showMessage = () => {
    const messages = phases[currentPhase].messages;
    meditationMessage.textContent = messages[messageIndex];
    messageIndex = (messageIndex + 1) % messages.length;
  };

  showMessage();
  messageInterval = setInterval(showMessage, 8000);
}

function startBreathCycle() {
  clearInterval(breathInterval);
  breathIndex = 0;

  const updateBreath = () => {
    const breath = breathCycle[breathIndex];
    breathText.textContent = breath.text;

    breathIndex = (breathIndex + 1) % breathCycle.length;
    breathInterval = setTimeout(updateBreath, breath.duration);
  };

  updateBreath();
}

function finishMeditation() {
  stopMeditation();
  meditationMessage.textContent = "✨ Sesión completada. ¡Bien hecho! ✨";
  breathText.textContent = "Namaste 🙏";

  mostrarNotificacion(
    "¡Meditación completada!",
    "Has dedicado tiempo valioso para tu bienestar. 💚",
    "success"
  );
}

function updatePlayPauseButton() {
  const playIcon = playPauseBtn.querySelector(".play-icon");
  const pauseIcon = playPauseBtn.querySelector(".pause-icon");

  if (isPlaying) {
    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");
  } else {
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
  }
}

if (closeMeditation) {
  closeMeditation.addEventListener("click", closeMeditationModal);
}

if (meditationOverlay) {
  meditationOverlay.addEventListener("click", closeMeditationModal);
}

if (durationBtns) {
  durationBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedDuration = parseInt(btn.dataset.duration);
      startMeditationWithDuration(selectedDuration);
    });
  });
}

if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    if (isPlaying) {
      pauseMeditation();
    } else {
      startMeditation();
    }
  });
}

if (resetBtnMed) {
  resetBtnMed.addEventListener("click", () => {
    stopMeditation();
    closeMeditationModal();
  });
}

if (muteBtnMed) {
  muteBtnMed.addEventListener("click", () => {
    isMuted = !isMuted;
    muteBtnMed.textContent = isMuted ? "🔇" : "🔊";

    if (isMuted) {
      medAudio.pause();
    } else {
      if (isPlaying) {
        medAudio.play();
      }
    }
  });
}

// ===============================
// TALLER ARTÍSTICO - Validar selección
// ===============================
const panelTaller = document.getElementById("panel-taller");

if (panelTaller) {
  const btnTaller = panelTaller.querySelector("button");
  const selectTaller = panelTaller.querySelector("select");

  if (btnTaller) {
    btnTaller.onclick = function () {
      if (!selectTaller || !selectTaller.value) {
        mostrarNotificacion(
          " Selección requerida",
          "Por favor selecciona el tipo de taller",
          "error"
        );
        if (selectTaller) {
          selectTaller.classList.add("campo-error");
          selectTaller.focus();
        }
        return;
      }

      selectTaller.classList.remove("campo-error");

      const tallerSeleccionado =
        selectTaller.options[selectTaller.selectedIndex].text;

      mostrarNotificacion(
        " ¡Inscripción enviada!",
        `Te has inscrito exitosamente al taller de ${tallerSeleccionado}. Recibirás un correo de confirmación pronto`,
        "success"
      );

      // Resetear selección después de 2 segundos
      setTimeout(() => {
        selectTaller.selectedIndex = 0;
      }, 2000);
    };
  }
}

// ===============================
// ASESORÍA PSICOLÓGICA - Validar fecha y hora
// ===============================
const panelAsesoria = document.getElementById("panel-asesoria");

if (panelAsesoria) {
  const btnAsesoria = panelAsesoria.querySelector("button");
  const inputs = panelAsesoria.querySelectorAll("input");
  const fechaInput = inputs[0]; // primer input (date)
  const horaInput = inputs[1]; // segundo input (time)

  if (btnAsesoria) {
    btnAsesoria.onclick = function () {
      let errores = [];

      // Validar fecha
      if (!fechaInput || !fechaInput.value) {
        errores.push("fecha");
        if (fechaInput) {
          fechaInput.classList.add("campo-error");
        }
      } else {
        // Validar que la fecha no sea en el pasado
        const fechaSeleccionada = new Date(fechaInput.value);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaSeleccionada < hoy) {
          mostrarNotificacion(
            " Fecha inválida",
            "La fecha de la sesión no puede ser en el pasado",
            "error"
          );
          fechaInput.classList.add("campo-error");
          fechaInput.focus();
          return;
        }
        fechaInput.classList.remove("campo-error");
      }

      // Validar hora
      if (!horaInput || !horaInput.value) {
        errores.push("hora");
        if (horaInput) {
          horaInput.classList.add("campo-error");
        }
      } else {
        horaInput.classList.remove("campo-error");
      }

      if (errores.length > 0) {
        mostrarNotificacion(
          " Campos incompletos",
          `Por favor completa: ${errores.join(" y ")}`,
          "error"
        );
        return;
      }

      // Si todo está bien
      const fechaTexto = new Date(fechaInput.value).toLocaleDateString(
        "es-ES",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      mostrarNotificacion(
        " ¡Sesión agendada!",
        `Tu asesoría psicológica está confirmada para el ${fechaTexto} a las ${horaInput.value}`,
        "success"
      );

      // Limpiar campos después de 2 segundos
      setTimeout(() => {
        fechaInput.value = "";
        horaInput.value = "";
      }, 2000);
    };
  }
}
