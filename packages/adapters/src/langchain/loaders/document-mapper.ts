import { isString } from '@rag-sdk/utils'

import type { Document as LangChainDocument } from '@langchain/core/documents'
import type { Document, JsonValue } from '@rag-sdk/core'

/**
 * 将 LangChain 文档转换为 core 包定义的文档结构。
 */
export function toDocument(document: LangChainDocument): Document {
    const metadata = document.metadata as JsonValue
    const source = isString(document.metadata.source) ? document.metadata.source : undefined

    return {
        content: document.pageContent,
        ...(document.id ? { id: document.id } : {}),
        metadata,
        ...(source ? { source } : {}),
    }
}
