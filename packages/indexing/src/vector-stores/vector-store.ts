import type { ChunkEmbedding } from '../embeddings'
import type { IndexMetadata } from '../metadata'
import type { IndexStoreResult, IndexStoreWriteContext } from '../pipeline'

export interface VectorRecord {
    id: string
    documentId: string
    content: string
    embedding: number[]
    metadata: IndexMetadata
    sourceId?: string
    chunkIndex?: number
    contentHash?: string
}

export type VectorFilterField = keyof VectorRecord

export type VectorFilterValue = VectorRecord[VectorFilterField]

export type VectorFilter = Partial<VectorRecord>

export interface VectorStore {
    /**
     * 批量写入或覆盖向量记录。
     */
    upsert(records: VectorRecord[]): Promise<void>

    /**
     * 根据文档标识删除该文档下的所有向量记录。
     */
    deleteByDocumentIds(documentIds: string[]): Promise<void>
}

export interface FilterableVectorStore extends VectorStore {
    /**
     * 根据过滤条件删除向量记录。
     */
    deleteByFilter(filter: VectorFilter): Promise<void>
}

/**
 * 将单个 chunk embedding 映射为底层向量存储记录。
 */
export function toVectorRecord(chunkEmbedding: ChunkEmbedding): VectorRecord {
    return {
        content: chunkEmbedding.chunk.content,
        ...(chunkEmbedding.chunk.contentHash ? { contentHash: chunkEmbedding.chunk.contentHash } : {}),
        documentId: chunkEmbedding.chunk.documentId,
        embedding: chunkEmbedding.embedding,
        id: chunkEmbedding.chunk.id,
        metadata: chunkEmbedding.chunk.metadata ?? {},
        ...(typeof chunkEmbedding.chunk.chunkIndex === 'number' ? { chunkIndex: chunkEmbedding.chunk.chunkIndex } : {}),
        ...(chunkEmbedding.chunk.sourceId ? { sourceId: chunkEmbedding.chunk.sourceId } : {}),
    }
}

/**
 * 将当前批次的 chunk embeddings 映射为可写入向量存储的记录集合。
 */
export function toVectorRecords(embeddings: ChunkEmbedding[]): VectorRecord[] {
    return embeddings.map(toVectorRecord)
}

/**
 * 根据当前写入批次收集需要先删除的文档标识。
 */
export function collectDocumentIdsForVectorStoreWrite(records: VectorRecord[]): string[] {
    return [...new Set(records.map((record) => record.documentId))]
}

/**
 * 按写入上下文协调向量存储删除与写入，并返回标准化结果。
 */
export async function writeVectorStore(
    store: VectorStore,
    embeddings: ChunkEmbedding[],
    context?: IndexStoreWriteContext,
): Promise<IndexStoreResult> {
    const records = toVectorRecords(embeddings)
    const deletedDocumentIds = context?.mode === 'replaceDocument' ? collectDocumentIdsForVectorStoreWrite(records) : []

    if (deletedDocumentIds.length > 0) {
        await store.deleteByDocumentIds(deletedDocumentIds)
    }

    await store.upsert(records)

    return {
        added: embeddings.length,
        deleted: deletedDocumentIds.length,
        skipped: context?.skippedCount ?? 0,
        updated: 0,
    }
}
