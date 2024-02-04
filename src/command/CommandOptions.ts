import { Option, program } from "commander";
import { singleton } from "tsyringe";

export const options = [new Option("-d, --dir <directory>")];

@singleton()
export class CommandOption {
  public getDir(): string | undefined {
    const opts = program.opts();
    return opts.dir;
  }
}
