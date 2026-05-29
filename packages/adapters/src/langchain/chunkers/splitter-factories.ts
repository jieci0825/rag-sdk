import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from '@langchain/classic/text_splitter'

import { LangChainDocumentChunker } from './document-chunker'

const defaultRecursiveSeparators = [
    '\n# ',
    '\n## ',
    '\n### ',
    '\n#### ',
    '\n##### ',
    '\n###### ',
    '\n\n',
    '\n',
    '。 ',
    '。',
    '！',
    '？',
    '. ',
    '! ',
    '? ',
    '；',
    '; ',
    '，',
    ', ',
    ' ',
    '',
]

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

/**
 * 创建按递归分隔符切分文档的 LangChain chunker。
 */
export function createRecursiveDocumentChunker(options: RecursiveDocumentChunkerOptions): LangChainDocumentChunker {
    return new LangChainDocumentChunker(
        new RecursiveCharacterTextSplitter({
            chunkOverlap: options.chunkOverlap ?? 0,
            chunkSize: options.chunkSize,
            keepSeparator: options.keepSeparator ?? true,
            lengthFunction: options.lengthFunction,
            separators: options.separators ?? defaultRecursiveSeparators,
        }),
    )
}

export interface FixedCharacterDocumentChunkerOptions {
    chunkSize: number
    chunkOverlap?: number
    lengthFunction?: TextLengthFunction
}

export interface RecursiveDocumentChunkerOptions {
    chunkSize: number
    chunkOverlap?: number
    keepSeparator?: boolean
    lengthFunction?: TextLengthFunction
    separators?: string[]
}

/**
 * 计算文本长度，可用于覆盖 LangChain 默认的 chunk 大小判断。
 */
export type TextLengthFunction = ((text: string) => number) | ((text: string) => Promise<number>)
