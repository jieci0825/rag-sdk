import { isArray, isPlainObject } from '@rag-sdk/utils'

import type { DocumentHashReader, VectorFilter, VectorFilterField, VectorRecord, VectorStore } from '@rag-sdk/indexing'

/**
 * 基于内存 Map 的通用向量存储实现，用于验证索引写入与增量判断链路。
 */
export class InMemoryVectorStore implements DocumentHashReader, VectorStore {
    private readonly records = new Map<string, VectorRecord>()

    /**
     * 使用可选的初始记录集合创建内存向量存储。
     */
    constructor(records: VectorRecord[] = []) {
        for (const record of records) {
            this.records.set(record.id, record)
        }
    }

    /**
     * 返回当前内存中的记录快照，便于测试或调试验证写入结果。
     */
    getRecords(): VectorRecord[] {
        return [...this.records.values()]
    }

    /**
     * 批量覆盖写入向量记录。
     */
    async upsert(records: VectorRecord[]): Promise<void> {
        for (const record of records) {
            this.records.set(record.id, record)
        }
    }

    /**
     * 删除指定 documentId 集合下的所有向量记录。
     */
    async deleteByDocumentIds(documentIds: string[]): Promise<void> {
        const documentIdSet = new Set(documentIds)

        for (const [recordId, record] of this.records.entries()) {
            if (documentIdSet.has(record.documentId)) {
                this.records.delete(recordId)
            }
        }
    }

    /**
     * 按顶层字段精确匹配删除记录，不扩展复杂过滤表达式。
     */
    async deleteByFilter(filter: VectorFilter): Promise<void> {
        for (const [recordId, record] of this.records.entries()) {
            if (matchesVectorFilter(record, filter)) {
                this.records.delete(recordId)
            }
        }
    }

    /**
     * 读取指定文档当前已写入记录上的 content hash 摘要。
     */
    async getDocumentHashes(documentIds: string[]): Promise<Record<string, string | undefined>> {
        const hashes: Record<string, string | undefined> = {}

        for (const documentId of documentIds) {
            hashes[documentId] = this.getRecords().find((record) => record.documentId === documentId)?.contentHash
        }

        return hashes
    }
}

/**
 * 判断一条记录是否命中最小顶层字段过滤条件。
 */
function matchesVectorFilter(record: VectorRecord, filter: VectorFilter): boolean {
    const entries = Object.entries(filter) as [VectorFilterField, VectorRecord[VectorFilterField]][]

    return entries.every(([field, value]) => isExactTopLevelMatch(record[field], value))
}

/**
 * 对顶层字段执行精确比较；对象与数组退化为稳定序列化后的值比较。
 */
function isExactTopLevelMatch(left: unknown, right: unknown): boolean {
    if (isArray(left) || isArray(right) || isPlainObject(left) || isPlainObject(right)) {
        return JSON.stringify(left) === JSON.stringify(right)
    }

    return left === right
}
