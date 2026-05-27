import type { z } from 'zod'
import type { chunkSchema } from '../spec'

export type Chunk = z.infer<typeof chunkSchema>
