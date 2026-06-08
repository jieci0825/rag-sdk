import type { JsonValue } from '@rag-sdk/core'

export interface RetrievalRequest {
    text: string
    filter?: Record<string, JsonValue>
    params?: Record<string, JsonValue>
    topK?: number
}

export interface RetrievalQuery extends RetrievalRequest {
    embedding?: number[]
}
