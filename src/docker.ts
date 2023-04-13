import { Docker, Options } from "docker-cli-js";
import * as path from "path";

export class Container {
  private readonly name: string;
  private readonly docker: Docker;
  private readonly run: Promise<void>;

  constructor(id: string, private readonly workdDir: string) {
    this.name = `LLM_${id}`;
    const options = new Options(
      undefined,
      path.join(__dirname, workdDir),
      true
    );
    this.docker = new Docker(options);
    this.run = this.docker.command(
      `run -it --name ${this.name} node watch "date >> /var/log/date.log"`
    );
  }

  exec(command: string) {
    return this.docker.command(`exec -it ${this.name} ${command}`);
  }

  start() {
    return this.docker.command(`start ${this.name}`);
  }

  stop() {
    return this.docker.command(`stop ${this.name}`);
  }

  rm() {
    return this.docker.command(`rm ${this.name}`);
  }
}
