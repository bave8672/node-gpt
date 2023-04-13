import { BaseRetriever } from "langchain/schema";

export interface BaseMemory {
  add(text: string): Promise<void>;
  getRelevant(query: string): Promise<string>;
  asRetriever(): Promise<BaseRetriever>;
  clear(): Promise<void>;
}
