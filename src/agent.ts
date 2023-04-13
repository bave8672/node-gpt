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
import * as path from "path";
import { exec } from "child_process";

const workDir: string = path.join(
  __dirname,
  process.env.WORK_DIR || "workspace"
);

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
  longTermMemory.add("");
  const model = new ChatOpenAI({ temperature });
  const tools = [
    // new SerpAPI(), // sometimes goes weird and always tries to google everything
    new MemoryTool(longTermMemory),
    ...createFsTools(workDir),
    new ShellTool(),
  ];
  const executor = await initializeAgentExecutor(
    tools,
    model,
    "chat-conversational-react-description"
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
    feedback
      ? `FEEDBACK: ${feedback}`
      : `You are ${name}.

GOAL: ${goal}

You must persue your goal perpetually and long-term, without human oversight,

Your decisions must always be made independently without seeking user assistance. Play to your strengths as an LLM and pursue strategies with no legal complications.

CONSTRAINTS:

1. If you are unsure how you previously did something or want to recall past events, thinking about similar events will help you remember.
2. No user assistance

TOOLS:

You have access to the following tools:
${tools.map((tool) => `${tool.name}: ${tool.description}`).join("\n")}

YOu are running on a machine with node.js installed and access to the internet, and can run arbitrary terminal commands.

Prefer to do work first and search only if genuinely unsure.

PERFORMANCE EVALUATION:

1. Continuously review and analyze your actions to ensure you are performing to the best of your abilities.
2. Constructively self-criticize your big-picture behavior constantly.
3. Reflect on past decisions and strategies to refine your approach.
4. Every command has a cost, so be smart and efficient. Aim to complete tasks in the least number of steps.`.trim();

  let feedback = "";
  while (true) {
    const input = createPrompt(feedback);
    longTermMemory.add(input);
    const values = await executor.call({ input });
    feedback = await getFeedback();
  }
}
