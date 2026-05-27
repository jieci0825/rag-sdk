import type { ChunkEmbedding } from '../embeddings'

export interface IndexStore<TResult = void> {
    store(embeddings: ChunkEmbedding[]): Promise<TResult>
}
