import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: '/lol-matchup-quiz/',  // GitHub リポジトリ名,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ← これで @ を src/ に解決できる
    },
  },
})

