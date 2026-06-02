import { z } from 'zod'

import { jsonValueSchema } from './json'

export const chunkSchema = z
    .object({
        id: z.string().min(1),
        documentId: z.string().min(1),
        content: z.string().min(1),
        contentHash: z.string().optional(),
        chunkIndex: z.number().int().nonnegative().optional(),
        metadata: z.record(z.string(), jsonValueSchema).optional(),
        sourceId: z.string().optional(),
    })
    .strict()
