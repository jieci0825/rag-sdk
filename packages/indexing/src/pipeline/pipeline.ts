import type { Chunk, Document } from '@rag-sdk/core';

import type { DocumentChunker } from '../chunkers';
import type { ChunkEmbedding, ChunkEmbedder } from '../embeddings';
import type { DocumentLoader } from '../loaders';
import type { DocumentPreprocessor } from '../preprocessors';
import type { IndexStore } from '../stores';

export interface IndexPipeline<TSource = unknown, TStoreResult = void> {
    loader: DocumentLoader<TSource>;
    preprocessors?: DocumentPreprocessor[];
    chunker: DocumentChunker;
    embedder: ChunkEmbedder;
    store: IndexStore<TStoreResult>;
}

export interface IndexPipelineResult<TStoreResult = void> {
    documents: Document[];
    chunks: Chunk[];
    embeddings: ChunkEmbedding[];
    result: TStoreResult;
}

export async function executeIndexPipeline<TSource, TStoreResult>(
    pipeline: IndexPipeline<TSource, TStoreResult>,
    source: TSource,
): Promise<IndexPipelineResult<TStoreResult>> {
    let documents = await pipeline.loader.load(source);

    for (const preprocessor of pipeline.preprocessors ?? []) {
        documents = await preprocessor.preprocess(documents);
    }

    const chunks = await pipeline.chunker.chunk(documents);
    const embeddings = await pipeline.embedder.embed(chunks);
    const result = await pipeline.store.store(embeddings);

    return {
        chunks,
        documents,
        embeddings,
        result,
    };
}
