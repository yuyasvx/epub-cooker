import { Case } from "../domain/enums/Case";
import { PageProgression } from "../domain/enums/PageProgression";
import { EpubProject } from "../domain/value/EpubProject";
import { XmlResource } from "./XmlResource";

export class PackageOpfXml extends XmlResource {
  readonly path = "OPS/package.opf";
  resource = {
    decleration: `<?xml version="1.0" encoding="UTF-8"?>`,
    content: {
      package: {
        $: {
          xmlns: "http://www.idpf.org/2007/opf",
          version: "3.0",
          "xml:lang": undefined as string | undefined,
          "unique-identifier": "book-id",
          prefix: "ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/",
        },
        metadata: [
          {
            $: {
              "xmlns:opf": "http://www.idpf.org/2007/opf",
              "xmlns:dc": "http://purl.org/dc/elements/1.1/",
              "xmlns:dcterms": "http://purl.org/dc/terms/",
            },
            "dc:title": [{ _: "$title", $: { id: "title" } }],
            "dc:creator": [{ _: undefined as string | undefined, $: { "opf:role": "aut", prefer: "dcterm-creator" } }],
            "dc:publisher": [undefined as string | undefined],
            "dc:language": [{ _: undefined as string | undefined, $: { id: "language" } }],
            meta: [
              { _: "2015-02-22T11:57:00Z", $: { property: "dcterms:modified" } },
              { _: "3.0", $: { property: "ibooks:version" } },
              { _: "false", $: { property: "ibooks:specified-fonts" } },
            ],
            "dc:identifier": [{ _: undefined as string | undefined, $: { id: "book-id" } }],
          },
        ],
        manifest: [
          {
            item: [
              // { $: { href: "Text/nav.xhtml", id: "nav.xhtml", "media-type": "application/xhtml+xml", properties: "nav" } },
            ],
          },
        ],
        spine: [
          {
            $: { "page-progression-direction": "ltr" },
            itemref: [
              // { $: { idref: "F.xhtml" } },
            ],
          },
        ],
      },
    },
  };

  public static of(project: EpubProject, identifier: string) {
    const lang = project.bookMetadata.language;
    const title = project.bookMetadata.title;
    const creator = project.bookMetadata.creator;
    const publisher = project.bookMetadata.publisher;

    const xml = new PackageOpfXml();
    xml.setLanguage(lang);
    xml.resource.content.package.metadata[0]["dc:title"][0]._ = title;
    xml.resource.content.package.metadata[0]["dc:creator"][0]._ = creator;
    xml.resource.content.package.metadata[0]["dc:publisher"][0] = publisher;
    xml.resource.content.package.metadata[0]["dc:identifier"][0]._ = identifier;
    xml.setSpecifiedFonts(project.useSpecifiedFonts);
    xml.setPageProgression(project.pageProgression);

    return xml;
  }

  public setLanguage(lang?: string) {
    this.resource.content.package.$["xml:lang"] = lang;
    this.resource.content.package.metadata[0]["dc:language"][0]._ = lang;
  }

  public setSpecifiedFonts(enabled: boolean) {
    const meta = this.resource.content.package.metadata[0].meta;
    const entry = meta.find((entry) => entry.$.property === "ibooks:specified-fonts");
    if (entry == null) {
      meta.push({ _: enabled ? "true" : "false", $: { property: "ibooks:specified-fonts" } });
    } else {
      entry._ = enabled ? "true" : "false";
    }
  }

  public setPageProgression(type: Case<typeof PageProgression>) {
    this.resource.content.package.spine[0].$["page-progression-direction"] = type;
  }
}
