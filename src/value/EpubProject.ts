import { z } from 'zod/v4';
import { PageLayoutType } from '../enums/PageLayoutType';
import { PageProgressionDirectionType } from '../enums/PageProgressionDirectionType';
import { PageSizeType } from '../enums/PageSizeType';
import { SourceHandlingType } from '../enums/SourceHandlingType';
import { IllegalSourceHandlingTypeError } from '../error/IllegalSourceHandlingTypeError';
import { ValueGenerationError } from '../error/ValueGenerationError';
import { fails } from '../lib/util/EffectUtil';

export const epubProjectV2Schema = z.object({
  version: z.literal(2),
  metadata: z.object({
    title: z.string(),
    author: z.string().optional(),
    publisher: z.string().optional(),
    language: z.string(),
    description: z.string().optional(),
    'published-date': z.iso.date().optional(),
    identifier: z.string().optional(),
  }),
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
      'page-progression-direction': z
        .enum(Object.values(PageProgressionDirectionType))
        .optional()
        .default(PageProgressionDirectionType.ltr),
      'use-specified-fonts': z.boolean().optional().default(false),
      'layout-type': z.enum(Object.values(PageLayoutType)).optional().default(PageLayoutType.reflow),
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
            .optional()
            .default(PageSizeType.auto),
        })
        .optional(),
    })
    .optional()
    .default({
      'layout-type': PageLayoutType.reflow,
      'page-progression-direction': PageProgressionDirectionType.ltr,
      'use-specified-fonts': false,
      fixed: {
        'page-size': PageSizeType.auto,
      },
    }),
  source: z.object({
    using: z.enum(Object.values(SourceHandlingType)),
    'ignore-patterns': z.array(z.string()).optional().default([]),
    'ignore-unknown-file-type': z.boolean().optional().default(true),
    'ignore-system-file': z.boolean().optional().default(true),
    'toc-page-path': z.string().optional(),
    'css-path': z.string().optional(),
    contents: z.string().optional().default('contents'),
    'cover-image-path': z.string().optional(),
  }),
});

type TEpubProjectV2 = Readonly<z.infer<typeof epubProjectV2Schema>>;

// typeではなくinterfaceの宣言に変換することで、遅延評価になり、エディタでの方の説明表示がシンプルになるためこれをやる
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EpubProjectV2 extends TEpubProjectV2 {}

export function EpubProjectV2(value: object) {
  return fails()
    .run(() => epubProjectV2Schema.parse(value))
    .mapErr((e) => new ValueGenerationError('EpubProjectV2', e))
    .andThen(EpubProjectV2.validateSourceHandingType);
}

EpubProjectV2.validateSourceHandingType = function (project: EpubProjectV2) {
  return fails<IllegalSourceHandlingTypeError>().run(() => {
    if (project.source.using === SourceHandlingType.photo && project.book['layout-type'] === PageLayoutType.reflow) {
      throw new IllegalSourceHandlingTypeError(project.book['layout-type'], project.source.using);
    }
    return project;
  });
};
