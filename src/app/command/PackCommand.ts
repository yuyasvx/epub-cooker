import { join, resolve } from "path";
import { andThen, catchAll, fail, succeed } from "effect/Effect";
import { archiveDirectory } from "../../domain/logic/EpubArchiver";
import * as fileIo from "../../io/FileIo";
import { FileNotFoundError } from "../../io/error/FileIoError";
import { runNullable, runThrowing } from "../../util/EffectUtil";
import { CommandParameterError } from "../error/CommandParameterError";
import { AppCommand } from "../schema/AppCommand";

export const packCommand: AppCommand = {
  name: "pack",
  async run(option) {
    const input = option.getInputDir();
    const output = option.getOutputDir();

    if (input == null || output == null) {
      throw new CommandParameterError("DIR_REQUIRED");
    }

    const inputPath = resolve(process.cwd(), input);
    const outputPath = resolve(process.cwd(), output);
    if (await isDirectory(outputPath)) {
      await runThrowing(archiveDirectory(inputPath, outputPath, "book.epub"));
    }

    const fileStat = await runNullable(fileIo.getStat(outputPath));

    if (fileStat != null) {
      console.log("ファイルがすでに存在する");
      return;
    }

    // .epubが含まれている場合は、それを一旦除外する
    const savePath = outputPath.endsWith(".epub") ? outputPath.substring(0, outputPath.length - 5) : outputPath;
    const separatedPaths = savePath.split("/");
    await runThrowing(archiveDirectory(inputPath, join(savePath, "../"), separatedPaths[separatedPaths.length - 1]));
  },
};

async function isDirectory(pathStr: string) {
  return runThrowing(
    fileIo.getList(pathStr).pipe(
      andThen(() => true),
      catchAll((err) => (err instanceof FileNotFoundError ? succeed(false) : fail(err))),
    ),
  );
}
