import { readFile } from "node:fs/promises";
import markdownit from "markdown-it";
import obsidianImages from "markdown-it-obsidian-images";
import { singleton } from "tsyringe";
const md = markdownit().use(obsidianImages({ htmlAttributes: { class: "inserted-image" } }));

@singleton()
export class MarkdownParseService {
  public async parse(filePath: string) {
    const rawText = (await readFile(filePath)).toString();
    return md.render(rawText);
  }
}
