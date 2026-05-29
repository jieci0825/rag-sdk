import type { ChunkEmbedding } from '../embeddings'

export interface IndexStore<TResult = void> {
    /**
     * 持久化 chunk embedding，并返回存储层结果。
     */
    store(embeddings: ChunkEmbedding[]): Promise<TResult>
}
