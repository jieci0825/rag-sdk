import type { Chunk } from '@rag-sdk/core'

import type { RetrievalQuery } from '../queries'

/**
 * 检索器返回的单条候选结果。
 *
 * 该结构组合了原始 chunk 与检索器给出的相关性评分，retrieval 只负责透传，
 * 不对 score 的来源、范围或语义做额外解释。
 */
export interface Candidate {
    /**
     * 召回的原始文档片段。
     */
    chunk: Chunk

    /**
     * 检索器给出的相关性评分。
     *
     * 不同检索器的评分尺度可能不同，后处理器（如分数阈值过滤）使用该值时
     * 需要考虑来源检索器的差异。
     */
    score: number

    /**
     * 召回该候选的检索器标识。
     *
     * 用于调试、可观测性，也可配合后处理器实现按来源加权融合。
     * 非必填，检索器实现可按需提供。
     */
    retrieverId?: string
}

/**
 * 检索流水线处理完成后的最终输出。
 *
 * 带回查询上下文，方便上游追溯本次检索使用了什么查询条件与参数。
 */
export interface RetrievalResult {
    /**
     * 经过后处理阶段整理后的候选结果集。
     */
    candidates: Candidate[]

    /**
     * 本次检索使用的可执行查询。
     */
    query: RetrievalQuery
}
