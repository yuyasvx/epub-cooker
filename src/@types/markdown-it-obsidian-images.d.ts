declare module "markdown-it-obsidian-images" {
  import { PluginSimple } from "markdown-it";

  interface PluginCtor {
    (option?: Partial<Option>): PluginSimple;
  }

  interface Option {
    htmlAttributes: Record<string, unknown>;
    makeAllLinksAbsolute: boolean;
    uriSuffix: string;
    postProcessImageName: (name: string) => void;
  }

  declare const MarkdownItObsidianImage: PluginCtor;

  export = MarkdownItObsidianImage;
}
