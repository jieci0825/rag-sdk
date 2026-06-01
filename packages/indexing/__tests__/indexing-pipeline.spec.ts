import { describe, expect, it } from 'vitest'

import { executeIndexPipeline } from '../src/pipeline'
import type { DocumentChunker } from '../src/chunkers'
import type { ChunkEmbedder } from '../src/embeddings'
import type { DocumentLoader } from '../src/loaders'
import type { DocumentPreprocessor } from '../src/preprocessors'
import type { IndexPipeline, IndexStore, IndexStoreWriteContext } from '../src/pipeline'

describe('indexing pipeline', () => {
    it('按顺序执行 loader、preprocessor、chunker、embedder 和 store', async () => {
        const calls: string[] = []
        let storeContext: IndexStoreWriteContext | undefined

        const loader: DocumentLoader<string> = {
            /**
             * 记录 loader 调用并返回来源内容对应的测试文档。
             */
            async load(source) {
                calls.push(`loader:${source}`)

                return [
                    {
                        content: source,
                    },
                ]
            },
        }

        const preprocessor: DocumentPreprocessor = {
            /**
             * 记录 preprocessor 调用并为文档内容追加预处理标记。
             */
            async preprocess(documents) {
                calls.push('preprocessor')

                return documents.map((document) => ({
                    ...document,
                    content: `${document.content}-preprocessed`,
                }))
            },
        }

        const chunker: DocumentChunker = {
            /**
             * 记录 chunker 调用并按文档顺序生成测试 chunk。
             */
            async chunk(documents) {
                calls.push('chunker')

                return documents.map((document, index) => ({
                    content: document.content,
                    id: `${index + 1}`,
                }))
            },
        }

        const embedder: ChunkEmbedder = {
            /**
             * 记录 embedder 调用并为每个 chunk 生成固定测试向量。
             */
            async embed(chunks) {
                calls.push('embedder')

                return chunks.map((chunk) => ({
                    chunk,
                    embedding: [1, 2, 3],
                }))
            },
        }

        const store: IndexStore<{ count: number }> = {
            /**
             * 记录 store 调用并返回写入的 embedding 数量。
             */
            async store(embeddings, context) {
                calls.push('store')
                storeContext = context

                return {
                    count: embeddings.length,
                }
            },
        }

        const pipeline: IndexPipeline<string, { count: number }> = {
            chunker,
            embedder,
            loader,
            preprocessors: [preprocessor],
            store,
        }

        const result = await executeIndexPipeline(pipeline, 'source', {
            writeContext: {
                documentId: 'doc-1',
                fingerprint: 'hash-1',
                mode: 'replace',
                source: 'docs/a.md',
            },
        })

        expect(calls).toEqual(['loader:source', 'preprocessor', 'chunker', 'embedder', 'store'])
        expect(result.documents).toEqual([
            {
                content: 'source-preprocessed',
            },
        ])
        expect(result.chunks).toEqual([
            {
                content: 'source-preprocessed',
                id: '1',
            },
        ])
        expect(result.embeddings).toEqual([
            {
                chunk: {
                    content: 'source-preprocessed',
                    id: '1',
                },
                embedding: [1, 2, 3],
            },
        ])
        expect(result.result).toEqual({
            count: 1,
        })
        expect(storeContext).toEqual({
            chunkIds: ['1'],
            documentId: 'doc-1',
            fingerprint: 'hash-1',
            mode: 'replace',
            source: 'docs/a.md',
        })
    })

    it('没有预处理器时也可以直接执行', async () => {
        const pipeline: IndexPipeline<string, void> = {
            chunker: {
                /**
                 * 将测试文档直接映射为单个固定 id 的 chunk。
                 */
                async chunk(documents) {
                    return documents.map((document) => ({
                        content: document.content,
                        id: '1',
                    }))
                },
            },
            embedder: {
                /**
                 * 为每个测试 chunk 生成固定的一维向量。
                 */
                async embed(chunks) {
                    return chunks.map((chunk) => ({
                        chunk,
                        embedding: [1],
                    }))
                },
            },
            loader: {
                /**
                 * 返回无预处理器场景使用的固定测试文档。
                 */
                async load() {
                    return [
                        {
                            content: 'source',
                        },
                    ]
                },
            },
            store: {
                /**
                 * 模拟不返回业务结果的存储操作。
                 */
                async store() {
                    return
                },
            },
        }

        const result = await executeIndexPipeline(pipeline, 'source')

        expect(result.documents).toHaveLength(1)
        expect(result.chunks).toHaveLength(1)
        expect(result.embeddings).toHaveLength(1)
        expect(result.result).toBeUndefined()
    })
})
