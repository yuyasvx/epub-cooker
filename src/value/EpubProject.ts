import { PageLayoutType } from '../enums/PageLayoutType';
import { SourceHandlingType } from '../enums/SourceHandlingType';
import { IllegalBookSourceHandlingTypeError } from '../error/IllegalBookSourceHandlingTypeError';
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

type EpubProjectT = Readonly<{
  projectDir: ResolvedPath;
  metadata: BookMetadata;
  additionalMetadata: BookAdditionalMetadata[];
  config: ReflowLayoutBookConfiguration | FixedLayoutBookConfiguration;
  source: BookSource;
}>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EpubProject extends EpubProjectT {}

export function EpubProject(
  projectDir: ResolvedPath,
  metadata: BookMetadata,
  source: BookSource,
  additionalMetadata: BookAdditionalMetadata[] = [],
  config: ReflowLayoutBookConfiguration | FixedLayoutBookConfiguration = BookConfiguration(),
) {
  return tryThrows<IllegalBookSourceHandlingTypeError>()(() => {
    if (source.sourceHandlingType === SourceHandlingType.photo && config.layoutType === PageLayoutType.reflow) {
      throw new IllegalBookSourceHandlingTypeError(config.layoutType, source.sourceHandlingType);
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
