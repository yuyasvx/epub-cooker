import { XmlResource } from "./XmlResource";

export class ContainerXml extends XmlResource {
  readonly path = "META-INF/container.xml";
  resource = {
    decleration: `<?xml version="1.0" encoding="UTF-8"?>`,
    content: {
      container: {
        $: { version: "1.0", xmlns: "urn:oasis:names:tc:opendocument:xmlns:container" },
        rootfiles: [
          { rootfile: [{ $: { "full-path": "OPS/package.opf", "media-type": "application/oebps-package+xml" } }] },
        ],
      },
    },
  };

  public setFullPath(path: string) {
    this.resource.content.container.rootfiles[0].rootfile[0].$["full-path"] = path;
  }
}
