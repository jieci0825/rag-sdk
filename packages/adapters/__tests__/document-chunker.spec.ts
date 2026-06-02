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
                sourceId: 'notes/a.txt',
            },
        ]

        const chunks = await chunker.chunk(documents)

        expect(receivedDocuments).toHaveLength(1)
        expect(receivedDocuments[0].pageContent).toBe('hello world')
        expect(receivedDocuments[0].metadata).toEqual({
            category: 'note',
            documentId: 'doc-1',
            sourceId: 'notes/a.txt',
        })
        expect(chunks).toEqual([
            {
                chunkIndex: 0,
                content: 'hello world chunk',
                documentId: 'doc-1',
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
                    sourceId: 'notes/a.txt',
                },
                sourceId: 'notes/a.txt',
            },
        ])
    })

    it('为每个 chunk 写入稳定 id，并透传 documentId/sourceId/chunkIndex', async () => {
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
                id: 'doc-1',
                sourceId: 'docs/source.txt',
            },
            {
                content: 'from index',
                id: 'doc-2',
            },
        ])

        expect(chunks).toEqual([
            {
                chunkIndex: 0,
                content: 'from source',
                documentId: 'doc-1',
                id: 'doc-1:0',
                metadata: {
                    documentId: 'doc-1',
                    sourceId: 'docs/source.txt',
                    chunkIndex: 0,
                },
                sourceId: 'docs/source.txt',
            },
            {
                chunkIndex: 0,
                content: 'from index',
                documentId: 'doc-2',
                id: 'doc-2:0',
                metadata: {
                    documentId: 'doc-2',
                    chunkIndex: 0,
                },
            },
        ])
    })
})
