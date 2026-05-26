export type RagDocument = {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
};

export type RagQuery = {
  text: string;
  limit?: number;
};

export interface RagStore {
  add(document: RagDocument): Promise<void> | void;
  query(text: string, limit?: number): Promise<RagDocument[]> | RagDocument[];
}
