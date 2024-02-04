import { program } from "commander";
import { container } from "tsyringe";
import { CommandOption, options } from "../command/CommandOptions";
import { CookCommand, CookCommandPrototype } from "../command/CookCommand";
import { AppCommand } from "../domain/prototype/Command";

// 重要：AppCommandを実装したらcommandsに登録しないといけません
const commands = [container.resolve(CookCommandPrototype), container.resolve(CookCommand)] as AppCommand[];

export function loadCommands() {
  for (const c of commands) {
    const cmd = program.command(c.name);
    cmd.action(() => c.run());
  }
  for (const op of options) {
    program.addOption(op);
  }
  program.parse();
}
