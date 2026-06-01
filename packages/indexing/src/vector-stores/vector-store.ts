import type { JsonValue } from '@rag-sdk/core'

export type VectorFilterValue = string | number | boolean

export type VectorFilter =
    | {
          field: string
          operator: 'eq'
          value: VectorFilterValue
      }
    | {
          field: string
          operator: 'in'
          value: VectorFilterValue[]
      }

export interface VectorRecord {
    id: string
    content: string
    embedding: number[]
    metadata?: JsonValue
}

export interface VectorStore {
    /**
     * 批量写入或覆盖向量记录。
     */
    upsert(records: VectorRecord[]): Promise<void>

    /**
     * 根据记录 id 批量删除向量记录。
     */
    delete(ids: string[]): Promise<void>
}
