import type { Document } from '@rag-sdk/core'

import type { IndexStoreResult, IndexStoreWriteContext } from '../pipeline'

export type DocumentHashSummary = Record<string, string | undefined>

export interface DocumentHashReader {
    /**
     * 批量读取指定文档当前已索引的 content hash 摘要。
     */
    getDocumentHashes(documentIds: string[]): Promise<DocumentHashSummary>
}

export interface DocumentHashIndexingPlan {
    unchangedDocumentIds: string[]
    changedDocumentIds: string[]
    newDocumentIds: string[]
    documentsToIndex: Document[]
    skippedCount: number
    writeContext?: IndexStoreWriteContext
}

/**
 * 按当前文档集合批量读取已有 content hash 摘要。
 */
export async function getDocumentHashesForDocuments(
    reader: DocumentHashReader,
    documents: Document[],
): Promise<DocumentHashSummary> {
    return reader.getDocumentHashes([...new Set(documents.map((document) => document.id))])
}

/**
 * 根据文档级 content hash 生成本轮索引计划。
 *
 * 只有 contentHash 明确存在且与已有摘要一致时，文档才会被判定为 unchanged；
 * 其余情况都保守地进入待索引集合。
 */
export function createDocumentHashIndexingPlan(
    documents: Document[],
    existingHashes: DocumentHashSummary,
): DocumentHashIndexingPlan {
    const unchangedDocumentIds: string[] = []
    const changedDocumentIds: string[] = []
    const newDocumentIds: string[] = []
    const documentsToIndex: Document[] = []

    for (const document of documents) {
        const existingHash = existingHashes[document.id]

        if (typeof existingHash === 'undefined') {
            newDocumentIds.push(document.id)
            documentsToIndex.push(document)
            continue
        }

        if (document.contentHash && document.contentHash === existingHash) {
            unchangedDocumentIds.push(document.id)
            continue
        }

        changedDocumentIds.push(document.id)
        documentsToIndex.push(document)
    }

    return {
        changedDocumentIds,
        documentsToIndex,
        newDocumentIds,
        skippedCount: unchangedDocumentIds.length,
        unchangedDocumentIds,
        writeContext:
            documentsToIndex.length > 0
                ? {
                      mode: 'replaceDocument',
                      skippedCount: unchangedDocumentIds.length,
                  }
                : unchangedDocumentIds.length > 0
                  ? {
                        skippedCount: unchangedDocumentIds.length,
                    }
                  : undefined,
    }
}

/**
 * 将外层增量决策得到的 skipped 数量合并回标准写入结果。
 */
export function mergeSkippedIntoIndexStoreResult(result: IndexStoreResult, skippedCount: number): IndexStoreResult {
    return {
        ...result,
        skipped: skippedCount,
    }
}
