import type { Chunk, Document } from '@rag-sdk/core'

import type { DocumentChunker } from '../chunkers'
import type { ChunkEmbedding, ChunkEmbedder } from '../embeddings'
import type { DocumentLoader } from '../loaders'
import type { DocumentPreprocessor } from '../preprocessors'
import type { IndexStore } from '../stores'

export interface IndexPipeline<TSource = unknown, TStoreResult = void> {
    loader: DocumentLoader<TSource>
    preprocessors?: DocumentPreprocessor[]
    chunker: DocumentChunker
    embedder: ChunkEmbedder
    store: IndexStore<TStoreResult>
}

export interface IndexPipelineResult<TStoreResult = void> {
    documents: Document[]
    chunks: Chunk[]
    embeddings: ChunkEmbedding[]
    result: TStoreResult
}

/**
 * 按 loader、preprocessor、chunker、embedder、store 的顺序执行索引流水线。
 *
 * 每一步都会消费上一步的结果；预处理器按声明顺序串行执行，最终返回中间产物和存储结果，
 * 方便调用方记录、调试或继续使用流水线输出。
 */
export async function executeIndexPipeline<TSource, TStoreResult>(
    pipeline: IndexPipeline<TSource, TStoreResult>,
    source: TSource,
): Promise<IndexPipelineResult<TStoreResult>> {
    let documents = await pipeline.loader.load(source)

    for (const preprocessor of pipeline.preprocessors ?? []) {
        documents = await preprocessor.preprocess(documents)
    }

    const chunks = await pipeline.chunker.chunk(documents)
    const embeddings = await pipeline.embedder.embed(chunks)
    const result = await pipeline.store.store(embeddings)

    return {
        chunks,
        documents,
        embeddings,
        result,
    }
}
