// ===============================
// PANEL DE PERSONALIZACIÓN
// ===============================

// Elementos del DOM
const menuToggle = document.getElementById("menuToggle");
const customPanel = document.createElement("div");
customPanel.id = "customPanel";
customPanel.classList.add("custom-panel"); // clase CSS
customPanel.innerHTML = `
  <h3>Personaliza tu experiencia</h3>
  <label>Color principal:</label>
  <input type="color" id="colorPicker" />
  <button id="resetBtn" class="panel-btn">Restaurar colores</button>
`;
document.body.appendChild(customPanel);

const overlay = document.createElement("div");
overlay.id = "overlay";
overlay.classList.add("overlay");
document.body.appendChild(overlay);

// **Ahora sí seleccionamos los elementos dentro del panel ya insertado**
const colorPicker = customPanel.querySelector("#colorPicker");
const resetBtn = customPanel.querySelector("#resetBtn");

// Elementos a cambiar
const nav = document.querySelector("nav");
const footer = document.querySelector("footer");
const btnBack = document.querySelector(".btn-back");

// Color por defecto
const defaultColor = "#81c784";

// Abrir/Cerrar panel
menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  customPanel.classList.toggle("active");
  overlay.classList.toggle("active");
});

// Cerrar al hacer click en overlay
overlay.addEventListener("click", () => {
  customPanel.classList.remove("active");
  overlay.classList.remove("active");
});

// Aplicar color en tiempo real
colorPicker.addEventListener("input", (e) => {
  aplicarColor(e.target.value);
});

// Restaurar colores
resetBtn.addEventListener("click", () => {
  colorPicker.value = defaultColor;
  aplicarColor(defaultColor);
  localStorage.removeItem("themeColor"); // borrar guardado
  mostrarNotificacion(
    "Colores restaurados",
    "Los colores han vuelto a su estado original.",
    "success"
  );
});

// Función para aplicar color
function aplicarColor(color) {
  if (nav)
    nav.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -20
    )})`;
  if (footer)
    footer.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -20
    )})`;
  if (btnBack)
    btnBack.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -20
    )})`;
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn)
    submitBtn.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(
      color,
      -20
    )})`;

  document.querySelectorAll("h2, h3").forEach((title) => {
    title.style.color = adjustColor(color, -20);
  });
}

// Ajuste de color para degradados
function adjustColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function mostrarNotificacion(titulo, mensaje, tipo = "info") {
  // Crear el contenedor si no existe
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    document.body.appendChild(container);
  }

  // Crear la notificación
  const notification = document.createElement("div");
  notification.className = `notification ${tipo}`;
  notification.innerHTML = `
    <div class="notification-icon">${
      tipo === "success" ? "✓" : tipo === "error" ? "✕" : "ℹ"
    }</div>
    <div class="notification-content">
      <h4>${titulo}</h4>
      <p>${mensaje}</p>
    </div>
    <button class="notification-close">&times;</button>
  `;

  container.appendChild(notification);

  // Función para cerrar con animación
  const cerrarNotificacion = () => {
    notification.style.animation = "slideOutRight 0.4s forwards";
    notification.addEventListener("animationend", () => notification.remove());
  };

  // Cerrar al hacer click en el botón
  notification
    .querySelector(".notification-close")
    .addEventListener("click", cerrarNotificacion);

  // Auto-cierre después de 3 segundos
  setTimeout(cerrarNotificacion, 3000);
}

// Guardar color en localStorage
colorPicker.addEventListener("change", (e) => {
  localStorage.setItem("themeColor", e.target.value);
});

// Cargar color al iniciar
document.addEventListener("DOMContentLoaded", () => {
  const savedColor = localStorage.getItem("themeColor");
  const initialColor = savedColor || defaultColor;
  colorPicker.value = initialColor;
  aplicarColor(initialColor);
});
