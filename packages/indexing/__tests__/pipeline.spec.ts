import { describe, expect, it } from 'vitest'

import { executeIndexPipeline } from '../src'

import type { Chunk, Document } from '@rag-sdk/core'
import type { ChunkEmbedding, IndexPipeline, IndexStore } from '../src'

class ReplaceDocumentTestStore implements IndexStore {
    deletedDocumentIds: string[] = []
    storedEmbeddings: ChunkEmbedding[] = []

    /**
     * 模拟向量存储按 documentId 删除并写入 embedding。
     */
    async upsert(records: ChunkEmbedding[]): Promise<void> {
        this.storedEmbeddings = records
    }

    /**
     * 记录 replaceDocument 模式下待删除的文档集合。
     */
    async deleteByDocumentIds(documentIds: string[]): Promise<void> {
        this.deletedDocumentIds = documentIds
    }

    /**
     * 测试场景不需要 filter 删除能力。
     */
    async deleteByFilter(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

describe('executeIndexPipeline', () => {
    it('没有 transformer 时保持基础索引流程', async () => {
        const documents: Document[] = [
            {
                content: 'document',
                id: 'doc-1',
            },
        ]
        const chunks: Chunk[] = [
            {
                content: 'chunk',
                documentId: 'doc-1',
                id: 'chunk-1',
            },
        ]
        const embeddings: ChunkEmbedding[] = [
            {
                chunk: chunks[0],
                embedding: [0.1],
            },
        ]
        const pipeline: IndexPipeline<string> = {
            chunker: {
                /**
                 * 返回测试 chunk 集合。
                 */
                async chunk(inputDocuments) {
                    expect(inputDocuments).toBe(documents)

                    return chunks
                },
            },
            embedder: {
                /**
                 * 返回测试向量集合。
                 */
                async embed(inputChunks) {
                    expect(inputChunks).toBe(chunks)

                    return embeddings
                },
            },
            loader: {
                /**
                 * 返回测试文档集合。
                 */
                async load(source) {
                    expect(source).toBe('source')

                    return documents
                },
            },
            store: {
                /**
                 * 验证基础写入会直接 upsert 当前批次 embedding。
                 */
                async upsert(inputEmbeddings) {
                    expect(inputEmbeddings).toBe(embeddings)
                },
                /**
                 * append 模式下不应触发文档级删除。
                 */
                async deleteByDocumentIds() {
                    throw new Error('append mode should not delete documents')
                },
                /**
                 * 测试场景不需要 filter 删除能力。
                 */
                async deleteByFilter() {
                    throw new Error('Method not implemented.')
                },
            },
        }

        const result = await executeIndexPipeline(pipeline, 'source', {
            writeContext: {
                mode: 'append',
                runId: 'run-1',
            },
        })

        expect(result).toEqual({
            chunks,
            documents,
            embeddings,
            result: {
                added: 1,
                deleted: 0,
                skipped: 0,
                updated: 0,
            },
        })
    })

    it('按声明顺序执行 document 和 chunk transformer', async () => {
        const events: string[] = []
        const pipeline: IndexPipeline<string> = {
            chunker: {
                /**
                 * 记录 chunker 输入并生成测试 chunk。
                 */
                async chunk(documents) {
                    events.push(`chunker:${documents[0].content}`)

                    return [
                        {
                            content: `${documents[0].content} chunk`,
                            documentId: documents[0].id,
                            id: 'chunk-1',
                        },
                    ]
                },
            },
            chunkTransformers: [
                {
                    /**
                     * 执行第一个 chunk 转换。
                     */
                    async transform(chunks) {
                        events.push(`chunk-transformer-1:${chunks[0].content}`)

                        return chunks.map((chunk) => ({
                            ...chunk,
                            content: `${chunk.content} c`,
                        }))
                    },
                },
                {
                    /**
                     * 执行第二个 chunk 转换。
                     */
                    async transform(chunks) {
                        events.push(`chunk-transformer-2:${chunks[0].content}`)

                        return chunks.map((chunk) => ({
                            ...chunk,
                            content: `${chunk.content} d`,
                        }))
                    },
                },
            ],
            documentTransforms: [
                {
                    /**
                     * 执行第一个文档转换。
                     */
                    async transform(documents: Document[]) {
                        events.push(`document-transformer-1:${documents[0].content}`)

                        return documents.map((document) => ({
                            ...document,
                            content: `${document.content} a`,
                        }))
                    },
                },
                {
                    /**
                     * 执行第二个文档转换。
                     */
                    async transform(documents: Document[]) {
                        events.push(`document-transformer-2:${documents[0].content}`)

                        return documents.map((document) => ({
                            ...document,
                            content: `${document.content} b`,
                        }))
                    },
                },
            ],
            embedder: {
                /**
                 * 记录 embedder 输入并返回测试向量。
                 */
                async embed(chunks) {
                    events.push(`embedder:${chunks[0].content}`)

                    return [
                        {
                            chunk: chunks[0],
                            embedding: [0.1],
                        },
                    ]
                },
            },
            loader: {
                /**
                 * 记录 loader 输入并返回测试文档。
                 */
                async load(source) {
                    events.push(`loader:${source}`)

                    return [
                        {
                            content: 'document',
                            id: 'doc-1',
                        },
                    ]
                },
            },
            store: {
                /**
                 * 记录 upsert 输入。
                 */
                async upsert(embeddings) {
                    events.push(`upsert:${embeddings[0].chunk.content}`)
                },
                /**
                 * 默认追加模式不会删除旧文档。
                 */
                async deleteByDocumentIds() {
                    events.push('deleteByDocumentIds')
                },
                /**
                 * 测试场景不需要 filter 删除能力。
                 */
                async deleteByFilter() {},
            },
        }

        await executeIndexPipeline(pipeline, 'source')

        expect(events).toEqual([
            'loader:source',
            'document-transformer-1:document',
            'document-transformer-2:document a',
            'chunker:document a b',
            'chunk-transformer-1:document a b chunk',
            'chunk-transformer-2:document a b chunk c',
            'embedder:document a b chunk c d',
            'upsert:document a b chunk c d',
        ])
    })

    it('支持 loader 之后的 documentTransforms 流程', async () => {
        const pipeline: IndexPipeline<string> = {
            chunker: {
                /**
                 * 验证文档转换结果会传递给 chunker。
                 */
                async chunk(documents) {
                    expect(documents[0].content).toBe('line 1\nline 2')

                    return [
                        {
                            content: documents[0].content,
                            documentId: documents[0].id,
                            id: 'chunk-1',
                        },
                    ]
                },
            },
            documentTransforms: [
                {
                    /**
                     * 模拟 loader 后的文档标准化处理。
                     */
                    async transform(documents: Document[]) {
                        return documents.map((document) => ({
                            ...document,
                            content: 'line 1\nline 2',
                        }))
                    },
                },
            ],
            embedder: {
                /**
                 * 返回测试向量集合。
                 */
                async embed(chunks) {
                    return [
                        {
                            chunk: chunks[0],
                            embedding: [0.1],
                        },
                    ]
                },
            },
            loader: {
                /**
                 * 返回待标准化的原始文档。
                 */
                async load() {
                    return [
                        {
                            content: 'line 1\r\nline 2   ',
                            id: 'doc-1',
                        },
                    ]
                },
            },
            store: {
                /**
                 * 支持最小测试写入能力。
                 */
                async upsert() {},
                /**
                 * append 模式下不应触发删除。
                 */
                async deleteByDocumentIds() {
                    throw new Error('append mode should not delete documents')
                },
                /**
                 * 测试场景不需要 filter 删除能力。
                 */
                async deleteByFilter() {
                    throw new Error('Method not implemented.')
                },
            },
        }

        const result = await executeIndexPipeline(pipeline, 'source')

        expect(result.documents[0].content).toBe('line 1\nline 2')
        expect(result.chunks[0].content).toBe('line 1\nline 2')
    })

    it('允许 store 在 replaceDocument 模式下按 documentId 去重收集替换目标', async () => {
        const store = new ReplaceDocumentTestStore()
        const pipeline: IndexPipeline<string> = {
            chunker: {
                /**
                 * 返回属于两个文档的测试 chunk 集合。
                 */
                async chunk() {
                    return [
                        {
                            content: 'chunk 1',
                            documentId: 'doc-1',
                            id: 'chunk-1',
                        },
                        {
                            content: 'chunk 2',
                            documentId: 'doc-1',
                            id: 'chunk-2',
                        },
                        {
                            content: 'chunk 3',
                            documentId: 'doc-2',
                            id: 'chunk-3',
                        },
                    ]
                },
            },
            embedder: {
                /**
                 * 将 chunk 顺序映射为测试向量结果。
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
                 * 返回两个待替换文档。
                 */
                async load() {
                    return [
                        {
                            content: 'document 1',
                            id: 'doc-1',
                        },
                        {
                            content: 'document 2',
                            id: 'doc-2',
                        },
                    ]
                },
            },
            store,
        }

        const result = await executeIndexPipeline(pipeline, 'source', {
            writeContext: {
                mode: 'replaceDocument',
            },
        })

        expect(store.deletedDocumentIds).toEqual(['doc-1', 'doc-2'])
        expect(store.storedEmbeddings).toHaveLength(3)
        expect(result.result).toEqual({
            added: 3,
            deleted: 2,
            skipped: 0,
            updated: 0,
        })
    })
})
