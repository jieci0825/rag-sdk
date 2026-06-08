import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: ['src/**/*.ts'],
    root: 'src',
    unbundle: true,
    workspace: {
        include: ['packages/*'],
    },
})
