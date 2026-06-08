# Indexing 设计

## 文档定位

本文档用于描述 `@rag-sdk/indexing` 的子包设计。

当前只定义该子包在目标架构中的职责边界，具体接口和实现设计后续在本文档内继续补充。

## 职责

`indexing` 负责定义索引链路中的阶段协议与流程编排。

它描述文档加载、转换、切分、元数据提取、向量化、索引结果输出等阶段如何协作。

## 不负责

`indexing` 不实现具体 loader、chunker、embedder、metadata extractor。

`indexing` 不负责具体向量存储能力适配。

`indexing` 不负责数据库写入、删除、迁移、运维或性能调优。

`indexing` 不决定业务侧的数据生命周期。
