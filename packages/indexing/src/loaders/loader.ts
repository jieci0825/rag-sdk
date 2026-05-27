import type { Document } from '@rag-sdk/core';

export interface DocumentLoader<TSource = unknown> {
    load(source: TSource): Promise<Document[]>;
}
