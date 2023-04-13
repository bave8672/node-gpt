import { DynamicTool } from "langchain/tools";
import { BaseMemory } from "./memory";

export class MemoryTool extends DynamicTool {
  constructor(private readonly memory: BaseMemory) {
    super({
      name: "Long term memory",
      description:
        "Useful for when you need to remember work that has already been performed. Returns previous decisions, strategies and outputs that are relevant to the provided query.",
      func: (query: string) => memory.getRelevant(query),
    });
  }
}
