import type { RagDocument } from "@rag-sdk/core";

export interface Indexer {
  index(documents: RagDocument[]): Promise<void> | void;
}
