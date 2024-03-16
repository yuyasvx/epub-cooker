import { resolve } from "path";
import { singleton } from "tsyringe";
import { AppCommand } from "../domain/prototype/Command";
import { makeEpubArchive } from "../module/PackModule";
import { CommandOption } from "./CommandOptions";

@singleton()
export class PackCommand implements AppCommand {
  readonly name = "pack";

  constructor(private commandOption: CommandOption) {}

  public async run() {
    const input = this.commandOption.getInputDir();
    const output = this.commandOption.getOutputDir();

    if (input == null || output == null) {
      throw new Error("DIR_REQUIRED");
    }

    await makeEpubArchive(resolve(process.cwd(), input), resolve(process.cwd(), output), "book");
  }
}
