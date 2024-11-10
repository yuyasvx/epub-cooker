import { getFormattedDate, getFormattedDateTime } from "../../../util/FormattedDateTime";
import { Case } from "../../enums/Case";
import { PageProgression } from "../../enums/PageProgression";
import { AdditionalMetadata, EpubProject } from "../../value/EpubProject";
import { ManifestItem } from "../../value/ManifestItem";
import { SpineItem } from "../../value/SpineItem";
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
  spineItems = [] as SpineItem[];

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
            "dc:publisher": undefined as [string] | undefined,
            "dc:date": undefined as [string] | undefined,
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
    const { language, title, creator, publisher, publishedDate } = project.bookMetadata;

    const xml = new PackageOpfXml();
    xml.setLanguage(language);
    // TODO 各プロパティがundefinedだった場合、この書き方だとバグるので、undefinedならプロパティごと消し去るような挙動が良さそう
    xml.resource.content.package.metadata[0]["dc:title"][0]._ = title;
    xml.resource.content.package.metadata[0]["dc:creator"][0]._ = creator;
    xml.resource.content.package.metadata[0]["dc:publisher"] = publisher != null ? [publisher] : undefined;
    xml.resource.content.package.metadata[0]["dc:identifier"][0]._ = identifier;

    xml.setPublisedDate(publishedDate);
    xml.setSpecifiedFonts(project.useSpecifiedFonts);
    xml.setPageProgression(project.pageProgression);

    return xml;
  }

  public toXml(): string {
    this.updateAdditionalMetadata();
    this.updateManifestItems();
    this.updateSpineItems();
    // workaround
    if (this.resource.content.package.metadata[0]["dc:publisher"] == null) {
      // biome-ignore lint/performance/noDelete: <explanation>
      delete this.resource.content.package.metadata[0]["dc:publisher"];
    }
    if (this.resource.content.package.metadata[0]["dc:date"] == null) {
      // biome-ignore lint/performance/noDelete: <explanation>
      delete this.resource.content.package.metadata[0]["dc:date"];
    }
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

  public setPublisedDate(date?: Date) {
    if (date != null) {
      this.resource.content.package.metadata[0]["dc:date"] = [getFormattedDate(date)];
      return;
    }
    this.resource.content.package.metadata[0]["dc:date"] = undefined;
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
