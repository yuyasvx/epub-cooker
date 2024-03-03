import { program } from "commander";
import { container } from "tsyringe";
import { options } from "../command/CommandOptions";
import { CookCommand } from "../command/CookCommand";
import { NewCommand } from "../command/NewCommand";
import { PackCommand } from "../command/PackCommand";
import { AppCommand } from "../domain/prototype/Command";

// 重要：AppCommandを実装したらcommandsに登録しないといけません
const commands = [
  container.resolve(CookCommand),
  container.resolve(NewCommand),
  container.resolve(PackCommand),
] as AppCommand[];

export function loadCommands() {
  for (const c of commands) {
    const cmd = program.command(c.name);
    cmd.action(async () => {
      try {
        await c.run();
      } catch (err) {
        if ((err as Error).message) {
          console.error((err as Error).message);
        }
      }
    });
  }
  for (const op of options) {
    program.addOption(op);
  }
  program.parse();
}
