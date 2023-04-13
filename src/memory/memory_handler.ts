import { CallbackManager } from "langchain/callbacks";
import { BaseMemory } from "./memory";

// Long term memory lifecycle
export function createMemoryHandler(memory: BaseMemory) {
  return CallbackManager.fromHandlers({
    // Store conversation history in long term memory
    async handleText(text: string) {
      await memory.add(text);
    },

    // Store tool input
    async handleToolStart(tool, input: string) {
      await memory.add(input);
    },

    // Store tool output
    async handleToolEnd(output) {
      await memory.add(output);
    },

    // Clear long term memory on agent exit
    async handleAgentEnd() {
      await memory.clear();
    },
  });
}
