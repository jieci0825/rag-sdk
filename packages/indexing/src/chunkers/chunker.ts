import type { Document, Chunk } from '@rag-sdk/core'

export interface DocumentChunker {
    /**
     * 将文档集合切分为可用于索引的 chunk 集合。
     */
    chunk(documents: Document[]): Promise<Chunk[]>
}
