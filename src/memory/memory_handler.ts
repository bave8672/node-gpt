import { CallbackManager } from "langchain/callbacks";
import { BaseMemory } from "./memory";

// Long term memory lifecycle
export function createMemoryHandler(memory: BaseMemory) {
  return CallbackManager.fromHandlers({
    // Store conversation history in long term memory
    async handleText(text: string) {
      await memory.add(text);
    },

    // Store tool output
    async handleToolEnd(output) {
      await memory.add(output);
    },

    async handleChainEnd(outputs) {
      await memory.add(JSON.stringify(outputs));
    },

    // Add agent output to memory
    async handleAgentEnd(action) {
      await memory.add(JSON.stringify(action));
    },
  });
}
