import { Message, TextMessage } from "../value/Message";

let cliMessagePreference = {
  enableOutput: false,
  logDirectory: undefined as string | undefined,
  enableMessageLogging: false,
  enableLog: false,
};

export function updateCliMessagePreference(prefs: typeof cliMessagePreference) {
  cliMessagePreference = prefs;
}

export const cliMessage = {
  put(message: Message) {
    if (!cliMessagePreference.enableOutput) {
      return;
    }
    if (message instanceof TextMessage) {
      console.log(message.body);
    }
  },
  log(message: TextMessage) {},
};
