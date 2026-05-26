import type { RagDocument, RagStore } from '@rag-sdk/core'

export type { RagDocument, RagQuery, RagStore } from '@rag-sdk/core'

export class RagRuntime {
    constructor(private readonly store: RagStore) {}

    add(document: RagDocument) {
        return this.store.add(document)
    }

    query(text: string, limit = 5) {
        return this.store.query(text, limit)
    }
}
