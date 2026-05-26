import type { RagDocument } from "@rag-sdk/core";

export interface EvalCase {
  id: string;
  query: string;
  expectedDocuments?: RagDocument[];
}

export interface Evaluator {
  evaluate(testCase: EvalCase): Promise<number> | number;
}
