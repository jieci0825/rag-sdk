import { extname } from 'node:path'

import { DirectoryLoader } from '@langchain/classic/document_loaders/fs/directory'
import { TextLoader } from '@langchain/classic/document_loaders/fs/text'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'

import type { BaseDocumentLoader } from '@langchain/core/document_loaders/base'

type SupportedExtension = '.md' | '.pdf' | '.txt'

const loaderFactories: Record<SupportedExtension, (filePath: string) => BaseDocumentLoader> = {
    /**
     * 为 Markdown 文件创建纯文本加载器。
     */
    '.md': (filePath) => new TextLoader(filePath),
    /**
     * 为 PDF 文件创建 PDF 加载器。
     */
    '.pdf': (filePath) => new PDFLoader(filePath),
    /**
     * 为纯文本文件创建文本加载器。
     */
    '.txt': (filePath) => new TextLoader(filePath),
}

/**
 * 为受支持的文档格式创建递归目录加载器。
 */
export function createDirectoryLoader(directoryPath: string): BaseDocumentLoader {
    return new DirectoryLoader(directoryPath, loaderFactories, true, 'ignore')
}

/**
 * 根据文件扩展名创建 LangChain 文件加载器。
 */
export function createFileLoader(filePath: string): BaseDocumentLoader {
    const extension = extname(filePath).toLowerCase() as SupportedExtension
    const loaderFactory = loaderFactories[extension]

    if (!loaderFactory) {
        throw new Error(`Unsupported file type: ${extension || '<none>'}. Supported file types: .md, .pdf, .txt.`)
    }

    return loaderFactory(filePath)
}
