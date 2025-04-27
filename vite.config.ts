import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Proxy requests for Deepgram API
      '/api/deepgram': {
        target: 'https://api.deepgram.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deepgram/, ''),
        headers: {
          'Authorization': `Token efbec5a519b2774f6b73e87ffe88cf2ef7610272`
        }
      }
    }
  }
});
