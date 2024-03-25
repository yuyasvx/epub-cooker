import { resolve } from "path";
import { AppCommand } from "../domain/prototype/Command";
import { pack } from "../module/PackModule";

export const packCommand: AppCommand = {
  name: "pack",
  async run(option) {
    const input = option.getInputDir();
    const output = option.getOutputDir();

    if (input == null || output == null) {
      throw new Error("DIR_REQUIRED");
    }

    await pack(resolve(process.cwd(), input), resolve(process.cwd(), output));
  },
};
