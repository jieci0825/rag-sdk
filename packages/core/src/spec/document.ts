import { z } from 'zod';

import { jsonValueSchema } from './json';

export const documentSchema = z
    .object({
        id: z.string().min(1).optional(),
        content: z.string(),
        metadata: jsonValueSchema.optional(),
        source: z.string().optional(),
    })
    .strict();
