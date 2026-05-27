import type { z } from 'zod';
import type { documentSchema } from '../spec';

export type Document = z.infer<typeof documentSchema>;
