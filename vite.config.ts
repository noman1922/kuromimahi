import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.TMDB_API_KEY || env.VITE_TMDB_API_KEY;
  const accessToken = env.TMDB_ACCESS_TOKEN || env.VITE_TMDB_ACCESS_TOKEN;

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/tmdb': {
          target: 'https://api.themoviedb.org/3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tmdb/, ''),
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          configure: (proxy) => {
            if (apiKey && !accessToken) {
              proxy.on('proxyReq', (proxyReq) => {
                const url = new URL(proxyReq.path, 'https://api.themoviedb.org');
                url.searchParams.set('api_key', apiKey);
                proxyReq.path = url.pathname + url.search;
              });
            }
          },
        },
      },
    },
  };
});
