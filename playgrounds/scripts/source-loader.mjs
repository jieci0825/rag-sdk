import { accessSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/**
 * 判断指定路径是否存在，供 loader 解析 TypeScript 源码入口时使用。
 */
function exists(path) {
    try {
        accessSync(path)

        return true
    } catch {
        return false
    }
}

/**
 * 从当前 loader 文件位置向上查找 workspace 根目录。
 */
function findWorkspaceRoot(startDirectory) {
    let currentDirectory = startDirectory

    while (currentDirectory !== dirname(currentDirectory)) {
        if (exists(join(currentDirectory, 'pnpm-workspace.yaml'))) {
            return currentDirectory
        }

        currentDirectory = dirname(currentDirectory)
    }

    throw new Error('Cannot find workspace root from playground source loader.')
}

const workspaceRoot = findWorkspaceRoot(dirname(fileURLToPath(import.meta.url)))

const aliases = new Map([
    ['@rag-sdk/core', 'packages/core/src/index.ts'],
    ['@rag-sdk/indexing', 'packages/indexing/src/index.ts'],
    ['@rag-sdk/adapters', 'packages/adapters/src/index.ts'],
    ['@rag-sdk/utils', 'packages/utils/src/index.ts'],
])

/**
 * 让手动 playground 可以直接运行 workspace TypeScript 源码和目录入口。
 */
export async function resolve(specifier, context, nextResolve) {
    const alias = aliases.get(specifier)

    if (alias) {
        return {
            shortCircuit: true,
            url: pathToFileURL(join(workspaceRoot, alias)).href,
        }
    }

    if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
        const basePath = join(dirname(fileURLToPath(context.parentURL)), specifier)
        const tsFilePath = `${basePath}.ts`
        const indexFilePath = join(basePath, 'index.ts')

        if (exists(tsFilePath)) {
            return {
                shortCircuit: true,
                url: pathToFileURL(tsFilePath).href,
            }
        }

        if (exists(indexFilePath)) {
            return {
                shortCircuit: true,
                url: pathToFileURL(indexFilePath).href,
            }
        }
    }

    return nextResolve(specifier, context)
}
