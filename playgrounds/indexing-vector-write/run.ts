import { executeIndexPipeline } from '@rag-sdk/indexing'
import {
    createRecursiveDocumentChunker,
    InMemoryVectorStore,
    LangChainChunkEmbedder,
    LangChainDocumentLoader,
} from '@rag-sdk/adapters'

/**
 * 根据文本内容生成固定维度的可复现测试向量。
 */
function toDeterministicVector(text: string): number[] {
    const buckets = Array.from({ length: 8 }, () => 0)

    for (let index = 0; index < text.length; index += 1) {
        buckets[index % buckets.length] += text.charCodeAt(index)
    }

    const norm = Math.max(1, Math.hypot(...buckets))

    return buckets.map((value) => Number((value / norm).toFixed(6)))
}

const deterministicEmbeddings = {
    /**
     * 为每个 chunk 内容生成固定维度向量，方便验证写入数量与向量结构。
     */
    async embedDocuments(texts: string[]): Promise<number[][]> {
        return texts.map(toDeterministicVector)
    },

    /**
     * 满足 LangChain embeddings 接口；当前写入验证不会调用查询向量。
     */
    async embedQuery(text: string): Promise<number[]> {
        return toDeterministicVector(text)
    },
}

const source = new URL('./fixtures/xiaomi-17-product.txt', import.meta.url).pathname
const store = new InMemoryVectorStore()
const result = await executeIndexPipeline(
    {
        chunker: createRecursiveDocumentChunker({
            chunkOverlap: 20,
            chunkSize: 120,
        }),
        embedder: new LangChainChunkEmbedder(deterministicEmbeddings),
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
                      vector: records[0].embedding,
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
