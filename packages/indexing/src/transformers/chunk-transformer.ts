import type { Chunk } from '@rag-sdk/core'

export interface ChunkTransformer {
    /**
     * 按索引流程需要转换 chunk 集合。
     */
    transform(chunks: Chunk[]): Promise<Chunk[]>
}
