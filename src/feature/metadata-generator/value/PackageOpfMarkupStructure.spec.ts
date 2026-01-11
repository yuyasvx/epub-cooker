import { format, parseISO } from 'date-fns';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PageProgressionDirectionType } from '../../../enums/PageProgressionDirectionType';
import { PageSpreadPositionType } from '../../../enums/PageSpreadPositionType';
import { EpubBookConfiguration } from '../../../value/EpubBookConfiguration';
import { EpubBookMetadata } from '../../../value/EpubBookMetadata';
import type { BookAdditionalMetadata } from '../../../value/EpubProject';
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
    test('必須のメタデータが正しく設定されること', () => {
      const bookMetadata = EpubBookMetadata({
        title: 'Test Book',
        language: 'ja',
        identifier: 'urn:isbn:1234567890',
      });
      const bookConfig = EpubBookConfiguration(undefined, true);

      const structure = new PackageOpfMarkupStructure();
      structure.setMetadata(bookMetadata, bookConfig, []);

      const [metadata] = structure.content.package.metadata;

      // 言語
      expect(structure.content.package.$['xml:lang']).toBe('ja');
      expect(metadata['dc:language']).toEqual([{ $: { id: 'language' }, _: 'ja' }]);

      // タイトル
      expect(metadata['dc:title']).toEqual([{ $: { id: 'title' }, _: 'Test Book' }]);

      // 識別子
      expect(metadata['dc:identifier']).toEqual([{ $: { id: 'book-id' }, _: 'urn:isbn:1234567890' }]);

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
      const bookMetadata = EpubBookMetadata({
        title: 'Test Book',
        author: 'Author Name',
        publisher: 'Publisher Name',
        publishedDate: parseISO('2023-12-31'),
        language: 'ja',
        identifier: 'urn:isbn:1234567890',
      });
      const additionalMetadata: BookAdditionalMetadata[] = [{ key: 'custom:meta', value: 'custom value' }];
      const bookConfig = EpubBookConfiguration(PageProgressionDirectionType.rtl, true);

      const structure = new PackageOpfMarkupStructure();
      structure.setMetadata(bookMetadata, bookConfig, additionalMetadata);

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
          spreadPosition: PageSpreadPositionType.NONE,
        },
        {
          itemId: 'item-2',
          itemType: ProcessedItemType.ASSET,
          itemPath: 'OEBPS/image.png',
          mimeType: 'image/png',
          fileSizeByte: 200,
          spreadPosition: PageSpreadPositionType.NONE,
        },
        {
          itemId: 'item-3',
          itemType: ProcessedItemType.TOC_PAGE,
          itemPath: 'OEBPS/toc.xhtml',
          mimeType: 'application/xhtml+xml',
          fileSizeByte: 150,
          spreadPosition: PageSpreadPositionType.NONE,
        },
        {
          itemId: 'item-4',
          itemType: ProcessedItemType.COVER_IMAGE,
          itemPath: 'OEBPS/cover.jpg',
          mimeType: 'image/jpeg',
          fileSizeByte: 300,
          spreadPosition: PageSpreadPositionType.NONE,
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

  test('Spineに見開き表示時のページの表示位置が正しく設定されること', () => {
    const items: ProcessedItem[] = [
      {
        itemId: 'item-1',
        itemType: ProcessedItemType.PAGE,
        itemPath: 'OEBPS/page1.xhtml',
        mimeType: 'application/xhtml+xml',
        fileSizeByte: 100,
        spreadPosition: PageSpreadPositionType.NONE,
      },
      {
        itemId: 'item-2',
        itemType: ProcessedItemType.PAGE,
        itemPath: 'OEBPS/page2.xhtml',
        mimeType: 'application/xhtml+xml',
        fileSizeByte: 100,
        spreadPosition: PageSpreadPositionType.LEFT,
      },
      {
        itemId: 'item-3',
        itemType: ProcessedItemType.PAGE,
        itemPath: 'OEBPS/page3.xhtml',
        mimeType: 'application/xhtml+xml',
        fileSizeByte: 100,
        spreadPosition: PageSpreadPositionType.RIGHT,
      },
    ];

    const structure = new PackageOpfMarkupStructure();
    structure.setItems(items);

    const spine = structure.content.package.spine[0]!.itemref;

    // Spine: PAGEのみが含まれるべき
    expect(spine).toEqual([
      {
        $: {
          idref: 'item-1',
          linear: 'yes',
        },
      },
      {
        $: {
          idref: 'item-2',
          linear: 'yes',
          properties: 'page-spread-left',
        },
      },
      {
        $: {
          idref: 'item-3',
          linear: 'yes',
          properties: 'page-spread-right',
        },
      },
    ]);
  });
});
