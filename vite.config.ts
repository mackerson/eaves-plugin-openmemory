import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Build plugin UI as a library with external dependencies
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'ui/src/index.tsx'),
      name: 'WebViewPlugin',
      formats: ['es'], // Use ES modules for dynamic import()
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // Externalize dependencies that will be provided by the host app
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
      ],
      output: {
        // Map external imports to virtual module paths served by Vite
        paths: {
          'react': '/node_modules/react',
          'react-dom': '/node_modules/react-dom',
          'react/jsx-runtime': '/node_modules/react/jsx-runtime',
        },
        // Preserve module structure for easier debugging
        preserveModules: false,
      },
    },
    outDir: 'ui/dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src/renderer'),
    },
  },
});
