import type { Chunk, Document } from '@rag-sdk/core'

import type { DocumentChunker } from '../chunkers'
import type { ChunkEmbedding, ChunkEmbedder } from '../embeddings'
import type { DocumentLoader } from '../loaders'
import type { ChunkTransformer, DocumentTransformer } from '../transformers'

export type IndexingMode = 'append' | 'replace'

export interface IndexStoreWriteContext {
    mode?: IndexingMode
    documentId?: string
    source?: string
    fingerprint?: string
    chunkIds?: string[]
}

export interface IndexPipelineOptions {
    writeContext?: Omit<IndexStoreWriteContext, 'chunkIds'>
}

export interface IndexStore<TResult = void> {
    /**
     * 持久化 chunk embedding，并返回存储层结果。
     */
    store(embeddings: ChunkEmbedding[], context?: IndexStoreWriteContext): Promise<TResult>
}

export interface IndexPipeline<TSource = unknown, TStoreResult = void> {
    loader: DocumentLoader<TSource>
    documentTransformers?: DocumentTransformer[]
    chunker: DocumentChunker
    chunkTransformers?: ChunkTransformer[]
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
 * 按 loader、document transformers、chunker、chunk transformers、embedder、store 的顺序执行索引流水线。
 *
 * 每一步都会消费上一步的结果；transformer 按声明顺序串行执行，最终返回中间产物和存储结果，
 * 方便调用方记录、调试或继续使用流水线输出。
 */
export async function executeIndexPipeline<TSource, TStoreResult>(
    pipeline: IndexPipeline<TSource, TStoreResult>,
    source: TSource,
    options?: IndexPipelineOptions,
): Promise<IndexPipelineResult<TStoreResult>> {
    // 获取通过 loader 加载的原始文档集合。
    let documents = await pipeline.loader.load(source)

    for (const transformer of pipeline.documentTransformers ?? []) {
        documents = await transformer.transform(documents)
    }

    let chunks = await pipeline.chunker.chunk(documents)

    for (const transformer of pipeline.chunkTransformers ?? []) {
        chunks = await transformer.transform(chunks)
    }

    const embeddings = await pipeline.embedder.embed(chunks)
    const result = await pipeline.store.store(embeddings, {
        ...options?.writeContext,
        chunkIds: chunks.map((chunk) => chunk.id),
    })

    return {
        chunks,
        documents,
        embeddings,
        result,
    }
}
