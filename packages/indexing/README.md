定位：定义 RAG 索引流程的阶段协议和流程编排契约。

## 职责

- 定义文档加载、预处理、切分、向量化、存储和元数据传递的最小接口
- 定义这些阶段之间的数据形状
- 定义完整 indexing 流程的组合契约

## 流程

1. `loader` 读取外部源，产出 `Document[]`
2. `preprocessor` 对文档做最小规范化处理
3. `chunker` 将文档切分为 `Chunk[]`
4. `embedder` 将 `Chunk[]` 转换为向量结果
5. `store` 写入索引结果并返回写入结果
6. `pipeline` 只负责按契约组合并执行上述阶段

## 不负责

- 不提供任何默认实现
- 不内置切分算法、向量化模型或存储策略
- 不承担具体索引执行逻辑

## 对外导出

- `DocumentLoader`
- `DocumentPreprocessor`
- `DocumentChunker`
- `ChunkEmbedder`
- `ChunkEmbedding`
- `IndexStore`
- `IndexMetadata`
- `IndexPipeline`
- `executeIndexPipeline`
