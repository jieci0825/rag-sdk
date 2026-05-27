import { describe, expect, it } from 'vitest'

import { executeIndexPipeline } from '../src/pipeline'
import type { DocumentChunker } from '../src/chunkers'
import type { ChunkEmbedder } from '../src/embeddings'
import type { DocumentLoader } from '../src/loaders'
import type { DocumentPreprocessor } from '../src/preprocessors'
import type { IndexPipeline } from '../src/pipeline'
import type { IndexStore } from '../src/stores'

describe('indexing pipeline', () => {
    it('按顺序执行 loader、preprocessor、chunker、embedder 和 store', async () => {
        const calls: string[] = []

        const loader: DocumentLoader<string> = {
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
            async preprocess(documents) {
                calls.push('preprocessor')

                return documents.map((document) => ({
                    ...document,
                    content: `${document.content}-preprocessed`,
                }))
            },
        }

        const chunker: DocumentChunker = {
            async chunk(documents) {
                calls.push('chunker')

                return documents.map((document, index) => ({
                    content: document.content,
                    id: `${index + 1}`,
                }))
            },
        }

        const embedder: ChunkEmbedder = {
            async embed(chunks) {
                calls.push('embedder')

                return chunks.map((chunk) => ({
                    chunk,
                    embedding: [1, 2, 3],
                }))
            },
        }

        const store: IndexStore<{ count: number }> = {
            async store(embeddings) {
                calls.push('store')

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

        const result = await executeIndexPipeline(pipeline, 'source')

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
    })

    it('没有预处理器时也可以直接执行', async () => {
        const pipeline: IndexPipeline<string, void> = {
            chunker: {
                async chunk(documents) {
                    return documents.map((document) => ({
                        content: document.content,
                        id: '1',
                    }))
                },
            },
            embedder: {
                async embed(chunks) {
                    return chunks.map((chunk) => ({
                        chunk,
                        embedding: [1],
                    }))
                },
            },
            loader: {
                async load() {
                    return [
                        {
                            content: 'source',
                        },
                    ]
                },
            },
            store: {
                async store() {
                    return
                },
            },
        }

        const result = await executeIndexPipeline(pipeline, 'source')

        expect(result.documents).toHaveLength(1)
        expect(result.chunks).toHaveLength(1)
        expect(result.embeddings).toHaveLength(1)
    })
})
