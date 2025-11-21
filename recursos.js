// ===============================
// PANEL DE PERSONALIZACIÓN + NOTIFICACIONES
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Script iniciado");

  const menuToggle = document.getElementById("menuToggle");

  // =======================================
  // 🔔 CONTENEDOR GLOBAL DE NOTIFICACIONES
  // =======================================
  let notifContainer = document.querySelector(".notification-container");
  if (!notifContainer) {
    notifContainer = document.createElement("div");
    notifContainer.className = "notification-container";
    document.body.appendChild(notifContainer);
  }

  // =======================================
  // 🔔 FUNCIÓN DE NOTIFICACIONES BLANCAS
  // =======================================
  function showNotification(titulo, mensaje, tipo = "success") {
    const notif = document.createElement("div");
    notif.className = `notification ${tipo}`;

    notif.innerHTML = `
      <div class="icon-box">
        ${tipo === "success" ? "✔" : tipo === "error" ? "✖" : "ℹ"}
      </div>

      <div class="content">
        <p class="title">${titulo}</p>
        <p class="message">${mensaje}</p>
      </div>

      <div class="close-btn">&times;</div>
    `;

    notifContainer.appendChild(notif);

    // Animación
    setTimeout(() => notif.classList.add("show"), 10);

    // Botón cerrar
    notif.querySelector(".close-btn").addEventListener("click", () => {
      notif.classList.remove("show");
      setTimeout(() => notif.remove(), 300);
    });

    // Auto cerrar
    setTimeout(() => {
      notif.classList.remove("show");
      setTimeout(() => notif.remove(), 300);
    }, 3500);
  }

  // =======================================
  // PANEL DE PERSONALIZACIÓN
  // =======================================

  // Crear panel
  const customPanel = document.createElement("div");
  customPanel.id = "customPanel";
  customPanel.className = "custom-panel";
  customPanel.innerHTML = `
    <h3>Personaliza tu experiencia</h3>
    <label>Color principal:</label>
    <input type="color" id="colorPicker" value="#f178a1" />
    <button class="panel-btn" id="resetBtn">Restaurar colores</button>
  `;
  document.body.appendChild(customPanel);

  // Overlay
  const overlay = document.createElement("div");
  overlay.id = "overlay";
  overlay.className = "overlay";
  document.body.appendChild(overlay);

  const colorPicker = document.getElementById("colorPicker");
  const resetBtn = document.getElementById("resetBtn");

  const defaultColor = "#f178a1";

  // =======================================
  // FUNCIÓN PARA APLICAR COLORES
  // =======================================
  function aplicarColor(color) {
    console.log("Aplicando color:", color);

    // 0. Background body
    const body = document.querySelector("body");
    if (body) {
      const lightColor = color + "33";
      body.style.setProperty(
        "background",
        `linear-gradient(to bottom, ${lightColor} 0%, #fdfdf6 100%)`,
        "important"
      );
    }

    // 1. Nav
    const nav = document.querySelector("nav");
    if (nav) {
      nav.style.setProperty("background-image", "none", "important");
      nav.style.setProperty("background-color", color, "important");
    }

    // 2. Botón volver
    const btnBack = document.querySelector(".btn-back");
    if (btnBack) {
      btnBack.style.setProperty("background-color", color, "important");
    }

    // 3. Títulos
    const titulos = document.querySelectorAll("h2, h3");
    titulos.forEach((title) => {
      title.style.setProperty("color", color, "important");
    });

    // 4. Footer
    const footer = document.querySelector("footer");
    if (footer) {
      footer.style.setProperty("background-image", "none", "important");
      footer.style.setProperty("background-color", color, "important");
    }

    // 5. Botones carrusel
    const carouselBtns = document.querySelectorAll(".carousel-btn");
    carouselBtns.forEach((btn) => {
      btn.style.setProperty("background-color", color, "important");
    });

    // 6. Indicador activo
    const indicatorActive = document.querySelector(".indicator.active");
    if (indicatorActive) {
      indicatorActive.style.setProperty("background-color", color, "important");
    }

    // 7. Header de sección
    const sectionHeader = document.querySelector(".section-header");
    if (sectionHeader) {
      sectionHeader.style.backgroundColor = color;
    }

    // 8. Preview juego
    const juegoPreview = document.querySelector(".juego-preview");
    if (juegoPreview) {
      juegoPreview.style.backgroundColor = color;
    }

    // 9. Botón jugar ahora
    const playBtn = document.querySelector("section a");
    if (playBtn) {
      playBtn.style.backgroundColor = color;
    }

    // 10. Bordes secciones
    const sections = document.querySelectorAll("section");
    sections.forEach((section) => {
      section.style.setProperty(
        "border-top",
        `6px solid ${color}`,
        "important"
      );
    });

    // 11. Todos los indicadores
    const indicators = document.querySelectorAll(".indicator");
    indicators.forEach((ind) => {
      if (ind.classList.contains("active")) {
        ind.style.setProperty("background-color", color, "important");
      }
    });

    localStorage.setItem("recursosColor", color);
  }

  // Cargar color guardado
  const savedColor = localStorage.getItem("recursosColor") || defaultColor;
  colorPicker.value = savedColor;
  aplicarColor(savedColor);

  // Abrir / cerrar panel
  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      customPanel.classList.toggle("active");
      overlay.classList.toggle("active");
    });
  }

  customPanel.addEventListener("click", (e) => e.stopPropagation());
  overlay.addEventListener("click", () => {
    customPanel.classList.remove("active");
    overlay.classList.remove("active");
  });

  // Cambio de color en tiempo real
  if (colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      aplicarColor(e.target.value);
    });
  }

  // Restaurar colores
  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      colorPicker.value = defaultColor;
      aplicarColor(defaultColor);

      // 🔔 Notificación blanca elegante
      showNotification(
        "Colores restaurados",
        "Los colores se han regresado a su estado original.",
        "success"
      );
    });
  }

  // Indicadores del carrusel
  const indicators = document.querySelectorAll(".indicator");
  indicators.forEach((indicator) => {
    indicator.addEventListener("click", () => {
      indicators.forEach((ind) => ind.classList.remove("active"));
      indicator.classList.add("active");

      const currentColor =
        localStorage.getItem("recursosColor") || defaultColor;
      aplicarColor(currentColor);
    });
  });
});
// ===============================
// CARRUSEL DE VIDEOS + INDICADORES
// ===============================

const carousel = document.querySelector(".carousel");
const items = document.querySelectorAll(".carousel-item");
const indicatorsDots = document.querySelectorAll(".indicator");

let currentIndex = 0;

// Ancho dinámico por si cambia con CSS
function getItemWidth() {
  return items[0].offsetWidth + 20; // 20 = gap
}

// -------- Actualiza bolitas --------
function updateIndicators() {
  indicatorsDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}

// -------- Ir a un video específico --------
function goToSlide(i) {
  const width = getItemWidth();
  carousel.scrollTo({
    left: width * i,
    behavior: "smooth",
  });

  currentIndex = i;
  updateIndicators();
}

function goToStart() {
  const container = document.querySelector(".carousel");
  if (container) container.scrollTo({ left: 0, behavior: "smooth" });
}

function goToEnd() {
  const container = document.querySelector(".carousel");
  if (container)
    container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
}

// -------- Botones de flecha --------
function scrollCarousel(direction) {
  const maxIndex = items.length - 1;

  currentIndex += direction;

  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex > maxIndex) currentIndex = maxIndex;

  goToSlide(currentIndex);
}

// -------- Click en las bolitas --------
indicatorsDots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    goToSlide(i);
  });
});

// -------- Cambio automático al hacer scroll manual --------
carousel.addEventListener("scroll", () => {
  const width = getItemWidth();
  const index = Math.round(carousel.scrollLeft / width);

  if (index !== currentIndex) {
    currentIndex = index;
    updateIndicators();
  }
});
