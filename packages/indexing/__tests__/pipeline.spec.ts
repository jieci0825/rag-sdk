import { describe, expect, it } from 'vitest'

import { executeIndexPipeline } from '../src'

import type { Chunk, Document } from '@rag-sdk/core'
import type { ChunkEmbedding, IndexPipeline } from '../src'

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
                id: 'chunk-1',
            },
        ]
        const embeddings: ChunkEmbedding[] = [
            {
                chunk: chunks[0],
                embedding: [0.1],
            },
        ]
        const pipeline: IndexPipeline<string, string> = {
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
                 * 返回测试存储结果。
                 */
                async store(inputEmbeddings, context) {
                    expect(inputEmbeddings).toBe(embeddings)
                    expect(context?.chunkIds).toEqual(['chunk-1'])

                    return 'stored'
                },
            },
        }

        const result = await executeIndexPipeline(pipeline, 'source')

        expect(result).toEqual({
            chunks,
            documents,
            embeddings,
            result: 'stored',
        })
    })

    it('按声明顺序执行 document 和 chunk transformer', async () => {
        const events: string[] = []
        const pipeline: IndexPipeline<string, string> = {
            chunker: {
                /**
                 * 记录 chunker 输入并生成测试 chunk。
                 */
                async chunk(documents) {
                    events.push(`chunker:${documents[0].content}`)

                    return [
                        {
                            content: `${documents[0].content} chunk`,
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
            documentTransformers: [
                {
                    /**
                     * 执行第一个文档转换。
                     */
                    async transform(documents) {
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
                    async transform(documents) {
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
                 * 记录 store 输入并返回测试结果。
                 */
                async store(embeddings) {
                    events.push(`store:${embeddings[0].chunk.content}`)

                    return 'stored'
                },
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
            'store:document a b chunk c d',
        ])
    })
})
