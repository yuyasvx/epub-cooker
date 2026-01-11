import { PageLayoutType } from '../enums/PageLayoutType';
import { SourceHandlingType } from '../enums/SourceHandlingType';
import { IllegalSourceHandlingTypeError } from '../error/IllegalSourceHandlingTypeError';
import { tryThrows } from '../lib/util/EffectUtil';
import {
  BookConfiguration,
  type FixedLayoutBookConfiguration,
  type ReflowLayoutBookConfiguration,
} from './BookConfiguration';
import type { BookMetadata } from './BookMetadata';
import type { BookSource } from './BookSource';
import type { ResolvedPath } from './ResolvedPath';

export type BookAdditionalMetadata = { key: string; value: unknown };

export type EpubProject = Readonly<{
  projectDir: ResolvedPath;
  metadata: BookMetadata;
  additionalMetadata: BookAdditionalMetadata[];
  config: ReflowLayoutBookConfiguration | FixedLayoutBookConfiguration;
  source: BookSource;
}>;

export function EpubProject(
  projectDir: ResolvedPath,
  metadata: BookMetadata,
  source: BookSource,
  additionalMetadata: BookAdditionalMetadata[] = [],
  config: ReflowLayoutBookConfiguration | FixedLayoutBookConfiguration = BookConfiguration(),
) {
  return tryThrows<IllegalSourceHandlingTypeError>()(() => {
    if (source.sourceHandlingType === SourceHandlingType.photo && config.layoutType === PageLayoutType.reflow) {
      throw new IllegalSourceHandlingTypeError(config.layoutType, source.sourceHandlingType);
    }
    return {
      projectDir,
      metadata,
      additionalMetadata,
      config,
      source,
    } as EpubProject;
  });
}
