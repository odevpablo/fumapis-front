import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
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
        secure: false,  // Permite conexões HTTP
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
    cors: true,  // Habilita CORS para o servidor de desenvolvimento
    host: true,  // Permite acesso de outros dispositivos na rede
    port: 3000   // Porta fixa para evitar conflitos
  },
  build: {
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  preview: {
    port: 3000,
    strictPort: true
  }
}));
