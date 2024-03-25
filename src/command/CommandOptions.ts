import { Option, program } from "commander";

export const options = [
  new Option("-d, --dir <directory>"),
  new Option("--debug"),
  new Option("--no-pack"),
  new Option("-i, --input <directory>"),
  new Option("-o, --output <directory>"),
];

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
