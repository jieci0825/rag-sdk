import type { Document } from '@rag-sdk/core'

export interface DocumentTransform {
    /**
     * 在 loader 之后、chunker 之前转换文档集合。
     */
    transform(documents: Document[]): Promise<Document[]>
}

/**
 * 兼容旧命名的文档转换接口。
 */
export interface DocumentTransformer extends DocumentTransform {}
