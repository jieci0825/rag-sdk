import { stat } from 'node:fs/promises'

import { createDirectoryLoader, createFileLoader } from './loader-factories'

import type { BaseDocumentLoader } from '@langchain/core/document_loaders/base'

/**
 * 根据文件或目录来源创建对应的 LangChain 加载器。
 */
export async function createSourceLoader(source: string): Promise<BaseDocumentLoader> {
    const sourceStat = await stat(source)

    if (sourceStat.isDirectory()) {
        return createDirectoryLoader(source)
    }

    if (sourceStat.isFile()) {
        return createFileLoader(source)
    }

    throw new Error(`Unsupported source type: ${source}`)
}
