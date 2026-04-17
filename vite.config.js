import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function createManualChunks(id) {
    const normalizedId = id.replaceAll('\\', '/');

    if (normalizedId.includes('/node_modules/')) {
        if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') || normalizedId.includes('/scheduler/')) {
            return 'react-vendor';
        }

        if (normalizedId.includes('/react-router-dom/') || normalizedId.includes('/react-router/')) {
            return 'router-vendor';
        }

        if (normalizedId.includes('/axios/')) {
            return 'data-vendor';
        }

        return 'vendor';
    }

    if (normalizedId.includes('/src/features/admin/')) {
        return 'admin-pages';
    }

    if (normalizedId.includes('/src/features/tests/')) {
        return 'test-pages';
    }

    if (normalizedId.includes('/src/features/flashcards/')) {
        return 'flashcard-pages';
    }

    if (normalizedId.includes('/src/features/courses/') || normalizedId.includes('/src/features/learn/')) {
        return 'learning-pages';
    }

    return undefined;
}

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    plugins: [
        tailwindcss(),
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler']],
            },
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: createManualChunks,
            },
        },
    },
});
