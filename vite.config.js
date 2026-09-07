import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { esmExternalRequirePlugin } from 'rolldown/plugins';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
export default defineConfig({
    build: {
        cssCodeSplit: false,
        lib: {
            cssFileName: 'index',
            entry: {
                index: path.resolve(__dirname, 'src/index.ts'),
            },
            formats: ['es'],
        },
        rollupOptions: {
            external: [
                'tailwindcss',
                '@turystack/react-icons',
                '@turystack/react-hooks',
                '@turystack/react-i18n',
            ],
            output: {
                entryFileNames: '[name].js',
            },
        },
    },
    plugins: [
        esmExternalRequirePlugin({
            external: [/^react(?:-dom)?(?:\/.*)?$/],
        }),
        react(),
        tailwindcss(),
        dts({
            // `.ts` as well as `.tsx`: tests sit beside the code they cover, and the
            // narrower glob was already shipping `phone-input.utils.test.d.ts` to
            // consumers. `tests/` has to go too — it is outside `src`, so including
            // it moved the declaration root up to the package and every `.d.ts`
            // landed under `dist/src/`, leaving `types: ./dist/index.d.ts` pointing
            // at nothing while the build still exited 0.
            exclude: ['**/*.test.ts', '**/*.test.tsx', 'tests/**'],
            tsconfigPath: './tsconfig.app.json',
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
