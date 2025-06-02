import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5177,
    ...(mode === 'development' && {
      proxy: {
        '/api': 'http://localhost:5000',
      },
    }),
  },
 
  resolve: {
   
    caseSensitive: true,
  },
}));
