import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        host: true,
        allowedHosts: [
            'subtribal-nonorthographical-elizabet.ngrok-free.dev',
            '.ngrok-free.dev',
            '.ngrok.io',
        ],
    },
});
