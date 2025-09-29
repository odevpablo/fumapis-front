import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    define: {
      'import.meta.env.PROD': JSON.stringify(mode === 'production'),
      'import.meta.env.MODE': JSON.stringify(mode)
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://api.fumapis.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    // Configuração para build de produção
    build: {
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      target: 'esnext'
    }
  };
});
