import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages отдаёт сайт из подпапки /sign-trainer/; dev-сервер остаётся в корне
  base: command === 'build' ? '/sign-trainer/' : '/',
}))
