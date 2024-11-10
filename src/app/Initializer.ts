import { program } from "commander";
import { CommandOption, options } from "./CommandOption";
import { outputErrorMessage } from "./ErrorHandler";
import { cookCommand } from "./command/CookCommand";
import { packCommand } from "./command/PackCommand";
import { AppCommand } from "./schema/AppCommand";

// 重要：AppCommandを実装したらcommandsに登録しないといけません
const commands: AppCommand[] = [cookCommand, packCommand];
const commandOption = new CommandOption();

export function initialize() {
  for (const c of commands) {
    const cmd = program.command(c.name);
    cmd.action(async () => {
      try {
        await c.run(commandOption);
      } catch (err) {
        outputErrorMessage(err);
      }
    });
  }
  for (const op of options) {
    program.addOption(op);
  }
  program.parse();
}
