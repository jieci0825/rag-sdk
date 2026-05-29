import { CharacterTextSplitter } from '@langchain/classic/text_splitter'

import { LangChainDocumentChunker } from './document-chunker'

/**
 * 创建按固定字符长度切分文档的 LangChain chunker。
 */
export function createFixedCharacterDocumentChunker(
    options: FixedCharacterDocumentChunkerOptions,
): LangChainDocumentChunker {
    return new LangChainDocumentChunker(
        new CharacterTextSplitter({
            chunkOverlap: options.chunkOverlap ?? 0,
            chunkSize: options.chunkSize,
            lengthFunction: options.lengthFunction,
            separator: '',
        }),
    )
}

export interface FixedCharacterDocumentChunkerOptions {
    chunkSize: number
    chunkOverlap?: number
    lengthFunction?: TextLengthFunction
}

/**
 * 计算文本长度，可用于覆盖 LangChain 默认的 chunk 大小判断。
 */
export type TextLengthFunction = ((text: string) => number) | ((text: string) => Promise<number>)
