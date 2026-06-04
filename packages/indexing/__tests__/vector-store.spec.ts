import { describe, expect, it } from 'vitest'

import { collectDocumentIdsForVectorStoreWrite, toVectorRecords, writeVectorStore } from '../src'

import type { ChunkEmbedding, VectorStore } from '../src'

describe('vector store helpers', () => {
    it('将 chunk embeddings 映射为正式 vector records，并保留 identity 字段', () => {
        const records = toVectorRecords([
            {
                chunk: {
                    chunkIndex: 0,
                    content: 'chunk',
                    contentHash: 'hash-1',
                    documentId: 'doc-1',
                    id: 'chunk-1',
                    metadata: {
                        category: 'note',
                    },
                    sourceId: 'docs/a.txt',
                },
                embedding: [0.1, 0.2],
            },
        ])

        expect(records).toEqual([
            {
                chunkIndex: 0,
                content: 'chunk',
                contentHash: 'hash-1',
                documentId: 'doc-1',
                embedding: [0.1, 0.2],
                id: 'chunk-1',
                metadata: {
                    category: 'note',
                },
                sourceId: 'docs/a.txt',
            },
        ])
        expect(collectDocumentIdsForVectorStoreWrite(records)).toEqual(['doc-1'])
    })

    it('append 模式只执行 upsert，replaceDocument 模式会先删后写并去重 documentId', async () => {
        const events: string[] = []
        const recordsStore: VectorStore = {
            /**
             * 记录实际写入的 records 顺序。
             */
            async upsert(records) {
                events.push(`upsert:${records.map((record) => record.id).join(',')}`)
            },
            /**
             * 记录 replaceDocument 模式下的删除目标。
             */
            async deleteByDocumentIds(documentIds) {
                events.push(`delete:${documentIds.join(',')}`)
            },
        }
        const embeddings: ChunkEmbedding[] = [
            {
                chunk: {
                    content: 'chunk 1',
                    documentId: 'doc-1',
                    id: 'chunk-1',
                },
                embedding: [0.1],
            },
            {
                chunk: {
                    content: 'chunk 2',
                    documentId: 'doc-1',
                    id: 'chunk-2',
                },
                embedding: [0.2],
            },
            {
                chunk: {
                    content: 'chunk 3',
                    documentId: 'doc-2',
                    id: 'chunk-3',
                },
                embedding: [0.3],
            },
        ]

        const appendResult = await writeVectorStore(recordsStore, embeddings, {
            mode: 'append',
        })
        const replaceResult = await writeVectorStore(recordsStore, embeddings, {
            mode: 'replaceDocument',
        })

        expect(events).toEqual([
            'upsert:chunk-1,chunk-2,chunk-3',
            'delete:doc-1,doc-2',
            'upsert:chunk-1,chunk-2,chunk-3',
        ])
        expect(appendResult).toEqual({
            added: 3,
            deleted: 0,
            skipped: 0,
            updated: 0,
        })
        expect(replaceResult).toEqual({
            added: 3,
            deleted: 2,
            skipped: 0,
            updated: 0,
        })
    })
})
