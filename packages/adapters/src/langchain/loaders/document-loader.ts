import { toDocument } from './document-mapper'
import { createSourceLoader } from './source-loader'

import type { Document } from '@rag-sdk/core'
import type { DocumentLoader } from '@rag-sdk/indexing'

/**
 * 基于 LangChain 文件系统加载器的文档加载适配器。
 */
export class LangChainDocumentLoader implements DocumentLoader<string> {
    /**
     * 从单个受支持文件或目录路径加载文档。
     */
    async load(source: string): Promise<Document[]> {
        const loader = await createSourceLoader(source)
        const documents = await loader.load()

        return documents.map(toDocument)
    }
}
