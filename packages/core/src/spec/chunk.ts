import { z } from 'zod'

import { jsonValueSchema } from './json'

export const chunkSchema = z
    .object({
        id: z.string().min(1),
        content: z.string().min(1),
        metadata: jsonValueSchema.optional(),
    })
    .strict()
