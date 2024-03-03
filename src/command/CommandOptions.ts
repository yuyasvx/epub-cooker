import { Option, program } from "commander";
import { singleton } from "tsyringe";

export const options = [
  new Option("-d, --dir <directory>"),
  new Option("--debug"),
  new Option("--no-pack"),
  new Option("-i, --input <directory>"),
  new Option("-o, --output <directory>"),
];

@singleton()
export class CommandOption {
  public getDir(): string | undefined {
    const opts = program.opts();
    return opts.dir;
  }

  public isDebugEnabled(): boolean {
    const opts = program.opts();
    return opts.debug;
  }

  public isNoPack(): boolean {
    const opts = program.opts();
    return !opts.pack;
  }

  public getInputDir(): string | undefined {
    const opts = program.opts();
    return opts.input;
  }

  public getOutputDir(): string | undefined {
    const opts = program.opts();
    return opts.output;
  }
}
