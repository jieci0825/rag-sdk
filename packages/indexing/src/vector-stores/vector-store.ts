export type VectorFilter = any

export type VectorRecord = any

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
