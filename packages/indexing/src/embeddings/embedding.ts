import type { Chunk } from '@rag-sdk/core';

export interface ChunkEmbedding {
    chunk: Chunk;
    embedding: number[];
}

export interface ChunkEmbedder {
    embed(chunks: Chunk[]): Promise<ChunkEmbedding[]>;
}
