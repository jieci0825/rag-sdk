import type { EmbeddingsInterface } from '@langchain/core/embeddings'
import type { Chunk } from '@rag-sdk/core'
import type { ChunkEmbedder, ChunkEmbedding } from '@rag-sdk/indexing'

/**
 * 基于 LangChain Embeddings 的 chunk 向量化适配器。
 */
export class LangChainChunkEmbedder implements ChunkEmbedder {
    /**
     * 使用指定 LangChain Embeddings 创建 chunk 向量化适配器。
     */
    constructor(private readonly embeddings: EmbeddingsInterface) {}

    /**
     * 将 chunk 内容批量转换为向量，并按输入顺序映射回原始 chunk。
     */
    async embed(chunks: Chunk[]): Promise<ChunkEmbedding[]> {
        const vectors = await this.embeddings.embedDocuments(chunks.map((chunk) => chunk.content))

        return chunks.map((chunk, index) => ({
            chunk,
            embedding: vectors[index],
        }))
    }
}
