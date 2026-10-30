import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const apiUrl = env.VITE_API_URL || 'http://localhost:8080';
  const aiUrl = env.VITE_AI_API_URL || 'http://localhost:8000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      proxy: {
        '/api': { target: apiUrl, changeOrigin: true },
        /** 화면 URL /ai(PATHS.AI)는 제외 */
        '^/ai/': { target: aiUrl, changeOrigin: true },
      },
    },
  };
});
