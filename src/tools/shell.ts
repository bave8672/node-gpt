import { DynamicTool } from "langchain/tools";
import { exec, execSync } from "child_process";

export class ShellTool extends DynamicTool {
  constructor() {
    super({
      name: "Shell",
      description: "Runs an arbitrary shell command on the local machine.",
      func: execPromise,
    });
  }
}

function execPromise(command: string) {
  return new Promise<string>((res, rej) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        // Return the error to the LLM and continue
        res(JSON.stringify(err));
      }
      res(stdout + stderr);
    });
  });
}
