import { DynamicTool } from "langchain/tools";
import { Delegator } from "../delegator";

export class Delegate extends DynamicTool {
  readonly completedTasks: string[] = [];

  constructor(delegator: Delegator) {
    super({
      name: "Delegate",
      description:
        "Create an new agent who will perform a task asynchronously and report the result later, allowing you to perform other tasks now. The task should be described in as much detail as possible, with as much context provided as possible.",
      func: async (task) => {
        delegator.delegate(task);
        return `Task delegated to a new agent successfully. The result will be reported to you when it is completed.`;
      },
    });
  }
}
