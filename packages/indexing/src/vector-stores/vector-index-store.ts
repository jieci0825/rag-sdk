import type { ChunkEmbedding } from '../embeddings'
import type { IndexStore } from '../pipeline'
import type { VectorRecord, VectorStore } from './vector-store'

/**
 * 将索引流水线的 chunk embedding 写入通用向量存储。
 */
export class VectorIndexStore implements IndexStore<void> {
    /**
     * 使用指定通用向量存储创建索引写入适配器。
     */
    constructor(private readonly vectorStore: VectorStore) {}

    /**
     * 将 chunk embedding 转换为向量记录并批量写入底层向量存储。
     */
    async store(embeddings: ChunkEmbedding[]): Promise<void> {
        await this.vectorStore.upsert(embeddings.map((embedding) => this.toVectorRecord(embedding)))
    }

    /**
     * 将单个 chunk embedding 映射为通用向量记录。
     */
    private toVectorRecord({ chunk, embedding }: ChunkEmbedding): VectorRecord {
        const record: VectorRecord = {
            content: chunk.content,
            embedding,
            id: chunk.id,
        }

        if (chunk.metadata !== undefined) {
            record.metadata = chunk.metadata
        }

        return record
    }
}
