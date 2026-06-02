import { describe, expect, it } from 'vitest'

import { InMemoryVectorStore } from '@rag-sdk/adapters'

import { createDocumentHashIndexingPlan, executeIndexPipeline, getDocumentHashesForDocuments } from '../src'

import type { Document } from '@rag-sdk/core'
import type { IndexPipeline } from '../src'

describe('incremental indexing helpers', () => {
    it('按 contentHash 识别 unchanged、changed 和 new 文档', () => {
        const documents: Document[] = [
            {
                content: 'same',
                contentHash: 'hash-1',
                id: 'doc-1',
            },
            {
                content: 'changed',
                contentHash: 'hash-2-next',
                id: 'doc-2',
            },
            {
                content: 'new',
                contentHash: 'hash-3',
                id: 'doc-3',
            },
        ]

        const plan = createDocumentHashIndexingPlan(documents, {
            'doc-1': 'hash-1',
            'doc-2': 'hash-2-prev',
        })

        expect(plan.unchangedDocumentIds).toEqual(['doc-1'])
        expect(plan.changedDocumentIds).toEqual(['doc-2'])
        expect(plan.newDocumentIds).toEqual(['doc-3'])
        expect(plan.documentsToIndex.map((document) => document.id)).toEqual(['doc-2', 'doc-3'])
        expect(plan.writeContext).toEqual({
            mode: 'replaceDocument',
            skippedCount: 1,
        })
    })

    it('在外层增量决策下返回真实 skipped 数量，并只重写 changed/new 文档', async () => {
        const store = new InMemoryVectorStore()
        const pipeline: IndexPipeline<Document[]> = {
            chunker: {
                /**
                 * 为每个文档生成单个 chunk，便于验证 document 级 replace 行为。
                 */
                async chunk(documents) {
                    return documents.map((document) => ({
                        chunkIndex: 0,
                        content: document.content,
                        ...(document.contentHash ? { contentHash: document.contentHash } : {}),
                        documentId: document.id,
                        id: `${document.id}:0`,
                        metadata: document.metadata,
                        ...(document.sourceId ? { sourceId: document.sourceId } : {}),
                    }))
                },
            },
            embedder: {
                /**
                 * 用固定向量值模拟 embedding 输出。
                 */
                async embed(chunks) {
                    return chunks.map((chunk, index) => ({
                        chunk,
                        embedding: [index],
                    }))
                },
            },
            loader: {
                /**
                 * 直接返回当前待索引的文档集合。
                 */
                async load(documents) {
                    return documents
                },
            },
            store,
        }

        await executeIndexPipeline(
            pipeline,
            [
                {
                    content: 'same',
                    contentHash: 'hash-1',
                    id: 'doc-1',
                },
                {
                    content: 'before',
                    contentHash: 'hash-2-prev',
                    id: 'doc-2',
                },
            ],
            {
                writeContext: {
                    mode: 'replaceDocument',
                },
            },
        )

        const nextDocuments: Document[] = [
            {
                content: 'same',
                contentHash: 'hash-1',
                id: 'doc-1',
            },
            {
                content: 'after',
                contentHash: 'hash-2-next',
                id: 'doc-2',
            },
            {
                content: 'new',
                contentHash: 'hash-3',
                id: 'doc-3',
            },
        ]
        const plan = createDocumentHashIndexingPlan(
            nextDocuments,
            await getDocumentHashesForDocuments(store, nextDocuments),
        )

        const result = await executeIndexPipeline(pipeline, plan.documentsToIndex, {
            writeContext: {
                ...plan.writeContext,
                runId: 'run-2',
            },
        })

        expect(plan.unchangedDocumentIds).toEqual(['doc-1'])
        expect(plan.changedDocumentIds).toEqual(['doc-2'])
        expect(plan.newDocumentIds).toEqual(['doc-3'])
        expect(result.result).toEqual({
            added: 2,
            deleted: 2,
            skipped: 1,
            updated: 0,
        })
        expect(store.getRecords().map((record) => `${record.documentId}:${record.contentHash}`)).toEqual([
            'doc-1:hash-1',
            'doc-2:hash-2-next',
            'doc-3:hash-3',
        ])
    })
})
