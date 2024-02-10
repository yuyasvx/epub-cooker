import { XmlResource } from "./XmlResource";

export class IBooksDisplayOptionsXml extends XmlResource {
  readonly path = "META-INF/com.apple.ibooks.display-options.xml";
  resource = {
    decleration: `<?xml version="1.0" encoding="UTF-8"?>`,
    content: {
      display_options: { platform: [{ $: { name: "*" }, option: [{ _: "true", $: { name: "specified-fonts" } }] }] },
    },
  };

  public setSpecifiedFonts(flag: boolean) {
    this.resource.content.display_options.platform[0].option[0]._ = flag ? "true" : "false";
  }
}
