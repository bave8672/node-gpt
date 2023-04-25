import { HNSWLibMemory } from "./hnswlib";
import { BaseMemory } from "./memory";
import { PineconeMemory } from "./pinecone";

enum MemoryImpl {
  Hnsw = "hnsw",
  Pinecone = "pinecone",
}

const MEMORY_IMPL = (process.env.MEMORY_IMPL as MemoryImpl) || MemoryImpl.Hnsw;
const K = Number(process.env.MEMORY_K) || 5;
const apiKey = process.env.PINECONE_API_KEY || "";
const environment = process.env.PINECONE_ENVIRONMENT || "";

export function createMemory(id: string): BaseMemory {
  switch (MEMORY_IMPL) {
    case MemoryImpl.Hnsw:
      return new HNSWLibMemory({ name: id, k: K });
    case MemoryImpl.Pinecone:
      return new PineconeMemory({
        name: id,
        apiKey,
        environment,
        k: K,
      });
    default:
      throw new Error(
        `Invalid MEMORY_IMPL value: ${Object.values(MemoryImpl).join()}`
      );
  }
}
