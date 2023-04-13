import { initializeAgentExecutor } from "langchain/agents";
import { SerpAPI } from "langchain/tools";
import * as uuid from "uuid";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { ConsoleCallbackHandler } from "langchain/callbacks";
import { createMemory } from "./memory/create_memory";
import { MemoryTool } from "./memory/memory_tool";
import { createMemoryHandler } from "./memory/memory_handler";
import { createFsTools } from "./tools/fs";
import { ShellTool } from "./tools/shell";

const workDir: string = process.env.WORK_DIR || "workspace";

export async function createAgent({
  name,
  goal,
  temperature,
  getFeedback,
}: {
  name: string;
  goal: string;
  temperature: number;
  // User feedback on the orevious action
  getFeedback: (/** todo: arg? */) => Promise<string>;
}) {
  const id = uuid.v4();
  const longTermMemory = createMemory(id);
  const model = new ChatOpenAI({ temperature });
  const tools = [
    new SerpAPI(),
    new MemoryTool(longTermMemory),
    ...createFsTools(workDir),
    new ShellTool(),
  ];
  const executor = await initializeAgentExecutor(
    tools,
    model,
    "chat-conversational-react-description",
    true
  );
  // Short term memory: recent chat history
  const shortTermMemory = new BufferMemory({
    returnMessages: true,
    memoryKey: "chat_history",
  });
  executor.memory = shortTermMemory;
  // Log output to console
  executor.callbackManager.addHandler(
    new ConsoleCallbackHandler({ alwaysVerbose: true })
  );
  // Long term memory lifecycle
  executor.callbackManager.addHandler(createMemoryHandler(longTermMemory));

  const createPrompt = (feedback: string) =>
    `You are ${name}.

Your decisions must always be made independently without seeking user assistance. Play to your strengths as an LLM and pursue strategies with no legal complications.

You have access to the following tools:
${tools.map((tool) => `${tool.name}: ${tool.description}`).join("\n")}

GOAL: ${goal}

${feedback ? `Feedback: ${feedback}` : ""}
`.trim();

  while (true) {
    const feedback = await getFeedback();
    const input = createPrompt(feedback);
    await executor.call({ input });
  }
}
