// Datos globales
let tasks = { alta: [], media: [], baja: [] };
let schedule = {};
let currentWeekStart = new Date();
let currentMonth = new Date();
let currentView = "week";
let selectedMood = null;
let completedTasks = [];

// Inicializar fechas
currentWeekStart.setDate(
  currentWeekStart.getDate() - currentWeekStart.getDay() + 1
);
currentMonth.setDate(1);

// Inicializar horario para cada día
const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
daysOfWeek.forEach((day) => {
  schedule[day] = [];
});

// ===== NAVEGACIÓN =====
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll("section")
      .forEach((s) => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.section).classList.add("active");

    if (btn.dataset.section === "horario") {
      renderCalendar();
    } else if (btn.dataset.section === "emocional") {
      updateStressLevel();
      updatePeakTime();
    }
  });
});

// ===== MODALES =====
function openTaskModal() {
  document.getElementById("taskOverlay").classList.add("active");
  document.getElementById("taskModal").classList.add("active");
}

function closeTaskModal() {
  document.getElementById("taskOverlay").classList.remove("active");
  document.getElementById("taskModal").classList.remove("active");
  document.getElementById("taskForm").reset();
}

function openScheduleModal(day) {
  document.getElementById("scheduleDay").value = day;
  document.getElementById("scheduleOverlay").classList.add("active");
  document.getElementById("scheduleModal").classList.add("active");
}

function closeScheduleModal() {
  document.getElementById("scheduleOverlay").classList.remove("active");
  document.getElementById("scheduleModal").classList.remove("active");
  document.getElementById("scheduleForm").reset();
}

// ===== GESTIÓN DE ACTIVIDADES =====
function addTask(e) {
  e.preventDefault();
  const form = e.target;
  const task = {
    id: Date.now(),
    title: form.title.value,
    subject: form.subject.value,
    priority: form.priority.value,
    date: form.date.value,
    description: form.description.value,
    completed: false,
  };

  tasks[task.priority].push(task);
  renderTasks();
  closeTaskModal();
  updateStressLevel();
}

function deleteTask(priority, id) {
  tasks[priority] = tasks[priority].filter((t) => t.id !== id);
  renderTasks();
  updateStressLevel();
  renderCalendar();
}

function completeTask(priority, id) {
  const task = tasks[priority].find((t) => t.id === id);
  if (task) {
    completedTasks.push({
      ...task,
      completedAt: new Date(),
    });
  }
  deleteTask(priority, id);
  updatePeakTime();
}

function renderTasks() {
  ["alta", "media", "baja"].forEach((priority) => {
    const container = document.getElementById(`tasks-${priority}`);
    const count = document.getElementById(`count-${priority}`);

    count.textContent = tasks[priority].length;

    if (tasks[priority].length === 0) {
      container.innerHTML = '<div class="empty-state">No hay actividades</div>';
      return;
    }

    container.innerHTML = tasks[priority]
      .map(
        (task) => `
      <div class="task-card">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span class="task-subject">${task.subject}</span>
          <span>📅 ${formatDate(task.date)}</span>
        </div>
        ${
          task.description
            ? `<div class="task-description">${task.description}</div>`
            : ""
        }
        <div class="task-actions">
          <button onclick="completeTask('${priority}', ${
          task.id
        })">✓ Completar</button>
          <button onclick="deleteTask('${priority}', ${
          task.id
        })">🗑 Eliminar</button>
        </div>
      </div>
    `
      )
      .join("");
  });
}
// ===============================
// PANEL DE PERSONALIZACIÓN
// ===============================

// Elementos del DOM
const menuToggle = document.getElementById("menuToggle");
const customPanel = document.getElementById("customPanel");
const overlay = document.getElementById("overlay");
const colorPicker = document.getElementById("colorPicker");
const resetBtn = document.getElementById("resetBtn");

// Color por defecto
const defaultColor = "#81c784";

// Abrir/Cerrar panel
if (menuToggle) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    customPanel.classList.toggle("active");
    overlay.classList.toggle("active");
  });
}

// Cerrar al hacer click en overlay
if (overlay) {
  overlay.addEventListener("click", () => {
    customPanel.classList.remove("active");
    overlay.classList.remove("active");
  });
}

// Cambiar colores en tiempo real
if (colorPicker) {
  colorPicker.addEventListener("input", (e) => {
    const newColor = e.target.value;
    aplicarColor(newColor);
  });
}

// Botón restaurar colores
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    aplicarColor(defaultColor);
    colorPicker.value = defaultColor;

    // Mostrar notificación de éxito
    mostrarNotificacion(
      "Colores restaurados",
      "Los colores han vuelto a su estado original.",
      "success"
    );
  });
}

// Función para aplicar colores a los elementos
function aplicarColor(color) {
  // Header (nav)
  const header = document.querySelector("header");
  if (header) {
    header.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -20
    )})`;
  }

  // Footer
  const footer = document.querySelector(".footer");
  if (footer) {
    footer.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -20
    )})`;
  }

  // Botones primarios
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -20
    )})`;
  });

  // Títulos de sección
  document.querySelectorAll(".section-header h2").forEach((title) => {
    title.style.color = adjustColor(color, -30);
  });

  // Headers de columnas de prioridad
  document.querySelectorAll(".column-header").forEach((header) => {
    const parent = header.parentElement;
    header.style.background = `linear-gradient(135deg, ${lightenColor(
      color,
      40
    )}, ${lightenColor(color, 20)})`;
  });

  // Botones de navegación del calendario
  document.querySelectorAll(".calendar-nav-btn").forEach((btn) => {
    btn.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -20
    )})`;
  });

  // Botones toggle activos
  document.querySelectorAll(".toggle-btn.active").forEach((btn) => {
    btn.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -20
    )})`;
  });

  // Headers de días en calendario semanal
  document.querySelectorAll(".day-column-header.today").forEach((header) => {
    header.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -20
    )})`;
  });

  // Bloques de clase
  document.querySelectorAll(".class-block").forEach((block) => {
    block.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -15
    )})`;
  });

  // Cards de bienestar
  document.querySelectorAll(".wellness-card h3").forEach((title) => {
    title.style.color = adjustColor(color, -30);
  });

  // Opciones de estado de ánimo seleccionadas
  document.querySelectorAll(".mood-option.selected").forEach((mood) => {
    mood.style.background = `linear-gradient(135deg, ${lightenColor(
      color,
      50
    )}, ${lightenColor(color, 30)})`;
    mood.style.borderColor = adjustColor(color, -30);
  });
// Botón de volver al inicio
document.querySelectorAll(".back-button").forEach((btn) => {
  btn.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})`;
  btn.style.color = "#fff"; // Mantener el texto visible
});


}

// Función para ajustar brillo del color
function adjustColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

// Función para aclarar color
function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
// ===============================
// SISTEMA DE NOTIFICACIONES
// ===============================
function mostrarNotificacion(titulo, mensaje, tipo = "info") {
  // Crear contenedor si no existe
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    document.body.appendChild(container);
  }

  // Crear notificación
  const notification = document.createElement("div");
  notification.className = `notification ${tipo}`;
  notification.style.minWidth = "250px";
  notification.style.padding = "12px 16px";
  notification.style.borderRadius = "8px";
  notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  notification.style.display = "flex";
  notification.style.alignItems = "center";
  notification.style.justifyContent = "space-between";
  notification.style.background = tipo === "success" ? "#4caf50" : tipo === "error" ? "#f44336" : "#2196f3";
  notification.style.color = "#fff";
  notification.style.fontFamily = "Poppins, sans-serif";
  notification.style.animation = "slideInRight 0.4s forwards";

  notification.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px;">
      <div class="notification-icon">${
        tipo === "success" ? "✓" : tipo === "error" ? "✕" : "ℹ"
      }</div>
      <div class="notification-content">
        <h4 style="margin:0; font-size:14px;">${titulo}</h4>
        <p style="margin:0; font-size:12px;">${mensaje}</p>
      </div>
    </div>
    <button class="notification-close" style="background:none;border:none;color:#fff;font-size:16px;cursor:pointer;">&times;</button>
  `;

  container.appendChild(notification);

  // Función para cerrar con animación
  const cerrarNotificacion = () => {
    notification.style.animation = "slideOutRight 0.4s forwards";
    notification.addEventListener("animationend", () => notification.remove());
  };

  // Cerrar al hacer click en el botón
  notification.querySelector(".notification-close").addEventListener("click", cerrarNotificacion);

  // Auto-cierre después de 3 segundos
  setTimeout(cerrarNotificacion, 3000);
}
// ===== HORARIO ACADÉMICO =====
function addScheduleSlot(e) {
  e.preventDefault();
  const form = e.target;
  const day = form.day.value;
  const slot = {
    id: Date.now(),
    subject: form.subject.value,
    startTime: form.startTime.value,
    endTime: form.endTime.value,
  };

  schedule[day].push(slot);
  schedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  renderCalendar();
  closeScheduleModal();
  updateStressLevel();
  updatePeakTime();
}

function deleteSlot(day, id) {
  schedule[day] = schedule[day].filter((s) => s.id !== id);
  renderCalendar();
  updateStressLevel();
  updatePeakTime();
}

function changeView(view) {
  currentView = view;
  document
    .querySelectorAll(".toggle-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  if (view === "week") {
    document.getElementById("weekView").classList.remove("hidden");
    document.getElementById("monthView").classList.add("hidden");
  } else {
    document.getElementById("weekView").classList.add("hidden");
    document.getElementById("monthView").classList.remove("hidden");
  }

  renderCalendar();
}

function changeWeek(direction) {
  currentWeekStart.setDate(currentWeekStart.getDate() + direction * 7);
  renderCalendar();
}

function changeMonth(direction) {
  currentMonth.setMonth(currentMonth.getMonth() + direction);
  renderCalendar();
}

function renderCalendar() {
  if (currentView === "week") {
    renderWeekView();
  } else {
    renderMonthView();
  }
}

function renderWeekView() {
  const weekTitle = document.getElementById("weekTitle");
  const daysGrid = document.getElementById("daysGrid");

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  weekTitle.textContent = `${formatDate(currentWeekStart)} - ${formatDate(
    weekEnd
  )}`;

  daysGrid.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(currentWeekStart);
    currentDay.setDate(currentWeekStart.getDate() + i);
    const dayName = daysOfWeek[i];
    const isToday = isDateToday(currentDay);

    const dayColumn = document.createElement("div");
    dayColumn.className = "day-column";

    const header = document.createElement("div");
    header.className = `day-column-header ${isToday ? "today" : ""}`;
    header.onclick = () => openScheduleModal(dayName);
    header.innerHTML = `
      <div class="day-name">${dayName.substring(0, 3)}</div>
      <div class="day-date">${currentDay.getDate()}</div>
    `;

    const slotsContainer = document.createElement("div");
    slotsContainer.className = "day-slots";

    // Renderizar clases del día
    if (schedule[dayName]) {
      schedule[dayName].forEach((slot) => {
        const classBlock = document.createElement("div");
        classBlock.className = "class-block";

        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);
        const startOffset = ((startMinutes - 420) / 60) * 60; // 420 = 7:00 AM
        const duration = ((endMinutes - startMinutes) / 60) * 60;

        classBlock.style.top = `${startOffset}px`;
        classBlock.style.height = `${duration}px`;

        classBlock.innerHTML = `
          <div class="class-subject">${slot.subject}</div>
          <div class="class-time">${slot.startTime} - ${slot.endTime}</div>
        `;

        classBlock.onclick = (e) => {
          e.stopPropagation();
          if (confirm(`¿Eliminar clase de ${slot.subject}?`)) {
            deleteSlot(dayName, slot.id);
          }
        };

        slotsContainer.appendChild(classBlock);
      });
    }

    dayColumn.appendChild(header);
    dayColumn.appendChild(slotsContainer);
    daysGrid.appendChild(dayColumn);
  }
}

function renderMonthView() {
  const monthTitle = document.getElementById("monthTitle");
  const monthGrid = document.getElementById("monthGrid");

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  monthTitle.textContent = `${
    months[currentMonth.getMonth()]
  } ${currentMonth.getFullYear()}`;

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  monthGrid.innerHTML = "";

  // Días del mes anterior
  const prevMonthLastDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    0
  ).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    monthGrid.appendChild(createDayCell(day, true, false));
  }

  // Días del mes actual
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const isToday = isDateToday(date);
    monthGrid.appendChild(createDayCell(day, false, isToday, date));
  }

  // Días del siguiente mes
  const remainingCells = 42 - (startDay + lastDay.getDate());
  for (let day = 1; day <= remainingCells; day++) {
    monthGrid.appendChild(createDayCell(day, true, false));
  }
}

// Create DayCell

function createDayCell(day, otherMonth, isToday, date = null) {
  const cell = document.createElement("div");
  cell.className = `calendar-day ${otherMonth ? "other-month" : ""} ${
    isToday ? "today" : ""
  }`;

  const dayNumber = document.createElement("div");
  dayNumber.className = "day-number";
  dayNumber.textContent = day;
  cell.appendChild(dayNumber);

  if (date && !otherMonth) {
    const eventsContainer = document.createElement("div");
    eventsContainer.className = "day-events";

    // Agregar clases del día
    const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
    if (schedule[dayName] && schedule[dayName].length > 0) {
      const classCount = schedule[dayName].length;
      const eventDiv = document.createElement("div");
      eventDiv.className = "day-event";
      eventDiv.textContent = `📚 ${classCount} clase${classCount > 1 ? "s" : ""}`;
      eventDiv.style.backgroundColor = "#4caf50";
      eventDiv.style.color = "#fff";
      eventDiv.style.fontSize = "11px";
      eventDiv.style.padding = "2px 6px";
      eventDiv.style.borderRadius = "4px";
      eventDiv.style.marginBottom = "2px";
      eventsContainer.appendChild(eventDiv);
    }

    // Agregar tareas del día (CORREGIDO)
    const dateStr = formatDateISO(date);
    const dayTasks = getAllTasks().filter((t) => t.date === dateStr);
    
    if (dayTasks.length > 0) {
      dayTasks.forEach((task) => {
        const eventDiv = document.createElement("div");
        eventDiv.className = "day-event task";
        
        // Asignar color según prioridad
        let bgColor = "#2196f3"; // azul por defecto
        if (task.priority === "alta") {
          bgColor = "#f44336"; // rojo
        } else if (task.priority === "media") {
          bgColor = "#ff9800"; // naranja
        } else if (task.priority === "baja") {
          bgColor = "#4caf50"; // verde
        }
        
        eventDiv.style.backgroundColor = bgColor;
        eventDiv.style.color = "#fff";
        eventDiv.style.fontSize = "11px";
        eventDiv.style.padding = "2px 6px";
        eventDiv.style.borderRadius = "4px";
        eventDiv.style.marginBottom = "2px";
        eventDiv.style.overflow = "hidden";
        eventDiv.style.textOverflow = "ellipsis";
        eventDiv.style.whiteSpace = "nowrap";
        
        // Icono según prioridad
        const icon = task.priority === "alta" ? "🔴" : 
                     task.priority === "media" ? "🟡" : "🟢";
        
        eventDiv.textContent = `${icon} ${task.title}`;
        eventDiv.title = task.title; // Tooltip con el título completo
        eventsContainer.appendChild(eventDiv);
      });
    }

    cell.appendChild(eventsContainer);
  }

  return cell;
}

// ===== BIENESTAR Y RECOMENDACIONES =====
function selectMood(mood) {
  selectedMood = mood;
  document
    .querySelectorAll(".mood-option")
    .forEach((opt) => opt.classList.remove("selected"));
  document.querySelector(`[data-mood="${mood}"]`).classList.add("selected");
  generateRecommendations();
}

function updateStressLevel() {
  const totalTasks = getAllTasks().length;
  const highPriorityTasks = tasks.alta.length;
  const totalClasses = Object.values(schedule).reduce(
    (acc, day) => acc + day.length,
    0
  );

  // Calcular nivel de estrés (0-100)
  let stressLevel = 0;
  stressLevel += highPriorityTasks * 15;
  stressLevel += tasks.media.length * 8;
  stressLevel += tasks.baja.length * 3;
  stressLevel += totalClasses * 2;

  stressLevel = Math.min(100, stressLevel);

  const stressBar = document.getElementById("stressBar");
  const stressLabel = document.getElementById("stressLabel");

  stressBar.style.width = `${stressLevel}%`;

  if (stressLevel < 30) {
    stressLabel.textContent = "Bajo";
  } else if (stressLevel < 60) {
    stressLabel.textContent = "Moderado";
  } else if (stressLevel < 80) {
    stressLabel.textContent = "Alto";
  } else {
    stressLabel.textContent = "Muy Alto";
  }
}

function updatePeakTime() {
  const peakTimeContainer = document.getElementById("peakTime");

  // Analizar horario para encontrar el momento más activo
  const hourCounts = {};

  Object.values(schedule).forEach((daySchedule) => {
    daySchedule.forEach((slot) => {
      const startHour = parseInt(slot.startTime.split(":")[0]);
      hourCounts[startHour] = (hourCounts[startHour] || 0) + 1;
    });
  });

  // Analizar tareas completadas
  completedTasks.forEach((task) => {
    const hour = new Date(task.completedAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 2;
  });

  if (Object.keys(hourCounts).length === 0) {
    peakTimeContainer.innerHTML = `
      <span class="peak-icon">⏰</span>
      <span class="peak-label">Agrega actividades para analizar</span>
    `;
    return;
  }

  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0];

  const timeRanges = {
    "6-11": "Mañana (6:00 - 11:00)",
    "12-17": "Tarde (12:00 - 17:00)",
    "18-23": "Noche (18:00 - 23:00)",
  };

  let timeRange = "Mañana (6:00 - 11:00)";
  if (peakHour >= 12 && peakHour < 18) {
    timeRange = "Tarde (12:00 - 17:00)";
  } else if (peakHour >= 18) {
    timeRange = "Noche (18:00 - 23:00)";
  }

  peakTimeContainer.innerHTML = `
    <span class="peak-icon">⏰</span>
    <span class="peak-label">${timeRange}</span>
  `;
}

function generateRecommendations() {
  const recommendations = document.getElementById("recommendations");
  const totalTasks = getAllTasks().length;
  const stressLevel = calculateStressPercentage();

  let recs = [];

  // Recomendaciones según estado de ánimo
  if (selectedMood === "estresado") {
    recs.push({
      icon: "🧘",
      title: "Pausa para respirar",
      text: "Toma 5 minutos para hacer respiraciones profundas. Inhala por 4 segundos, sostén 4, exhala 4.",
    });
    recs.push({
      icon: "⏱️",
      title: "Técnica Pomodoro",
      text: "Divide tus tareas en bloques de 25 minutos con descansos de 5 minutos. Esto ayuda a mantener el enfoque.",
    });
    recs.push({
      icon: "📝",
      title: "Prioriza",
      text: "Enfócate solo en las 3 tareas más importantes del día. El resto puede esperar.",
    });
  } else if (selectedMood === "ansioso") {
    recs.push({
      icon: "🚶",
      title: "Pausa activa",
      text: "Sal a caminar 10-15 minutos. El movimiento ayuda a liberar la tensión.",
    });
    recs.push({
      icon: "📱",
      title: "Desconexión digital",
      text: "Apaga las notificaciones por 1 hora y enfócate en una sola actividad.",
    });
    recs.push({
      icon: "💬",
      title: "Habla con alguien",
      text: "Comparte cómo te sientes con un amigo o familiar. Expresar ayuda a procesar emociones.",
    });
  } else if (selectedMood === "regular") {
    recs.push({
      icon: "🎵",
      title: "Música para estudiar",
      text: "Escucha música instrumental o ambiental para mejorar tu concentración.",
    });
    recs.push({
      icon: "☕",
      title: "Hidratación",
      text: "Mantente hidratado. La deshidratación afecta el rendimiento cognitivo.",
    });
  } else if (selectedMood === "bien" || selectedMood === "excelente") {
    recs.push({
      icon: "🎯",
      title: "¡Aprovecha tu energía!",
      text: "Este es el momento perfecto para abordar las tareas más complejas.",
    });
    recs.push({
      icon: "📚",
      title: "Revisa pendientes",
      text: "Anticipa las tareas de los próximos días para estar más preparado.",
    });
  }

  // Recomendaciones según nivel de estrés
  if (stressLevel > 70) {
    recs.push({
      icon: "⚠️",
      title: "Nivel de estrés alto",
      text: "Considera reprogramar actividades no urgentes. Tu salud es prioridad.",
    });
  }

  // Recomendaciones según horario
  const currentHour = new Date().getHours();
  if (currentHour >= 22 || currentHour < 6) {
    recs.push({
      icon: "😴",
      title: "Hora de descansar",
      text: "El sueño es fundamental para el aprendizaje. Intenta dormir 7-8 horas.",
    });
  }

  recommendations.innerHTML = recs
    .map(
      (rec) => `
    <div class="recommendation-item">
      <span class="rec-icon">${rec.icon}</span>
      <div class="rec-content">
        <strong>${rec.title}</strong>
        <p>${rec.text}</p>
      </div>
    </div>
  `
    )
    .join("");
}

// ===== FUNCIONES AUXILIARES =====
function formatDate(dateStr) {
  const date = new Date(dateStr);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  const options = { day: "numeric", month: "short", year: "numeric" };
  return date.toLocaleDateString("es-ES", options);
}

function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDateToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getAllTasks() {
  return [...tasks.alta, ...tasks.media, ...tasks.baja];
}

function calculateStressPercentage() {
  const totalTasks = getAllTasks().length;
  const highPriorityTasks = tasks.alta.length;
  const totalClasses = Object.values(schedule).reduce(
    (acc, day) => acc + day.length,
    0
  );

  let stressLevel = 0;
  stressLevel += highPriorityTasks * 15;
  stressLevel += tasks.media.length * 8;
  stressLevel += tasks.baja.length * 3;
  stressLevel += totalClasses * 2;

  return Math.min(100, stressLevel);
}

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  renderCalendar();
  updateStressLevel();
  updatePeakTime();
});
