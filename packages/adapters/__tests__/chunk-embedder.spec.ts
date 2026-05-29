import { describe, expect, it } from 'vitest'

import { LangChainChunkEmbedder } from '../src/langchain/embeddings'

import type { EmbeddingsInterface } from '@langchain/core/embeddings'
import type { Chunk } from '@rag-sdk/core'

describe('LangChainChunkEmbedder', () => {
    it('将 chunk 内容传给 embeddings，并按原顺序映射向量结果', async () => {
        const receivedDocuments: string[][] = []
        const embeddings: EmbeddingsInterface = {
            /**
             * 记录批量向量化输入，并返回测试向量。
             */
            async embedDocuments(documents) {
                receivedDocuments.push(documents)

                return [
                    [0.1, 0.2],
                    [0.3, 0.4],
                ]
            },
            /**
             * 满足 LangChain Embeddings 接口，当前适配器不会调用该方法。
             */
            async embedQuery() {
                return [0]
            },
        }
        const embedder = new LangChainChunkEmbedder(embeddings)
        const chunks: Chunk[] = [
            {
                content: 'first chunk',
                id: 'chunk-1',
                metadata: {
                    chunkIndex: 0,
                },
            },
            {
                content: 'second chunk',
                id: 'chunk-2',
                metadata: {
                    chunkIndex: 1,
                },
            },
        ]

        const result = await embedder.embed(chunks)

        expect(receivedDocuments).toEqual([['first chunk', 'second chunk']])
        expect(result).toEqual([
            {
                chunk: chunks[0],
                embedding: [0.1, 0.2],
            },
            {
                chunk: chunks[1],
                embedding: [0.3, 0.4],
            },
        ])
        expect(result[0].chunk).toBe(chunks[0])
        expect(result[1].chunk).toBe(chunks[1])
    })
})
