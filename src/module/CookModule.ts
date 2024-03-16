import { createContext, start } from "../logic/BookProcessor";
import { finalize } from "../logic/Finalizer";
import { loadProjectFile } from "../logic/ProjectLoader";
import { makeEpubArchive } from "./PackModule";

export async function cook(projectDirectory: string, noPack = false, debug = false) {
  const proj = await loadProjectFile(projectDirectory);

  console.log(`${proj.bookMetadata.title} の製本を開始します。`);
  const context = await createContext(projectDirectory, proj);

  try {
    await start(context);

    if (noPack) {
      console.log("データの読み込みとファイルのコピーが終了しました。");
      return;
    }

    makeEpubArchive(context.workingDirectory, context.projectDirectory, context.bookFileName);
  } finally {
    finalize(context, debug, noPack);
  }
}
