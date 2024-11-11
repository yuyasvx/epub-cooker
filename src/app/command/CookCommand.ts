import { cliMessage } from "../../cli/logic/CliMessageDispatcher";
import { newMessage } from "../../cli/value/Message";
import { BookContextData } from "../../domain/data/BookContext";
import { archiveDirectory } from "../../domain/logic/EpubArchiver";
import { finalize } from "../../domain/logic/Finalizer";
import { identify } from "../../domain/logic/Identifier";
import { loadProjectFile } from "../../domain/logic/ProjectLoader";
import { start } from "../../domain/logic/book-context/BookProcessor";
import { runThrowing, throwsAsync } from "../../util/EffectUtil";
import { AppCommand } from "../schema/AppCommand";
import * as fileIo from "../../io/FileIo";
import { resolve } from "path";
import { confirm } from "@inquirer/prompts";
import { ProcessInterruptedError } from "../error/ProcessInterruptedError";
import { FileIoError } from "../../io/error/FileIoError";

export const cookCommand: AppCommand = {
  name: "cook",
  async run(option) {
    const projectDirectory = option.getDir() || process.cwd();
    const noPack = option.isNoPack();
    const debug = option.isDebugEnabled();

    const proj = await runThrowing(loadProjectFile(projectDirectory));
    cliMessage.put(newMessage(`📑 ${proj.bookMetadata.title} の製本を開始します。`));

    const identifier = await identify(projectDirectory, proj);
    const context = BookContextData.create(projectDirectory, proj, identifier);

    await runThrowing(checkOverwrite(context.projectDirectory));

    try {
      await runThrowing(start(context, proj));

      if (noPack) {
        cliMessage.put(newMessage("✅ データの読み込みとファイルのコピーが終了しました。"));
        return;
      }

      await runThrowing(archiveDirectory(context.workingDirectory, context.projectDirectory, context.bookFileName));
    } finally {
      finalize(context, debug, noPack);
    }
  },
};

const checkOverwrite = (projectDirectory: string) =>
  throwsAsync<void, FileIoError | ProcessInterruptedError>(async () => {
    const exist = await runThrowing(fileIo.existDir(resolve(projectDirectory, "_contents")));
    if (exist) {
      const answer = await confirm({
        message: "_contentsディレクトリが既に存在します。このディレクトリを削除して処理をやり直しますか？",
      });
      if (!answer) {
        throw new ProcessInterruptedError();
      }
    }
  });
