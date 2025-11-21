document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  const menuToggle = document.getElementById("menuToggle");
  const customPanel = document.getElementById("customPanel");
  const overlay = document.getElementById("overlay");
  const colorPicker = document.getElementById("colorPicker");
  const resetBtn = document.getElementById("resetBtn");
  const ingresarBtn = document.getElementById("ingresarBtn");

  // 📸 Foto de perfil
  if (fileInput && preview) {
    preview.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e => (preview.src = e.target.result);
        reader.readAsDataURL(file);
      }
    });
  }

  // 📂 Abrir/cerrar panel
  menuToggle.addEventListener("click", () => {
    customPanel.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  // ❌ Cerrar panel al hacer clic en overlay
  overlay.addEventListener("click", () => {
    customPanel.classList.remove("active");
    overlay.classList.remove("active");
  });

  // 🎨 Cambiar color dinámicamente
  colorPicker.addEventListener("input", (e) => {
    const newColor = e.target.value;

    // Fondo derecho
    document.querySelector(".cover-right").style.background = newColor;

    // Botones principales
    document.querySelectorAll(".btn").forEach(btn => {
      btn.style.background = `linear-gradient(135deg, ${newColor}, #4bc0c0)`;
    });

    // Borde de la foto
    preview.style.borderColor = newColor;
  });

  // 🔄 Restaurar colores originales
  resetBtn.addEventListener("click", () => {
    const defaultColor = "#81c784";

    document.querySelector(".cover-right").style.background = "#e8f5e9";

    document.querySelectorAll(".btn").forEach(btn => {
      btn.style.background = `linear-gradient(135deg, ${defaultColor}, #4bc0c0)`;
    });

    preview.style.borderColor = defaultColor;
    colorPicker.value = defaultColor;
  });

  // 🚀 Botón ingresar -> redirigir
  ingresarBtn.addEventListener("click", () => {
    window.location.href = "paginaPrincipal.html"; // Cambia por la ruta real
  });
});
