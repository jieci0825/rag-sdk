import type { Document } from '@rag-sdk/core'

export interface DocumentPreprocessor {
    /**
     * 在切分前对文档集合进行预处理。
     */
    preprocess(documents: Document[]): Promise<Document[]>
}
