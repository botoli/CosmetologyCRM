// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Попробуйте вернуться к 3000
    strictPort: false, // Разрешить использовать другой порт если 3000 занят
    host: true,
    open: true,
  },
});
