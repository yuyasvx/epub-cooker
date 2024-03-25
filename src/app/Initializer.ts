import { program } from "commander";
import { CommandOption, options } from "../command/CommandOptions";
import { cookCommand } from "../command/CookCommand";
import { packCommand } from "../command/PackCommand";
import { AppCommand } from "../domain/prototype/Command";

// const commands = [
//   container.resolve(CookCommand),
//   container.resolve(NewCommand),
//   container.resolve(PackCommand),
// ] as AppCommand[];

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
        if (err instanceof Error) {
          console.error(err.message);
          console.error(err.stack);
        }
      }
    });
  }
  for (const op of options) {
    program.addOption(op);
  }
  program.parse();
}
