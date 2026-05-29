import { RecursiveCharacterTextSplitter } from '@langchain/classic/text_splitter'

import { LangChainDocumentChunker } from './document-chunker'

import type { TextLengthFunction } from './fixed-character-document-chunker'

const defaultRecursiveChunkSize = 200

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
 * 创建按递归分隔符切分文档的 LangChain chunker。
 */
export function createRecursiveDocumentChunker(options: RecursiveDocumentChunkerOptions): LangChainDocumentChunker {
    return new LangChainDocumentChunker(
        new RecursiveCharacterTextSplitter({
            chunkOverlap: options.chunkOverlap ?? 0,
            chunkSize: options.chunkSize ?? defaultRecursiveChunkSize,
            keepSeparator: options.keepSeparator ?? true,
            lengthFunction: options.lengthFunction,
            separators: options.separators ?? defaultRecursiveSeparators,
        }),
    )
}

/**
 * 递归分隔符文档切分器配置。
 */
export interface RecursiveDocumentChunkerOptions {
    /**
     * 每个文本块的目标长度
     */
    chunkSize?: number
    /**
     * 相邻文本块之间保留的重叠长度。
     */
    chunkOverlap?: number
    /**
     * 是否在切分结果中保留命中的分隔符。
     */
    keepSeparator?: boolean
    /**
     * 自定义文本长度计算函数。
     */
    lengthFunction?: TextLengthFunction
    /**
     * 递归切分时按优先级尝试的分隔符列表。
     */
    separators?: string[]
}
