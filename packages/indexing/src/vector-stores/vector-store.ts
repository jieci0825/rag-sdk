import type { JsonValue } from '@rag-sdk/core'

export type VectorFilterField = 'id' | 'documentId' | 'source' | 'fingerprint'

export type VectorFilterValue = string

export type VectorFilter =
    | {
          field: VectorFilterField
          operator: 'eq'
          value: VectorFilterValue
      }
    | {
          field: VectorFilterField
          operator: 'in'
          value: VectorFilterValue[]
      }

export type VectorRecord = {
    id: string
    content: string
    embedding: number[]
    fingerprint: string
    metadata?: JsonValue
} & (
    | {
          documentId: string
          source?: string
      }
    | {
          documentId?: string
          source: string
      }
)

export interface VectorStore {
    /**
     * 批量写入或覆盖向量记录。
     */
    upsert(records: VectorRecord[]): Promise<void>

    /**
     * 根据过滤条件删除向量记录。
     */
    deleteByFilter(filter: VectorFilter): Promise<void>
}
