# Retrieval 子包实现计划

> 最后更新：2026-06-08

## 总体架构

```
RetrievalRequest (原始查询)
  → [检索前处理器] 串行
  → RetrievalQuery (可执行查询)
  → [检索器] 并行 (fail-fast)
  → Candidate[] (候选结果)
  → [检索后处理器] 串行
  → RetrievalResult (最终结果)
```

- 涉及第三方/外部服务的实现（如 embedding 生成、向量检索、关键词检索）只在 retrieval 中定义协议，不在 retrieval 中实现
- 无外部依赖、无业务语义的通用处理（如 Top K、去重、分数过滤）可以内置提供默认实现
- 复用 core 包的 `Chunk` 等核心类型，不自行定义

## 实现步骤

### 3. 定义原始检索请求与可执行查询结构 ✅

- `RetrievalRequest`：业务调用方提交的原始检索请求（text, filter, params, topK）
- `RetrievalQuery extends RetrievalRequest`：检索前整理后可执行的查询，补充 `embedding?: number[]`
- `embedding` 与 `text` 保持一致：两者都是预处理之后的最终版本
- 文件：`packages/retrieval/src/queries/query.ts`

### 4. 定义候选结果与最终检索结果结构 ✅

- `Candidate = { chunk: Chunk, score: number }`
  - 采用组合方式，不继承 Chunk
  - score 由检索器返回，retrieval 只透传
  - 与 `indexing` 中 `ChunkEmbedding = { chunk: Chunk, embedding: number[] }` 模式一致
- `RetrievalResult = { candidates: Candidate[], query: RetrievalQuery }`
  - 带回查询上下文，方便上游追溯
- 文件：`packages/retrieval/src/results/result.ts`

### 5. 定义检索前处理器协议

- 协议签名：`(request: RetrievalRequest) => Promise<RetrievalQuery>`
- 负责：查询校验、标准化、改写、embedding 生成
- embedding 生成协议只定义，不在此包实现（由 adapters 子包实现）

### 6. 定义检索器协议

- 协议签名：`(query: RetrievalQuery) => Promise<Candidate[]>`
- 负责：根据可执行查询从外部召回候选结果
- 具体向量检索、文本检索等不在此包实现

### 7. 定义检索后处理器协议

- 协议签名：`(candidates: Candidate[]) => Promise<Candidate[]>`
- 负责：融合、去重、过滤、重排、截断

### 8. 定义 rerank 协议，不提供具体实现

- 只定义接口签名，不提供具体 rerank 模型实现
- 属于检索后处理的一种，但语义独立

### 9. 实现最小单检索器流水线

- 1 前处理器 + 1 检索器 + N 后处理器（可为空）的串联
- 最小跑通：RetrievalRequest → RetrievalQuery → Candidate[] → RetrievalResult

### 10. 支持多个检索前处理器串行执行

- 按配置顺序依次执行，前一个输出是后一个输入
- 示例链：`[queryValidator, queryNormalizer, queryEmbedder]`

### 11. 支持多个检索器并行执行，任一失败则整体失败

- 多个检索器 `Promise.all`（或等价的 fail-fast 行为）
- 合并策略：所有结果 `flat()` 拼接后交给后处理器处理
- 去重/融合由后处理器负责，检索器不关心其他检索器的输出

### 12. 支持多个检索后处理器串行执行

- 按配置顺序依次执行
- 示例链：`[dedup, scoreFilter, topK]`

### 13. 实现分数阈值过滤处理器

- 内置实现：`score >= threshold` 保留，否则丢弃
- threshold 由调用方配置

### 14. 实现按 `chunk.id` 保留首次结果的去重处理器

- 按 `candidate.chunk.id` 去重，保留首次出现的候选
- 配合并行检索器的拼接顺序，可控制「优先保留哪个检索器的结果」

### 15. 实现 Top K 截取处理器

- 内置实现：按 score 降序排序后取前 K 条
- K 由调用方配置，或回退到 `RetrievalQuery.topK`

### 16. 整理公共桶导出，执行 retrieval 全量测试与构建

- 统一 `packages/retrieval/src/index.ts` 导出所有公共类型与处理器
- 运行全量测试，确保构建通过

---

## 关键决策记录

| 决策 | 方案 | 原因 |
|------|------|------|
| Candidate 与 Chunk 的关系 | 组合（`{ chunk, score }`） | 与 ChunkEmbedding 模式一致，语义清晰 |
| 并行检索器合并策略 | flat 拼接 + 后处理器清理 | 检索器职责单一，去重/融合归后处理 |
| embedding 归属 | 前处理器链的一环 | RetrieverQuery.text 与 embedding 始终保持一致 |
| 第三方实现归属 | 协议在本包，实现在 adapters | 遵循 retrieval 不实现外部依赖的原则 |
