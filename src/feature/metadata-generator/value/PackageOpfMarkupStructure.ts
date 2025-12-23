import { format } from 'date-fns';
import type { EpubProjectV2 } from '../../../value/EpubProject';
import { ItemPath } from '../../../value/ItemPath';
import { ProcessedItemType } from '../../item-loader/loader/enums/ProcessedItemType';
import type { ProcessedItem } from '../../item-loader/loader/value/ProcessedItem';
import type { MetadataEntry, MetadataPartialStructure } from './MetadataPartialStructure';
import { XmlStructure } from './XmlStructure';

/** @internal */
export class PackageOpfMarkupStructure extends XmlStructure {
  readonly itemPath = ItemPath('OPS/package.opf');

  private _content = {
    package: {
      $: {
        xmlns: 'http://www.idpf.org/2007/opf',
        version: '3.0',
        'xml:lang': undefined as string | undefined,
        'unique-identifier': 'book-id',
        prefix: 'ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/',
      },
      metadata: [this.defaultMetadataPartialStructure] as [MetadataPartialStructure],
      manifest: [
        {
          item: [] as ManifestItemEntry[],
        },
      ],
      spine: [
        {
          $: { 'page-progression-direction': 'ltr' },
          itemref: [] as SpineItemEntry[],
        },
      ],
    },
  };

  get content() {
    return this._content;
  }

  private get defaultMetadataPartialStructure(): MetadataPartialStructure {
    return {
      $: {
        'xmlns:opf': 'http://www.idpf.org/2007/opf',
        'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
        'xmlns:dcterms': 'http://purl.org/dc/terms/',
      },
      'dc:title': [{ $: { id: 'title' }, _: '' }],
      // 'dc:creator': undefined,
      // 'dc:publisher': undefined as [string] | undefined,
      // 'dc:date': undefined as [string] | undefined,
      // 'dc:language': undefined,
      meta: [],
      // 'dc:identifier': undefined,
    };
  }

  setMetadata(project: EpubProjectV2) {
    this.setLanguage(project.metadata.language);

    const generatedMetadata = this.generateMetadata(project.metadata);
    const generatedMetas = [
      ...this.generateAdditionalMeta(project['additional-metadata']),
      ...this.generateSpecifiedFontsMeta(project.book['use-specified-fonts']),
      ...this.generateModifiedDateTime(),
    ];
    generatedMetadata.meta = generatedMetas;

    this._content.package.metadata = [generatedMetadata];
    this._content.package.spine[0]!.$['page-progression-direction'] = project.book['page-progression-direction'];
  }

  setItems(items: ProcessedItem[]) {
    this._content.package.manifest[0]!.item = items.map(this.generatemanifest);
    this._content.package.spine[0]!.itemref = items
      .filter((i) => i.itemType === ProcessedItemType.PAGE)
      .map(this.generateSpine);
  }

  private setLanguage(lang?: string) {
    this._content.package.$['xml:lang'] = lang;
  }

  private generateMetadata(projectMetadata: EpubProjectV2['metadata']): MetadataPartialStructure {
    return {
      ...this.defaultMetadataPartialStructure,
      'dc:language': [{ $: { id: 'language' }, _: projectMetadata.language }],
      'dc:title': [{ $: { id: 'title' }, _: projectMetadata.title }],

      ...(projectMetadata.author != null
        ? {
            'dc:creator': [{ $: { id: 'creator' }, _: projectMetadata.author }],
          }
        : {}),

      ...(projectMetadata.publisher != null
        ? {
            'dc:publisher': [projectMetadata.publisher],
          }
        : {}),

      ...(projectMetadata['published-date'] != null
        ? {
            'dc:date': [projectMetadata['published-date']],
          }
        : {}),

      ...(projectMetadata.identifier != null
        ? {
            'dc:identifier': [{ $: { id: 'book-id' }, _: projectMetadata.identifier }],
          }
        : {}),
    };
  }

  private generateAdditionalMeta(entries: EpubProjectV2['additional-metadata']): MetadataEntry[] {
    if (entries == null) {
      return [];
    }
    return entries.map(
      (e): MetadataEntry => ({
        $: {
          property: e.key,
        },
        _: e.value,
      }),
    );
  }

  private generateSpecifiedFontsMeta(enabled: boolean): [] | [MetadataEntry, MetadataEntry] {
    if (!enabled) {
      return [];
    }

    return [
      {
        $: {
          property: 'ibooks:version',
        },
        _: '3.0',
      },
      {
        $: {
          property: 'ibooks:specified-fonts',
        },
        _: enabled,
      },
    ];
  }

  private generateModifiedDateTime(): [MetadataEntry] {
    return [
      {
        $: {
          property: 'dcterms:modified',
        },
        _: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
    ];
  }

  private generatemanifest(item: ProcessedItem): ManifestItemEntry {
    return {
      $: {
        'media-type': item.mimeType ?? '',
        href: item.itemPath,
        id: item.itemId,
        ...(item.itemType === ProcessedItemType.TOC_PAGE ? { properties: 'nav' } : {}),
        ...(item.itemType === ProcessedItemType.COVER_IMAGE ? { properties: 'cover-image' } : {}),
      },
    };
  }

  private generateSpine(item: ProcessedItem): SpineItemEntry {
    return {
      $: {
        idref: item.itemId,
        ...(item.itemType === ProcessedItemType.TOC_PAGE ? { linear: 'no' } : { linear: 'yes' }),
      },
    };
  }
}

type SpineItemEntry = Readonly<{ $: { idref: string; linear: 'yes' | 'no' } }>;

type ManifestItemEntry = Readonly<{
  $: {
    href: string;
    id: string;
    'media-type': string;
    properties?: string;
  };
}>;
