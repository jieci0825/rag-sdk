import type { Document, Chunk } from '@rag-sdk/core';

export interface DocumentChunker {
    chunk(documents: Document[]): Promise<Chunk[]>;
}
