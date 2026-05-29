import { Document as LangChainDocument } from '@langchain/core/documents'
import { describe, expect, it } from 'vitest'

import { LangChainDocumentChunker } from '../src/langchain/chunkers'

import type { Document as CoreDocument } from '@rag-sdk/core'
import type { LangChainTextSplitter } from '../src/langchain/chunkers'

describe('LangChainDocumentChunker', () => {
    it('将 core 文档转换给 splitter，并把切分结果映射回 chunk', async () => {
        const receivedDocuments: LangChainDocument[] = []
        const splitter: LangChainTextSplitter = {
            async splitDocuments(documents) {
                receivedDocuments.push(...documents)

                return [
                    new LangChainDocument({
                        metadata: {
                            ...documents[0].metadata,
                            loc: {
                                lines: {
                                    from: 1,
                                    to: 2,
                                },
                            },
                        },
                        pageContent: `${documents[0].pageContent} chunk`,
                    }),
                    new LangChainDocument({
                        metadata: documents[0].metadata,
                        pageContent: '',
                    }),
                ]
            },
        }
        const chunker = new LangChainDocumentChunker(splitter)
        const documents: CoreDocument[] = [
            {
                content: 'hello world',
                id: 'doc-1',
                metadata: {
                    category: 'note',
                },
                source: 'notes/a.txt',
            },
        ]

        const chunks = await chunker.chunk(documents)

        expect(receivedDocuments).toHaveLength(1)
        expect(receivedDocuments[0].pageContent).toBe('hello world')
        expect(receivedDocuments[0].metadata).toEqual({
            category: 'note',
            documentId: 'doc-1',
            source: 'notes/a.txt',
        })
        expect(chunks).toEqual([
            {
                content: 'hello world chunk',
                id: 'doc-1:0',
                metadata: {
                    category: 'note',
                    chunkIndex: 0,
                    documentId: 'doc-1',
                    loc: {
                        lines: {
                            from: 1,
                            to: 2,
                        },
                    },
                    source: 'notes/a.txt',
                },
            },
        ])
    })

    it('没有 document id 时使用 source 生成稳定 chunk id', async () => {
        const splitter: LangChainTextSplitter = {
            async splitDocuments(documents) {
                return [
                    new LangChainDocument({
                        metadata: documents[0].metadata,
                        pageContent: documents[0].pageContent,
                    }),
                ]
            },
        }
        const chunker = new LangChainDocumentChunker(splitter)

        const chunks = await chunker.chunk([
            {
                content: 'from source',
                source: 'docs/source.txt',
            },
            {
                content: 'from index',
            },
        ])

        expect(chunks.map((chunk) => chunk.id)).toEqual(['docs/source.txt:0', '1:0'])
    })
})
