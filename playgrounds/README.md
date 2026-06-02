定位：存放不参与发布的手动验证场景，用于确认各子包在源码级组合后能否跑通关键链路。

- `indexing-vector-write`：加载本地 txt 文件、切分 chunk、生成测试向量并写入内存向量库

## indexing-vector-write

默认通过本地 Ollama `/api/embed` 生成真实向量，模型名可用环境变量覆盖：

```bash
node --no-warnings --experimental-strip-types --experimental-transform-types --loader ./scripts/source-loader.mjs ./indexing-vector-write/run.ts
```

如果 Ollama 返回 `this model does not support embeddings`，说明该模型虽然可以被 Ollama 加载，但当前没有暴露 embedding 能力，需要换成支持 `/api/embed` 的模型或重新导入带 embedding capability 的模型。
