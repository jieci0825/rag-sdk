import type { Chunk, Document } from '@rag-sdk/core'

export interface DocumentTransformer {
    /**
     * 按索引流程需要转换文档集合。
     */
    transform(documents: Document[]): Promise<Document[]>
}

export interface ChunkTransformer {
    /**
     * 按索引流程需要转换 chunk 集合。
     */
    transform(chunks: Chunk[]): Promise<Chunk[]>
}
