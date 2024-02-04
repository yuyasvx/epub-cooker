import { Option } from "commander";

export interface AppCommand {
  readonly name: string;
  // readonly arguments?: CommandArgument[];
  readonly option?: Option;
  run: () => void | Promise<void>;
}
