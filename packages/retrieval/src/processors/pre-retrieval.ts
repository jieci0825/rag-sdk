import type { RetrievalQuery, RetrievalRequest } from '../queries'

/**
 * 检索前处理器。
 *
 * 在检索器执行之前对原始检索请求进行预处理，输出可直接执行的查询。
 *
 * 职责范围包括但不限于：
 * - 查询校验（参数完整性、合法性检查）
 * - 查询标准化（去除无效字符、统一大小写等）
 * - 查询改写（同义词扩展、query expansion 等）
 * - 查询向量生成（将文本转为 embedding）
 *
 * 多个前处理器按配置顺序串行执行，前一个的输出作为后一个的输入。
 *
 * @example
 * ```ts
 * const queryValidator: PreRetrievalProcessor = async (request) => {
 *     if (!request.text.trim()) {
 *         throw new Error('查询文本不能为空')
 *     }
 *     return { ...request }
 * }
 * ```
 */
export type PreRetrievalProcessor = (request: RetrievalRequest) => Promise<RetrievalQuery>
