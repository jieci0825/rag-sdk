import { describe, expect, it } from 'vitest'

import { chunkSchema, documentSchema } from '../src'

describe('core schema', () => {
    it('要求 document 必须包含 id，且 metadata 必须是对象', () => {
        expect(() =>
            documentSchema.parse({
                content: 'document',
            }),
        ).toThrow()

        expect(() =>
            documentSchema.parse({
                content: 'document',
                id: 'doc-1',
                metadata: 'invalid',
            }),
        ).toThrow()

        expect(
            documentSchema.parse({
                content: 'document',
                id: 'doc-1',
                metadata: {
                    category: 'note',
                },
                sourceId: 'docs/a.txt',
            }),
        ).toEqual({
            content: 'document',
            id: 'doc-1',
            metadata: {
                category: 'note',
            },
            sourceId: 'docs/a.txt',
        })
    })

    it('要求 chunk 必须包含 documentId，且 metadata 必须是对象', () => {
        expect(() =>
            chunkSchema.parse({
                content: 'chunk',
                id: 'chunk-1',
            }),
        ).toThrow()

        expect(() =>
            chunkSchema.parse({
                content: 'chunk',
                documentId: 'doc-1',
                id: 'chunk-1',
                metadata: ['invalid'],
            }),
        ).toThrow()

        expect(
            chunkSchema.parse({
                chunkIndex: 0,
                content: 'chunk',
                documentId: 'doc-1',
                id: 'chunk-1',
                metadata: {
                    category: 'note',
                },
                sourceId: 'docs/a.txt',
            }),
        ).toEqual({
            chunkIndex: 0,
            content: 'chunk',
            documentId: 'doc-1',
            id: 'chunk-1',
            metadata: {
                category: 'note',
            },
            sourceId: 'docs/a.txt',
        })
    })
})
