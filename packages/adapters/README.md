定位：把外部能力转换为当前 SDK 可以统一消费的角色。

- 提供 LangChain 的 loader / chunker / embedder 适配
- 提供 `InMemoryVectorStore`，用于验证 `VectorStore` 写入与 `contentHash` 增量链路
