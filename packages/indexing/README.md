定位：定义 RAG 索引流程的阶段协议、向量写入契约与增量索引辅助能力。

- 文档与 chunk 身份字段统一使用 `id`、`documentId`、`sourceId`、`chunkIndex`、`contentHash`
- 向量写入通过 `VectorRecord` 和 `VectorStore` 统一适配
- `replaceDocument` 表示按当前批次的 `documentId` 先删后写
- `createDocumentHashIndexingPlan()` 用于在执行流水线前做 document 级增量判断
