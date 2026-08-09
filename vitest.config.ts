import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // `@turystack/react-hooks` is linked from the monorepo and brings its own
    // React, so a hook imported from it ran against a second copy and every
    // `useRef` came back null. A consumer installing from npm gets one copy
    // via peers; only the linked layout needs this said out loud.
    dedupe: [
      'react',
      'react-dom',
    ],
  },
  test: {
    environment: 'jsdom',
  },
})
