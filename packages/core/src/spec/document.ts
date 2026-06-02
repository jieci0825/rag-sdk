import { z } from 'zod'

import { jsonValueSchema } from './json'

export const documentSchema = z
    .object({
        id: z.string().min(1),
        content: z.string(),
        contentHash: z.string().optional(),
        metadata: z.record(z.string(), jsonValueSchema).optional(),
        sourceId: z.string().optional(),
    })
    .strict()
