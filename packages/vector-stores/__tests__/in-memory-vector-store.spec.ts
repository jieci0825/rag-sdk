import { describe, expect, it } from 'vitest'

import { InMemoryVectorStore } from '../src'

describe('InMemoryVectorStore', () => {
    it('按 id 覆盖 upsert，并支持 documentId 删除和可选 filter 删除', async () => {
        const store = new InMemoryVectorStore()

        await store.upsert([
            {
                content: 'chunk 1',
                contentHash: 'hash-1',
                documentId: 'doc-1',
                embedding: [0.1],
                id: 'chunk-1',
                metadata: {
                    category: 'note',
                },
                sourceId: 'docs/a.txt',
            },
            {
                content: 'chunk 1 updated',
                contentHash: 'hash-1',
                documentId: 'doc-1',
                embedding: [0.2],
                id: 'chunk-1',
                metadata: {
                    category: 'note',
                },
                sourceId: 'docs/a.txt',
            },
            {
                content: 'chunk 2',
                contentHash: 'hash-2',
                documentId: 'doc-2',
                embedding: [0.3],
                id: 'chunk-2',
                metadata: {
                    category: 'memo',
                },
                sourceId: 'docs/b.txt',
            },
        ])

        expect(store.getRecords()).toEqual([
            {
                content: 'chunk 1 updated',
                contentHash: 'hash-1',
                documentId: 'doc-1',
                embedding: [0.2],
                id: 'chunk-1',
                metadata: {
                    category: 'note',
                },
                sourceId: 'docs/a.txt',
            },
            {
                content: 'chunk 2',
                contentHash: 'hash-2',
                documentId: 'doc-2',
                embedding: [0.3],
                id: 'chunk-2',
                metadata: {
                    category: 'memo',
                },
                sourceId: 'docs/b.txt',
            },
        ])

        await store.deleteByFilter({
            sourceId: 'docs/b.txt',
        })
        await store.deleteByDocumentIds(['doc-1'])

        expect(store.getRecords()).toEqual([])
    })

    it('按 documentId 返回当前 content hash 摘要', async () => {
        const store = new InMemoryVectorStore([
            {
                content: 'chunk 1',
                contentHash: 'hash-1',
                documentId: 'doc-1',
                embedding: [0.1],
                id: 'chunk-1',
                metadata: {},
            },
            {
                content: 'chunk 2',
                documentId: 'doc-2',
                embedding: [0.2],
                id: 'chunk-2',
                metadata: {},
            },
        ])

        expect(await store.getDocumentHashes(['doc-1', 'doc-2', 'doc-3'])).toEqual({
            'doc-1': 'hash-1',
            'doc-2': undefined,
            'doc-3': undefined,
        })
    })
})
