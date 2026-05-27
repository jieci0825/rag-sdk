import type { Document } from '@rag-sdk/core'

export interface DocumentPreprocessor {
    preprocess(documents: Document[]): Promise<Document[]>
}
