import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177, // 포트번호
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
