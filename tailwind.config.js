/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        app: {
          bg: "#D9D9D9",       // fondo general claro
          header: "#2E3A4D",   // barra superior oscura
          topbar: "#1F4E79",   // barra de navegación azul
          sidebar: "#1F4E79",  // columna izquierda azul
          surface: "#F1F5F9",  // tarjetas blancas
          card: "#f7f8fa",     // fondo suave de tarjetas
          border: "#ABB2BF",   // bordes grises
          text: "#000000",     // texto principal
          muted: "#6b7280",    // texto secundario
        },
      },
    },
  },
  plugins: [],
}