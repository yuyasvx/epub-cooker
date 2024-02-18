import { Option, program } from "commander";
import { singleton } from "tsyringe";

export const options = [new Option("-d, --dir <directory>"), new Option("-b, --debug")];

@singleton()
export class CommandOption {
  public getDir(): string | undefined {
    const opts = program.opts();
    return opts.dir;
  }
}
