import { CommandOption } from "../CommandOption";

export interface AppCommand {
  readonly name: string;
  run: (option: CommandOption) => void | Promise<void>;
}
