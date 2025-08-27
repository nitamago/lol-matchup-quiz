import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/lol-matchup-quiz/',  // GitHub リポジトリ名
})

