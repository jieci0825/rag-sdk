import type { VectorRecord, VectorStore } from '@rag-sdk/indexing'

/**
 * PostgreSQL 向量存储骨架，具体连接配置与读写逻辑后续补齐。
 */
export class PostgreSqlVectorStore implements VectorStore {
    /**
     * PostgreSQL 写入逻辑尚未实现。
     */
    async upsert(_records: VectorRecord[]): Promise<void> {
        throw new Error('PostgreSqlVectorStore.upsert is not implemented yet.')
    }

    /**
     * PostgreSQL 文档删除逻辑尚未实现。
     */
    async deleteByDocumentIds(_documentIds: string[]): Promise<void> {
        throw new Error('PostgreSqlVectorStore.deleteByDocumentIds is not implemented yet.')
    }
}
