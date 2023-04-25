import { ChainValues } from "langchain/schema";
import { createAgent } from "./agent";
import { v4 } from "uuid";

type DelegatedTask = {
  id: string;
  task: string;
};

type CompletedTask = DelegatedTask & { response: string };

/** Handles delegation of tasks to child agents */
export class Delegator {
  // todo: persist on to disk
  private readonly pendingTasks: { [id: string]: Omit<DelegatedTask, "id"> } =
    {};
  private readonly completedTasks: CompletedTask[] = [];

  constructor(
    private readonly _createAgent: typeof createAgent = createAgent,
    private readonly getId: () => string = v4
  ) {}

  delegate(task: string) {
    const id = this.getId();
    const delegatedTask = { id, task };
    this.pendingTasks[id] = delegatedTask;
    const result = this._createAgent({
      name: `Delegated agent ${id}`,
      goal: task,
      getFeedback: async () => {
        delete this.pendingTasks[id];
        this.completedTasks.push({
          ...delegatedTask,
          response: (await result)["output"],
        });
        return {
          continue: false,
          text: "",
        };
      },
    });
  }

  popCompletedTaskResponse(): string | undefined {
    // LIFO, more recent tasks are more likely to be relevant
    const completedTask = this.completedTasks.pop();
    if (!completedTask) {
      return;
    }
    return `Delegated task complete!
Task: ${completedTask.task}
Response: ${completedTask.response}`;
  }
}
