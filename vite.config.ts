import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';

const repoName = 'forensics-in-tab';

export default defineConfig(({ command }): UserConfig => ({
  base: command === 'serve' ? '/' : `/${repoName}/`,
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks(id) {
          if (id.includes('capstone-wasm')) {
            return 'capstone';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return undefined;
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
}));
