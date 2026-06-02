interface OllamaEmbedResponse {
    embeddings?: number[][]
}

export interface OllamaEmbeddingsOptions {
    model: string
    baseUrl?: string
}

/**
 * 使用 Ollama 本地 /api/embed 接口为文本批量生成向量。
 */
export class OllamaEmbeddings {
    private readonly baseUrl: string

    private readonly model: string

    /**
     * 创建面向 LangChain EmbeddingsInterface 的 Ollama 适配对象。
     */
    constructor(options: OllamaEmbeddingsOptions) {
        this.baseUrl = options.baseUrl ?? 'http://localhost:11434'
        this.model = options.model
    }

    /**
     * 为一组文档文本生成向量，并校验 Ollama 返回数量与输入一致。
     */
    async embedDocuments(texts: string[]): Promise<number[][]> {
        const response = await fetch(`${this.baseUrl}/api/embed`, {
            body: JSON.stringify({
                input: texts,
                model: this.model,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })

        if (!response.ok) {
            throw new Error(`Ollama embed request failed: ${response.status} ${await response.text()}`)
        }

        const body = (await response.json()) as OllamaEmbedResponse

        if (!Array.isArray(body.embeddings)) {
            throw new Error('Ollama embed response does not include embeddings array.')
        }

        if (body.embeddings.length !== texts.length) {
            throw new Error(`Ollama returned ${body.embeddings.length} embeddings for ${texts.length} texts.`)
        }

        return body.embeddings
    }

    /**
     * 为单条查询文本生成向量，保持与 LangChain EmbeddingsInterface 兼容。
     */
    async embedQuery(text: string): Promise<number[]> {
        return (await this.embedDocuments([text]))[0]
    }
}
