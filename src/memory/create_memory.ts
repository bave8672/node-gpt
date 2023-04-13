import { HNSWLibMemory } from "./hnswlib";
import { BaseMemory } from "./memory";
import { PineconeMemory } from "./pinecone";

enum MemoryImpl {
  Hnsw = "hnsw",
  Pinecone = "pinecone",
}

const MEMORY_IMPL = (process.env.MEMORY_IMPL as MemoryImpl) || MemoryImpl.Hnsw;
const K = Number(process.env.K || 5);

export function createMemory(id: string): BaseMemory {
  switch (MEMORY_IMPL) {
    case MemoryImpl.Hnsw:
      return new HNSWLibMemory({ name: id, k: K });
    case MemoryImpl.Pinecone:
      return new PineconeMemory({
        name: id,
        apiKey: process.env.PINECONE_API_KEY || "",
        environment: process.env.PINECONE_ENVIRONMENT || "",
        k: K,
      });
    default:
      throw new Error(
        `Invalid MEMORY_IMPL value: ${Object.values(MemoryImpl).join()}`
      );
  }
}
