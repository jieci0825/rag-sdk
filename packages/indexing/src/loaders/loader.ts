import type { Document } from '@rag-sdk/core'

export interface DocumentLoader<TSource = unknown> {
    /**
     * 从指定来源加载文档集合。
     */
    load(source: TSource): Promise<Document[]>
}
