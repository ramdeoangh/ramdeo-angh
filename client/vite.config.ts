import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    alias: {
      '@types': path.resolve(__dirname, '../packages/types/src'),
      '@ui': path.resolve(__dirname, '../packages/ui/src')
    }
  }
});


