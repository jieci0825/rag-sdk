import { Document as LangChainDocument } from '@langchain/core/documents'
import { describe, expect, it } from 'vitest'

import { toDocument } from '../src/langchain/loaders/document-mapper'

describe('toDocument', () => {
    it('保留现有 document id，并将 source 元数据迁移为 sourceId', () => {
        expect(
            toDocument(
                new LangChainDocument({
                    id: 'doc-1',
                    metadata: {
                        category: 'note',
                        source: 'docs/a.txt',
                    },
                    pageContent: 'hello world',
                }),
                0,
            ),
        ).toEqual({
            content: 'hello world',
            id: 'doc-1',
            metadata: {
                category: 'note',
                source: 'docs/a.txt',
            },
            sourceId: 'docs/a.txt',
        })
    })

    it('缺少 document id 时生成稳定兜底 id', () => {
        expect(
            toDocument(
                new LangChainDocument({
                    metadata: {
                        sourceId: 'docs/a.txt',
                    },
                    pageContent: 'hello world',
                }),
                2,
            ),
        ).toEqual({
            content: 'hello world',
            id: 'docs/a.txt:2',
            metadata: {
                sourceId: 'docs/a.txt',
            },
            sourceId: 'docs/a.txt',
        })
    })
})
