
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Força rebuild completo removendo cache
    rollupOptions: {
      output: {
        // Gera novos nomes de chunk para forçar cache bust
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      external: [
        // Força exclusão de dependências problemáticas
        /firebase/,
        /firestore/,
      ]
    },
    target: 'esnext',
    minify: 'esbuild', // Changed from 'terser' to 'esbuild'
    // Removed terserOptions since we're using esbuild now
  },
  // Limpa cache do Vite
  cacheDir: '.vite-clean',
  define: {
    // Remove referências globais desnecessárias
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  optimizeDeps: {
    exclude: [
      // Exclui dependências Firebase se existirem
      'firebase',
      '@firebase/app',
      '@firebase/firestore',
    ]
  }
}));
