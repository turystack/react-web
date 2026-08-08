import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { esmExternalRequirePlugin } from 'rolldown/plugins'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    cssCodeSplit: false,
    lib: {
      cssFileName: 'index',
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        'hooks/web': path.resolve(__dirname, 'src/hooks/web.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'tailwindcss',
        '@turystack/react-icons',
        '@turystack/react-hooks',
      ],
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  plugins: [
    esmExternalRequirePlugin({
      external: [
        /^react(?:-dom)?(?:\/.*)?$/,
      ],
    }),
    react(),
    tailwindcss(),
    dts({
      exclude: ['**/*.stories.tsx', '**/*.test.tsx'],
      rollupTypes: false,
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
