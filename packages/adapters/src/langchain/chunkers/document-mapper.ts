import { Document as LangChainDocument } from '@langchain/core/documents'
import { isPlainObject } from '@rag-sdk/utils'

import type { Chunk, Document, JsonValue } from '@rag-sdk/core'

/**
 * 将 core 文档转换为 LangChain 文档，供 TextSplitter 消费。
 * - 即将上一步 loader 得到的 core 文档类型，做出转换，以便于 langChain 中的 TextSplitter 方法可以进行消费
 */
export function toLangChainDocument(document: Document): LangChainDocument {
    return new LangChainDocument({
        id: document.id,
        metadata: {
            ...(isPlainObject(document.metadata) ? document.metadata : {}),
            ...(document.id ? { documentId: document.id } : {}),
            ...(document.source ? { source: document.source } : {}),
        },
        pageContent: document.content,
    })
}

/**
 * 将 LangChain 切分结果转换为 core 包定义的 chunk 结构。
 * - 即得到这个结果，是为了实现流水线中的规范，以便于进行后续流程调用
 */
export function toChunk(document: LangChainDocument, id: string, chunkIndex: number): Chunk {
    const metadata = {
        ...(isPlainObject(document.metadata) ? document.metadata : {}),
        chunkIndex,
    } as JsonValue

    return {
        content: document.pageContent,
        id,
        metadata,
    }
}
