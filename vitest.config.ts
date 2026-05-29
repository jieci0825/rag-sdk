import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        alias: {
            '@rag-sdk/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
            '@rag-sdk/indexing': fileURLToPath(new URL('./packages/indexing/src/index.ts', import.meta.url)),
            '@rag-sdk/utils': fileURLToPath(new URL('./packages/utils/src/index.ts', import.meta.url)),
        },
    },
})
