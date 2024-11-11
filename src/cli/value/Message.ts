import { Case } from "../../util/Case";
import { MessageLevelType } from "../enums/MessageLevelType";

export abstract class Message {
  readonly timestamp = new Date();

  constructor(readonly level: Case<typeof MessageLevelType>) {}
}

export class TextMessage extends Message {
  constructor(
    readonly level: Case<typeof MessageLevelType>,
    readonly body: string,
  ) {
    super(level);
  }
}

export const newMessage = (body: string, level: Case<typeof MessageLevelType> = MessageLevelType.INFO) =>
  new TextMessage(level, body);

export class LocalizableMessage extends Message {
  constructor(
    readonly level: Case<typeof MessageLevelType>,
    readonly token: string,
  ) {
    super(level);
  }
}
