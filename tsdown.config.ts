import { defineConfig } from 'tsdown'

export default defineConfig({
    // 将每个子包 src 目录下的 TypeScript 文件作为构建入口。
    entry: ['src/**/*.ts'],
    // 以子包的 src 目录作为输出结构的根目录。
    root: 'src',
    // 保持源码目录结构，逐文件输出而不是合并为单个文件。
    unbundle: true,
    // 启用工作区构建，让根配置统一应用到匹配的子包。
    workspace: {
        // 仅构建 packages 目录下的工作区包，不包含 playgrounds。
        include: ['packages/*'],
    },
})
