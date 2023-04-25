import { DynamicTool } from "langchain/tools";
import { exec, execSync } from "child_process";

export class ShellTool extends DynamicTool {
  constructor() {
    super({
      name: "Shell",
      description:
        "Runs an arbitrary shell command. Multiple commands can be chained with &&",
      func: execPromise,
    });
  }
}

function execPromise(command: string) {
  return new Promise<string>((res) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        res(err.message);
      }
      res(stderr + stdout);
    });
  });
}
