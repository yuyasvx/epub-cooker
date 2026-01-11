import { parseISO } from 'date-fns';
import { z } from 'zod/v4';
import { PageLayoutType } from '../enums/PageLayoutType';
import { PageProgressionDirectionType } from '../enums/PageProgressionDirectionType';
import { PageSizeType } from '../enums/PageSizeType';
import { PageSpreadPositionType } from '../enums/PageSpreadPositionType';
import { SourceHandlingType } from '../enums/SourceHandlingType';
import { ValueGenerationError } from '../error/ValueGenerationError';
import { pipe, tryThrows, unwrap } from '../lib/util/EffectUtil';
import { EpubBookConfiguration } from './EpubBookConfiguration';
import { EpubBookMetadata, type UnidentifiedEpubBookMetadata } from './EpubBookMetadata';
import { EpubBookSource, EpubBookSourcePageOption } from './EpubBookSource';
import { type ResolvedPath, resolvePath } from './ResolvedPath';

const pageOptionsSchema = z.object({
  path: z.string(),
  'page-spread': z.enum(Object.values(PageSpreadPositionType)).optional(),
});

const epubBookMetadataSchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  language: z.string(),
  description: z.string().optional(),
  'published-date': z.iso.date().optional(),
  identifier: z.string().optional(),
});

export const epubProjectV2Schema = z.object({
  version: z.literal(2),
  metadata: epubBookMetadataSchema,
  'additional-metadata': z
    .array(
      z.object({
        key: z.string(),
        value: z.any(),
      }),
    )
    .optional(),
  book: z
    .object({
      'page-progression-direction': z.enum(Object.values(PageProgressionDirectionType)).optional(),
      'use-specified-fonts': z.boolean().optional(),
      'layout-type': z.enum(Object.values(PageLayoutType)).optional(),
      fixed: z
        .object({
          'page-size': z
            .union([
              z.literal(PageSizeType.auto),
              z.object({
                width: z.number(),
                height: z.number(),
              }),
            ])
            .optional(),
        })
        .optional(),
    })
    .optional(),
  source: z.object({
    using: z.enum(Object.values(SourceHandlingType)),
    'ignore-patterns': z.array(z.string()).optional(),
    'ignore-unknown-file-type': z.boolean().optional(),
    'ignore-system-file': z.boolean().optional(),
    'toc-page-path': z.string().optional(),
    'css-path': z.string().optional(),
    contents: z.string().optional(),
    'cover-image-path': z.string().optional(),
    pages: z.array(z.string()).optional(),
    'page-options': z.array(pageOptionsSchema).optional(),
  }),
});

export type EpubProjectSchemaV2 = Readonly<z.infer<typeof epubProjectV2Schema>>;

export function EpubProjectSchemaV2(value: object) {
  return tryThrows()(() => epubProjectV2Schema.parse(value)).mapErr(
    (e) => new ValueGenerationError('EpubProjectV2', e),
  );
}

EpubProjectSchemaV2.toValues = function (projectDir: ResolvedPath, schema: EpubProjectSchemaV2) {
  const contentsDir =
    schema.source.contents != null
      ? resolvePath(projectDir, schema.source.contents)
      : resolvePath(projectDir, 'contents');

  const pageOptions = unwrap(
    pipe(schema.source['page-options'] ?? [])
      .map((options) => options.map((o) => [o.path, o] as const))
      .map((entries) => new Map(entries)),
  );
  const pages = (schema.source.pages ?? []).map((p) => {
    const option = pageOptions.get(p);
    return EpubBookSourcePageOption(resolvePath(contentsDir, p), option?.['page-spread']);
  });

  return {
    projectDir,
    bookMetadata: EpubBookMetadata({
      title: schema.metadata.title,
      author: schema.metadata.author,
      publisher: schema.metadata.publisher,
      language: schema.metadata.language,
      description: schema.metadata.description,
      ...(schema.metadata['published-date'] ? { publishedDate: parseISO(schema.metadata['published-date']) } : {}),
      ...(schema.metadata.identifier != null ? { identifier: schema.metadata.identifier } : {}),
    }) as EpubBookMetadata | UnidentifiedEpubBookMetadata,
    bookSource: EpubBookSource(
      {
        sourceHandlingType: schema.source.using,
        coverImagePath: schema.source['cover-image-path'],
        ignorePatterns: schema.source['ignore-patterns'],
        ignoreSystemFile: schema.source['ignore-system-file'],
        ignoreUnknownFileType: schema.source['ignore-unknown-file-type'],
        tocPath: schema.source['toc-page-path'],
        cssPath: schema.source['css-path'],
        pages,
      },
      contentsDir,
    ),
    bookAdditionaMetadata: schema['additional-metadata'] ?? [],
    bookConfig: EpubBookConfiguration(
      schema.book?.['page-progression-direction'],
      schema.book?.['use-specified-fonts'],
      schema.book?.['layout-type'],
      schema.book?.['fixed']?.['page-size'],
    ),
  };
};
