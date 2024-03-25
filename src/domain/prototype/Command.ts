import { CommandOption } from "../../command/CommandOptions";

export interface AppCommand {
  readonly name: string;
  run: (option: CommandOption) => void | Promise<void>;
}
