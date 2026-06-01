# Indexing Interface Roadmap

## 前置约束

- `packages/indexing` 只负责接口定义。
- 除 pipeline 编排函数外，`packages/indexing` 不实现具体 indexing 能力。
- loader、converter、transformer、fingerprinter、metadata extractor、embedder、store、record manager 等具体能力都由 adapter 实现。
- 每完成一个阶段后暂停，告知完成情况，并等待下一步指令后再继续。

## 执行 Todo

- [x] PR 1: Transformer 阶段
  - 新增 `DocumentTransformer` / `ChunkTransformer` 协议。
  - `IndexPipeline` 支持可选 `documentTransformers` / `chunkTransformers`。
  - `executeIndexPipeline` 按声明顺序串行执行 transformer。
  - 验证标准: 不传 transformer 时保持原流程；多个 transformer 时按声明顺序执行。

- [ ] PR 2: Fingerprinter + MetadataExtractor
  - 新增 `DocumentFingerprinter` / `ChunkFingerprinter` 协议。
  - 新增 `DocumentMetadataExtractor` / `ChunkMetadataExtractor` 协议。
  - 明确 fingerprint context 与 metadata 合并规则。
  - 验证标准: fingerprint 与 metadata 提取均为可选协议，不影响已有基础流程。

- [ ] PR 3: IndexRecordManager 最小协议
  - 新增 `IndexRecordManager` 协议。
  - 表达已索引记录、`sourceId`、`documentId`、`fingerprint`、`chunkIds`、更新时间等状态。
  - 为后续 skip、update、delete、cleanup 提供状态基础。
  - 验证标准: 协议能支持判断未变化文档是否可跳过，但不内置具体存储实现。

- [ ] PR 4: IndexRecordBuilder + Store 边界整理
  - 新增 `IndexRecordBuilder` 协议。
  - 将 `chunk + embedding + metadata + context` 映射为可写入的 index record。
  - 整理 `IndexStore` 与 `VectorStore` 的职责边界。
  - 验证标准: embedder 只负责生成 embedding；store 只负责写入 record；映射逻辑由 builder adapter 承担。

- [ ] PR 5: CleanupPolicy
  - 新增 `CleanupPolicy` 协议。
  - 定义 `none` / `incremental` / `full` 清理语义。
  - 具体删除逻辑仍由 adapter、record manager、store 配合实现。
  - 验证标准: pipeline 可以根据 policy 表达清理决策，但不绑定具体数据库行为。

- [ ] PR 6: IndexingRunReport
  - 新增 `IndexingRunReport` 结构。
  - 记录 loaded、transformed、chunked、embedded、stored、skipped、deleted、failed、duration 等运行统计。
  - 验证标准: pipeline 返回结果能携带可审计的运行信息，不要求接入日志或监控系统。

- [ ] PR 7: Embedding 扩展协议
  - 扩展 embedding 协议，支持 dense、sparse、multi-vector 与模型信息。
  - 保持 dense embedding 为最简单路径。
  - 验证标准: 现有 dense 流程不受影响；adapter 可选择实现 sparse 或 multi-vector。

- [ ] PR 8: IndexManifest / Versioning
  - 新增 `IndexManifest` / versioning 协议。
  - 记录 schema version、chunking strategy version、embedding model、adapter name、createdAt、source namespace 等信息。
  - 验证标准: record manager 与 pipeline context 可以引用 manifest，但不强制具体存储位置。
