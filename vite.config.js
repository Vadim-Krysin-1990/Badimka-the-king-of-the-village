import { defineConfig } from 'vite';

export default defineConfig({
  base: './',  // относительные пути — работает при открытии index.html двойным кликом из dist/
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // всё в один JS-файл и один CSS-файл — проще раздавать
        manualChunks: undefined,
        entryFileNames: 'assets/badimka.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
