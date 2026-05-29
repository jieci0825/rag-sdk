import type { Chunk } from '@rag-sdk/core'

export interface ChunkEmbedding {
    chunk: Chunk
    embedding: number[]
}

export interface ChunkEmbedder {
    /**
     * 为 chunk 集合生成向量表示。
     */
    embed(chunks: Chunk[]): Promise<ChunkEmbedding[]>
}
