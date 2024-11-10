import { BookContextData } from "../../domain/data/BookContext";
import { archiveDirectory } from "../../domain/logic/EpubArchiver";
import { finalize } from "../../domain/logic/Finalizer";
import { identify } from "../../domain/logic/Identifier";
import { loadProjectFile } from "../../domain/logic/ProjectLoader";
import { start } from "../../domain/logic/book-context/BookProcessor";
import { runThrowing } from "../../util/EffectUtil";
import { AppCommand } from "../schema/AppCommand";

export const cookCommand: AppCommand = {
  name: "cook",
  async run(option) {
    const projectDirectory = option.getDir() || process.cwd();
    const noPack = option.isNoPack();
    const debug = option.isDebugEnabled();

    const proj = await runThrowing(loadProjectFile(projectDirectory));
    console.log(`${proj.bookMetadata.title} の製本を開始します。`);

    const identifier = await identify(projectDirectory, proj);
    const context = BookContextData.create(projectDirectory, proj, identifier);

    try {
      await runThrowing(start(context, proj));

      if (noPack) {
        console.log("データの読み込みとファイルのコピーが終了しました。");
        return;
      }

      await runThrowing(archiveDirectory(context.workingDirectory, context.projectDirectory, context.bookFileName));
    } finally {
      finalize(context, debug, noPack);
    }
  },
};
