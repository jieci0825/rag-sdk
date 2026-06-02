import { toChunk, toLangChainDocument } from './document-mapper'

import type { Document as LangChainDocument } from '@langchain/core/documents'
import type { Chunk, Document } from '@rag-sdk/core'
import type { DocumentChunker } from '@rag-sdk/indexing'

/**
 * 基于 LangChain TextSplitter 的文档切分适配器。
 */
export class LangChainDocumentChunker implements DocumentChunker {
    /**
     * 使用指定 TextSplitter 创建文档切分适配器。
     */
    constructor(private readonly splitter: LangChainTextSplitter) {}

    /**
     * 将 core 文档切分为带稳定顺序 id 的 chunk。
     */
    async chunk(documents: Document[]): Promise<Chunk[]> {
        const chunks: Chunk[] = []

        for (const document of documents) {
            const splitDocuments = await this.splitter.splitDocuments([toLangChainDocument(document)])

            for (const [chunkIndex, splitDocument] of splitDocuments.entries()) {
                if (!splitDocument.pageContent) {
                    continue
                }

                chunks.push(
                    toChunk(splitDocument, {
                        chunkIndex,
                        documentId: document.id,
                        id: `${document.id}:${chunkIndex}`,
                        ...(document.sourceId ? { sourceId: document.sourceId } : {}),
                    }),
                )
            }
        }

        return chunks
    }
}

export interface LangChainTextSplitter {
    /**
     * 将 LangChain 文档集合切分为更小的 LangChain 文档集合。
     */
    splitDocuments(documents: LangChainDocument[]): Promise<LangChainDocument[]>
}
