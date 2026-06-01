import { describe, expect, it } from 'vitest'

import { VectorIndexStore } from '../src'
import type { ChunkEmbedding } from '../src'
import type { VectorFilter, VectorRecord, VectorStore } from '../src'

describe('vector index store', () => {
    it('将 chunk embedding 按输入顺序批量写入通用向量存储', async () => {
        let upsertCalls = 0
        let upsertRecords: VectorRecord[] | undefined
        const vectorStore: VectorStore = {
            /**
             * 记录测试中的向量写入请求。
             */
            async upsert(records) {
                upsertCalls += 1
                upsertRecords = records
            },
            /**
             * 删除能力不参与本用例。
             */
            async delete() {
                return
            },
        }
        const indexStore = new VectorIndexStore(vectorStore)
        const embeddings: ChunkEmbedding[] = [
            {
                chunk: {
                    content: 'first content',
                    id: 'chunk-1',
                    metadata: {
                        source: 'doc-1',
                    },
                },
                embedding: [0.1, 0.2],
            },
            {
                chunk: {
                    content: 'second content',
                    id: 'chunk-2',
                },
                embedding: [0.3, 0.4],
            },
        ]

        await indexStore.store(embeddings)

        expect(upsertCalls).toBe(1)
        expect(upsertRecords).toEqual([
            {
                content: 'first content',
                embedding: [0.1, 0.2],
                id: 'chunk-1',
                metadata: {
                    source: 'doc-1',
                },
            },
            {
                content: 'second content',
                embedding: [0.3, 0.4],
                id: 'chunk-2',
            },
        ])
    })

    it('从包入口导出索引阶段向量存储类型', () => {
        const filter: VectorFilter = {
            field: 'source',
            operator: 'in',
            value: ['doc-1', 'doc-2'],
        }
        const record: VectorRecord = {
            content: 'content',
            embedding: [1],
            id: 'chunk-1',
            metadata: {
                source: 'doc-1',
            },
        }

        expect(filter.value).toEqual(['doc-1', 'doc-2'])
        expect(record.metadata).toEqual({
            source: 'doc-1',
        })
    })
})
