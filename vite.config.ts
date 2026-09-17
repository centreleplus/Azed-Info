import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true as const, // Allow all hosts (e.g. 'a-zedinfo.tn', 'www.a-zedinfo.tn', '.a-zedinfo.tn', 'localhost')
      hmr: false, // Désactive le serveur HMR WebSocket pour éviter l'erreur dans l'environnement Sandbox/Preview
      host: '0.0.0.0',
      port: 3000,
      watch: null,
    },
  };
});
