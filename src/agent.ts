import { Tool, initializeAgentExecutor } from "langchain/agents";
import { SerpAPI } from "langchain/tools";
import * as uuid from "uuid";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { ConsoleCallbackHandler } from "langchain/callbacks";
import { createMemory } from "./memory/create_memory";
import { MemoryTool } from "./memory/memory_tool";
import { createMemoryHandler } from "./memory/memory_handler";
import { createFsTools } from "./tools/fs";
import { ShellTool } from "./tools/shell";
import * as path from "path";
import { GetHumanFeedback as GetHumanFeedbackTool } from "./tools/request_feedback";
import { ChainValues } from "langchain/schema";
import { Delegator } from "./delegator";
import { Delegate as DelegateTool } from "./tools/delegate";

// todo: Move these to an abstract def file
export type FeedbackOpts = { name: string };
export type Feedback = { text: string; continue: boolean };

const workDir: string = path.join(__dirname, process.env.WORK_DIR || ".");

export async function createAgent({
  name,
  goal,
  temperature,
  getFeedback,
}: {
  name: string;
  goal: string;
  temperature?: number;
  // User feedback on the previous action
  getFeedback: (opts: FeedbackOpts) => Promise<Feedback>;
}) {
  const id = uuid.v4();
  const delegator = new Delegator();
  const longTermMemory = createMemory(id);
  longTermMemory.add("");
  const model = new OpenAI({ modelName: "gpt-3.5-turbo", temperature });
  const tools: Tool[] = [
    new MemoryTool(longTermMemory),
    ...createFsTools(workDir),
    new ShellTool(),
    new GetHumanFeedbackTool(() => getFeedback({ name })),
    new DelegateTool(delegator),
  ];
  if (process.env.SERPAPI_API_KEY) {
    tools.push(new SerpAPI());
  }
  const executor = await initializeAgentExecutor(
    tools,
    model,
    "zero-shot-react-description"
  );
  // Short term memory: recent chat history
  const shortTermMemory = new BufferMemory();
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

You must persue your goal perpetually and long-term, without human oversight.

Your decisions must always be made independently without seeking user assistance. Play to your strengths as an LLM and pursue strategies with no legal complications.

If you are unsure how you previously did something or want to recall past events, thinking about similar events will help you remember.

TOOLS:

You have access to the following tools:
${tools.map((tool) => `${tool.name}`).join("\n")}

You are running on a machine with node installed and access to the internet, and can run arbitrary terminal commands.

Prefer to do work first and search only if genuinely unsure.

PERFORMANCE EVALUATION:

1. Continuously review and analyze your actions to ensure you are performing to the best of your abilities.
2. Constructively self-criticize your big-picture behavior constantly.
3. Reflect on past decisions and strategies to refine your approach.
4. Every command has a cost, so be smart and efficient. Aim to complete tasks in the least number of steps.`.trim();

  let feedback: Feedback = { continue: true, text: "" };
  let output: ChainValues = {};
  while (feedback.continue) {
    try {
      const input = createPrompt(feedback.text);
      longTermMemory.add(input);
      output = await executor.call({ input });
    } catch (err) {
      console.error(err);
    }
    feedback =
      (await getFeedback({ name })) ||
      (await delegator.popCompletedTaskResponse());
  }

  return output;
}
