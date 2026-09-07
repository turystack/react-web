import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            /**
             * One `usehooks-ts`, and it is this package's.
             *
             * `@turystack/react-hooks` is linked from the monorepo and depends on
             * `usehooks-ts` too, so the copy under *its* node_modules was being
             * loaded — and the nearest `react` to that copy is the dev one it
             * installs for its own tests. Two Reacts, and every `useRef` inside a
             * hook backed by it came back null. Naming the path collapses both
             * copies onto the one this package already depends on directly.
             *
             * Nothing here is about server rendering: it is module resolution, and
             * this product renders in a browser only.
             */
            'usehooks-ts': path.resolve(__dirname, './node_modules/usehooks-ts'),
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
        coverage: {
            exclude: [
                '**/*.types.ts',
                '**/index.ts',
                'src/index.css',
            ],
            include: [
                'src/components/**',
                'src/hooks/**',
                'src/shadcn/**',
                'src/support/**',
            ],
            provider: 'v8',
            reporter: ['text-summary', 'json-summary'],
            thresholds: {
                branches: 85,
                functions: 85,
                lines: 85,
                statements: 85,
            },
        },
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
    },
});
