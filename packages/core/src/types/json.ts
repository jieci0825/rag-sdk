import type { z } from 'zod'
import type { jsonValueSchema } from '../spec'

export type JsonValue = z.infer<typeof jsonValueSchema>
