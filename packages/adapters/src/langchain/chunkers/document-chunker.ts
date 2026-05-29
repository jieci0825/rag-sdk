import { toChunk, toLangChainDocument } from './document-mapper'

import type { Document as LangChainDocument } from '@langchain/core/documents'
import type { Chunk, Document } from '@rag-sdk/core'
import type { DocumentChunker } from '@rag-sdk/indexing'

/**
 * 基于 LangChain TextSplitter 的文档切分适配器。
 */
export class LangChainDocumentChunker implements DocumentChunker {
    constructor(private readonly splitter: LangChainTextSplitter) {}

    /**
     * 将 core 文档切分为带稳定顺序 id 的 chunk。
     */
    async chunk(documents: Document[]): Promise<Chunk[]> {
        const chunks: Chunk[] = []

        for (const [documentIndex, document] of documents.entries()) {
            const splitDocuments = await this.splitter.splitDocuments([toLangChainDocument(document)])
            const documentKey = document.id ?? document.source ?? `${documentIndex}`

            for (const [chunkIndex, splitDocument] of splitDocuments.entries()) {
                if (!splitDocument.pageContent) {
                    continue
                }

                chunks.push(toChunk(splitDocument, `${documentKey}:${chunkIndex}`, chunkIndex))
            }
        }

        return chunks
    }
}

export interface LangChainTextSplitter {
    splitDocuments(documents: LangChainDocument[]): Promise<LangChainDocument[]>
}
