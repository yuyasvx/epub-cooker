import { format } from 'date-fns';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PageLayoutType } from '../../../enums/PageLayoutType';
import { PageProgressionDirectionType } from '../../../enums/PageProgressionDirectionType';
import { SourceHandlingType } from '../../../enums/SourceHandlingType';
import type { EpubProjectV2 } from '../../../value/EpubProject';
import { ProcessedItemType } from '../../item-loader/loader/enums/ProcessedItemType';
import type { ProcessedItem } from '../../item-loader/loader/value/ProcessedItem';
import { PackageOpfMarkupStructure } from './PackageOpfMarkupStructure';

describe('PackageOpfMarkupStructure', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('初期状態が正しいこと', () => {
    const structure = new PackageOpfMarkupStructure();
    expect(structure.itemPath).toBe('OPS/package.opf');
    expect(structure.content.package.$.version).toBe('3.0');
    expect(structure.content.package.$['unique-identifier']).toBe('book-id');
  });

  describe('setMetadata', () => {
    const baseProject: EpubProjectV2 = {
      version: 2,
      metadata: {
        title: 'Test Book',
        language: 'ja',
      },
      book: {
        'page-progression-direction': PageProgressionDirectionType.ltr,
        'use-specified-fonts': false,
        'layout-type': PageLayoutType.reflow,
        fixed: { 'page-size': 'auto' },
      },
      source: {
        using: SourceHandlingType.none,
        contents: 'contents',
        'ignore-patterns': [],
        'ignore-unknown-file-type': true,
        'ignore-system-file': true,
      },
    };

    test('必須のメタデータが正しく設定されること', () => {
      const structure = new PackageOpfMarkupStructure();
      structure.setMetadata(baseProject);

      const [metadata] = structure.content.package.metadata;

      // 言語
      expect(structure.content.package.$['xml:lang']).toBe('ja');
      expect(metadata['dc:language']).toEqual([{ $: { id: 'language' }, _: 'ja' }]);

      // タイトル
      expect(metadata['dc:title']).toEqual([{ $: { id: 'title' }, _: 'Test Book' }]);

      // Modified Date
      expect(metadata.meta).toEqual(
        expect.arrayContaining([
          {
            $: { property: 'dcterms:modified' },
            _: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          },
        ]),
      );

      // Page Progression Direction
      expect(structure.content.package.spine[0]!.$['page-progression-direction']).toBe('ltr');
    });

    test('すべてのメタデータが正しく設定されること', () => {
      const fullProject: EpubProjectV2 = {
        ...baseProject,
        metadata: {
          ...baseProject.metadata,
          author: 'Author Name',
          publisher: 'Publisher Name',
          'published-date': '2023-12-31',
          identifier: 'urn:isbn:1234567890',
        },
        'additional-metadata': [{ key: 'custom:meta', value: 'custom value' }],
        book: {
          ...baseProject.book,
          'page-progression-direction': PageProgressionDirectionType.rtl,
          'use-specified-fonts': true,
        },
      };

      const structure = new PackageOpfMarkupStructure();
      structure.setMetadata(fullProject);

      const [metadata] = structure.content.package.metadata;

      // オプショナルなメタデータ
      expect(metadata['dc:creator']).toEqual([{ $: { id: 'creator' }, _: 'Author Name' }]);
      expect(metadata['dc:publisher']).toEqual(['Publisher Name']);
      expect(metadata['dc:date']).toEqual(['2023-12-31']);
      expect(metadata['dc:identifier']).toEqual([{ $: { id: 'book-id' }, _: 'urn:isbn:1234567890' }]);

      // 追加メタデータ
      expect(metadata.meta).toEqual(expect.arrayContaining([{ $: { property: 'custom:meta' }, _: 'custom value' }]));

      // Specified Fonts
      expect(metadata.meta).toEqual(
        expect.arrayContaining([
          { $: { property: 'ibooks:version' }, _: '3.0' },
          { $: { property: 'ibooks:specified-fonts' }, _: true },
        ]),
      );

      // Page Progression Direction
      expect(structure.content.package.spine[0]!.$['page-progression-direction']).toBe('rtl');
    });
  });

  describe('setItems', () => {
    test('アイテムがManifestとSpineに正しく振り分けられること', () => {
      const items: ProcessedItem[] = [
        {
          itemId: 'item-1',
          itemType: ProcessedItemType.PAGE,
          itemPath: 'OEBPS/page1.xhtml',
          mimeType: 'application/xhtml+xml',
          fileSizeByte: 100,
        },
        {
          itemId: 'item-2',
          itemType: ProcessedItemType.ASSET,
          itemPath: 'OEBPS/image.png',
          mimeType: 'image/png',
          fileSizeByte: 200,
        },
        {
          itemId: 'item-3',
          itemType: ProcessedItemType.TOC_PAGE,
          itemPath: 'OEBPS/toc.xhtml',
          mimeType: 'application/xhtml+xml',
          fileSizeByte: 150,
        },
        {
          itemId: 'item-4',
          itemType: ProcessedItemType.COVER_IMAGE,
          itemPath: 'OEBPS/cover.jpg',
          mimeType: 'image/jpeg',
          fileSizeByte: 300,
        },
      ];

      const structure = new PackageOpfMarkupStructure();
      structure.setItems(items);

      const manifest = structure.content.package.manifest[0]!.item;
      const spine = structure.content.package.spine[0]!.itemref;

      // Manifest: すべてのアイテムが含まれるべき
      expect(manifest).toHaveLength(4);
      expect(manifest).toEqual(
        expect.arrayContaining([
          { $: { id: 'item-1', href: 'OEBPS/page1.xhtml', 'media-type': 'application/xhtml+xml' } },
          { $: { id: 'item-2', href: 'OEBPS/image.png', 'media-type': 'image/png' } },
          { $: { id: 'item-3', href: 'OEBPS/toc.xhtml', 'media-type': 'application/xhtml+xml', properties: 'nav' } },
          { $: { id: 'item-4', href: 'OEBPS/cover.jpg', 'media-type': 'image/jpeg', properties: 'cover-image' } },
        ]),
      );

      // Spine: PAGEのみが含まれるべき
      expect(spine).toHaveLength(1);

      // linear属性の確認
      const pageItem = spine.find((i) => i.$.idref === 'item-1');
      expect(pageItem).toBeDefined();
      expect(pageItem!.$.linear).toBe('yes');

      const tocItem = spine.find((i) => i.$.idref === 'item-3');
      expect(tocItem).toBeUndefined();
      // expect(tocItem!.$.linear).toBe('no');

      // ASSETやCOVER_IMAGEはSpineに含まれない
      expect(spine.find((i) => i.$.idref === 'item-2')).toBeUndefined();
      expect(spine.find((i) => i.$.idref === 'item-4')).toBeUndefined();
    });
  });
});
