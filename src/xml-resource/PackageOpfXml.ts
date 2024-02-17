import { Case } from "../domain/enums/Case";
import { PageProgression } from "../domain/enums/PageProgression";
import { AdditionalMetadata, EpubProject } from "../domain/value/EpubProject";
import { ManifestItem } from "../domain/value/ManifestItem";
import { SpineItems } from "../domain/value/SpineItem";
import { getFormattedDateTime } from "../util/FormattedDateTime";
import { XmlResource } from "./XmlResource";

type MetadataEntry<V = unknown> = Readonly<{
  _: V;
  $: { property: string };
}>;

type ManifestItemEntry = Readonly<{
  $: {
    href: string;
    id: string;
    "media-type": string;
    properties?: string;
  };
}>;

type SpineItemEntry = Readonly<{ $: { idref: string; linear: "yes" | "no" } }>;

export class PackageOpfXml extends XmlResource {
  readonly path = "OPS/package.opf";
  items = [] as ManifestItem[];
  additionalMetadata = [
    { key: "ibooks:version", value: "3.0" },
    { key: "ibooks:specified-fonts", value: false },
  ] as AdditionalMetadata[];
  spineItems = [] as SpineItems[];

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
            "dc:creator": [{ _: undefined as string | undefined, $: { id: "creator" } }],
            "dc:publisher": [undefined as string | undefined],
            "dc:language": [{ _: undefined as string | undefined, $: { id: "language" } }],
            meta: [] as MetadataEntry[],
            "dc:identifier": [{ _: undefined as string | undefined, $: { id: "book-id" } }],
          },
        ],
        manifest: [
          {
            item: [
              // { $: { href: "Text/nav.xhtml", id: "nav.xhtml", "media-type": "application/xhtml+xml", properties: "nav" } },
            ] as ManifestItemEntry[],
          },
        ],
        spine: [
          {
            $: { "page-progression-direction": "ltr" },
            itemref: [
              // { $: { idref: "F.xhtml" } },
            ] as SpineItemEntry[],
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

  public toXml(): string {
    this.updateAdditionalMetadata();
    this.updateManifestItems();
    this.updateSpineItems();
    return super.toXml();
  }

  public setLanguage(lang?: string) {
    this.resource.content.package.$["xml:lang"] = lang;
    this.resource.content.package.metadata[0]["dc:language"][0]._ = lang;
  }

  public setSpecifiedFonts(enabled: boolean) {
    this.additionalMetadata = this.additionalMetadata.filter((e) => e.key !== "ibooks:specified-fonts");
    this.additionalMetadata.push({ key: "ibooks:specified-fonts", value: enabled });
  }

  public setPageProgression(type: Case<typeof PageProgression>) {
    this.resource.content.package.spine[0].$["page-progression-direction"] = type;
  }

  public updateModifiedDateTime() {
    const formattedDt = getFormattedDateTime(new Date());
    this.additionalMetadata = this.additionalMetadata.filter((e) => e.key !== "dcterms:modified");
    this.additionalMetadata.push({ key: "dcterms:modified", value: formattedDt });
  }

  private updateAdditionalMetadata() {
    const metadata = this.resource.content.package.metadata[0];
    const m = this.additionalMetadata.map((md) => {
      return { _: md.value, $: { property: md.key } };
    });
    metadata.meta = m;
  }

  private updateManifestItems() {
    const source = this.resource.content.package.manifest[0];
    const entries: ManifestItemEntry[] = this.items.map((itm) => ({
      $: { id: itm.id, href: itm.href, "media-type": itm.mediaType, properties: itm.properties },
    }));
    source.item = entries;
  }

  private updateSpineItems() {
    const source = this.resource.content.package.spine[0];
    const s = this.spineItems.map((itm): SpineItemEntry => {
      return { $: { idref: itm.id, linear: itm.linear ? "yes" : "no" } };
    });
    source.itemref = s;
  }
}
