import type { Chunk, Document } from '@rag-sdk/core'

import { writeVectorStore } from '../vector-stores'
import type { DocumentChunker } from '../chunkers'
import type { ChunkEmbedding, ChunkEmbedder } from '../embeddings'
import type { DocumentLoader } from '../loaders'
import type { ChunkTransformer, DocumentTransform } from '../transformers'
import type { VectorStore } from '../vector-stores'

export type IndexingMode = 'append' | 'replaceDocument'

export interface IndexStoreWriteContext {
    /**
     * 控制当前批次的写入策略。
     */
    mode?: IndexingMode

    /**
     * 标识当前索引任务，便于存储层记录一次完整写入。
     */
    runId?: string

    /**
     * 记录本次由外部增量决策提前跳过的文档数量。
     */
    skippedCount?: number
}

export interface IndexPipelineOptions {
    writeContext?: IndexStoreWriteContext
}

export interface IndexStoreResult {
    added: number
    updated: number
    deleted: number
    skipped: number
}

export type IndexStore = VectorStore

export interface IndexPipeline<TSource = unknown> {
    loader: DocumentLoader<TSource>
    documentTransforms?: DocumentTransform[]
    chunker: DocumentChunker
    chunkTransformers?: ChunkTransformer[]
    embedder: ChunkEmbedder
    store: IndexStore
}

export interface IndexPipelineResult {
    documents: Document[]
    chunks: Chunk[]
    embeddings: ChunkEmbedding[]
    result: IndexStoreResult
}

/**
 * 按 loader、document transforms、chunker、chunk transformers、embedder、store 的顺序执行索引流水线。
 *
 * 每一步都会消费上一步的结果；transformer 按声明顺序串行执行，最终返回中间产物和存储结果，
 * 方便调用方记录、调试或继续使用流水线输出。
 */
export async function executeIndexPipeline<TSource>(
    pipeline: IndexPipeline<TSource>,
    source: TSource,
    options?: IndexPipelineOptions,
): Promise<IndexPipelineResult> {
    // 获取通过 loader 加载的原始文档集合。
    let documents = await pipeline.loader.load(source)

    for (const transform of pipeline.documentTransforms ?? []) {
        documents = await transform.transform(documents)
    }

    let chunks = await pipeline.chunker.chunk(documents)

    for (const transformer of pipeline.chunkTransformers ?? []) {
        chunks = await transformer.transform(chunks)
    }

    const embeddings = await pipeline.embedder.embed(chunks)
    const result = await writeVectorStore(pipeline.store, embeddings, options?.writeContext)

    return {
        chunks,
        documents,
        embeddings,
        result,
    }
}
