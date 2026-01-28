import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: process.env.VITE_BASE_PATH || "/prompt-engineer-v0/tree/main",
});

// module.exports = {
//   theme: {
//     extend: {
//       fontFamily: {
//         poppins: ["Poppins", "sans-serif"],
//         // berlin: ["Berlin Sans FB Demi", "Arial", "sans-serif"],
//       },
//     },
//   },
// };
