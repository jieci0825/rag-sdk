import { executeIndexPipeline } from '@rag-sdk/indexing'
import {
    createRecursiveDocumentChunker,
    InMemoryVectorStore,
    LangChainChunkEmbedder,
    LangChainDocumentLoader,
} from '@rag-sdk/adapters'

import { OllamaEmbeddings } from './ollama-embeddings'

// 加载的文件
const sourceText = new URL('./fixtures/xiaomi-17-product.txt', import.meta.url).pathname
const sourceMd = new URL('./fixtures/xiaomi-17-specs.md', import.meta.url).pathname
const source = sourceMd

// 存储
const store = new InMemoryVectorStore()

// 向量化
const embeddings = new OllamaEmbeddings({
    baseUrl: process.env.OLLAMA_BASE_URL,
    model: process.env.OLLAMA_EMBEDDING_MODEL ?? 'qwen3-embedding:8b',
})

// 执行索引流水线
const result = await executeIndexPipeline(
    {
        chunker: createRecursiveDocumentChunker({
            chunkOverlap: 20,
            chunkSize: 120,
        }),
        embedder: new LangChainChunkEmbedder(embeddings),
        loader: new LangChainDocumentLoader(),
        store,
    },
    source,
    {
        writeContext: {
            mode: 'replaceDocument',
            runId: 'playground-index-vector-write',
        },
    },
)
const records = store.getRecords()

console.log(
    JSON.stringify(
        {
            chunks: result.chunks.length,
            documents: result.documents.length,
            firstRecord: records[0]
                ? {
                      chunkIndex: records[0].chunkIndex,
                      documentId: records[0].documentId,
                      id: records[0].id,
                      vectorPreview: records[0].embedding.slice(0, 8),
                      vectorDimension: records[0].embedding.length,
                  }
                : undefined,
            source,
            storeResult: result.result,
            storedRecords: records.length,
        },
        null,
        2,
    ),
)
