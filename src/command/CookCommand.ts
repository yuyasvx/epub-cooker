import { AppCommand } from "../domain/prototype/Command";
import { cook } from "../module/CookModule";

export const cookCommand: AppCommand = {
  name: "cook",
  async run(option) {
    const projectDirectory = option.getDir() || process.cwd();
    await cook(projectDirectory, option.isNoPack(), option.isDebugEnabled());
  },
};
