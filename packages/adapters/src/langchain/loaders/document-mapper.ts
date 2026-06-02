import { isString } from '@rag-sdk/utils'

import type { Document as LangChainDocument } from '@langchain/core/documents'
import type { Document, JsonValue } from '@rag-sdk/core'

/**
 * 从 LangChain metadata 中提取对象形态的元数据。
 */
function toMetadata(metadata: unknown): Record<string, JsonValue> {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
        return {}
    }

    return metadata as Record<string, JsonValue>
}

/**
 * 将 LangChain 文档转换为 core 包定义的文档结构。
 */
export function toDocument(document: LangChainDocument, index: number): Document {
    const metadata = toMetadata(document.metadata)
    const contentHash = isString(metadata.contentHash) ? metadata.contentHash : undefined
    const sourceId = isString(metadata.sourceId)
        ? metadata.sourceId
        : isString(metadata.source)
          ? metadata.source
          : undefined
    const id = document.id ?? (sourceId ? `${sourceId}:${index}` : `${index}`)

    return {
        content: document.pageContent,
        ...(contentHash ? { contentHash } : {}),
        id,
        metadata,
        ...(sourceId ? { sourceId } : {}),
    }
}
