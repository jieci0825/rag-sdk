import type { ChunkEmbedding } from '../embeddings'
import type { IndexStoreResult, IndexStoreWriteContext } from '../pipeline'

export type VectorFilterField = string

export type VectorFilterValue = any

export type VectorFilter = any

export type VectorRecord = any

export interface VectorStore {
    /**
     * 批量写入或覆盖向量记录。
     */
    upsert(records: VectorRecord[]): Promise<void>

    /**
     * 根据文档标识删除该文档下的所有向量记录。
     */
    deleteByDocumentIds(documentIds: string[]): Promise<void>

    /**
     * 根据过滤条件删除向量记录。
     */
    deleteByFilter(filter: VectorFilter): Promise<void>
}

/**
 * 根据当前写入批次收集需要先删除的文档标识。
 */
export function collectDocumentIdsForVectorStoreWrite(embeddings: ChunkEmbedding[]): string[] {
    return [...new Set(embeddings.map((embedding) => embedding.chunk.documentId))]
}

/**
 * 按写入上下文协调向量存储删除与写入，并返回标准化结果。
 */
export async function writeVectorStore(
    store: VectorStore,
    embeddings: ChunkEmbedding[],
    context?: IndexStoreWriteContext,
): Promise<IndexStoreResult> {
    const deletedDocumentIds =
        context?.mode === 'replaceDocument' ? collectDocumentIdsForVectorStoreWrite(embeddings) : []

    if (deletedDocumentIds.length > 0) {
        await store.deleteByDocumentIds(deletedDocumentIds)
    }

    await store.upsert(embeddings)

    return {
        added: embeddings.length,
        deleted: deletedDocumentIds.length,
        skipped: 0,
        updated: 0,
    }
}
