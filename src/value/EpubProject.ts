import { PageLayoutType } from '../enums/PageLayoutType';
import { SourceHandlingType } from '../enums/SourceHandlingType';
import { IllegalSourceHandlingTypeError } from '../error/IllegalSourceHandlingTypeError';
import { tryThrows } from '../lib/util/EffectUtil';
import {
  EpubBookConfiguration,
  type FixedLayoutEpubBookConfiguration,
  type ReflowLayoutEpubBookConfiguration,
} from './EpubBookConfiguration';
import type { EpubBookMetadata } from './EpubBookMetadata';
import type { EpubBookSource } from './EpubBookSource';
import type { ResolvedPath } from './ResolvedPath';

export type BookAdditionalMetadata = { key: string; value: unknown };

export type EpubProject = Readonly<{
  projectDir: ResolvedPath;
  metadata: EpubBookMetadata;
  additionalMetadata: BookAdditionalMetadata[];
  config: ReflowLayoutEpubBookConfiguration | FixedLayoutEpubBookConfiguration;
  source: EpubBookSource;
}>;

export function EpubProject(
  projectDir: ResolvedPath,
  metadata: EpubBookMetadata,
  source: EpubBookSource,
  additionalMetadata: BookAdditionalMetadata[] = [],
  config: ReflowLayoutEpubBookConfiguration | FixedLayoutEpubBookConfiguration = EpubBookConfiguration(),
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
