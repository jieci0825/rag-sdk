# Adapters 设计

## 文档定位

本文档用于描述 `@rag-sdk/adapters` 的子包设计。

当前只定义该子包在目标架构中的职责边界，具体接口和实现设计后续在本文档内继续补充。

## 职责

`adapters` 负责把外部生态能力转换为 SDK 可以消费的协议实现。

适配对象可以包括文档加载、文档切分、Embedding、Rerank 等外部能力。

## 不负责

`adapters` 不负责定义 SDK 核心协议。

`adapters` 不负责承载业务逻辑。

`adapters` 不负责具体向量存储能力适配。

`adapters` 不应该把第三方框架类型泄漏到 `core`、`indexing`、`retrieval` 的公共协议中。
