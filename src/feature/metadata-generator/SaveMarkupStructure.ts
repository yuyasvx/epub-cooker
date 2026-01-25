import { ResultAsync } from 'neverthrow';
import * as FileIo from '../../lib/file-io/FileIo';
import { pipe } from '../../lib/util/EffectUtil';
import type { FixedLayoutBookConfiguration, ReflowLayoutBookConfiguration } from '../../value/BookConfiguration';
import type { BookMetadata } from '../../value/BookMetadata';
import type { BookAdditionalMetadata } from '../../value/EpubProject';
import { ItemPath } from '../../value/ItemPath';
import type { ResolvedPath } from '../../value/ResolvedPath';
import type { ProcessedItem } from '../item-loader/loader/value/ProcessedItem';
import { BookMetadataGeneratorError } from './BookMetadataGeneratorError';
import { ContainerMarkupStructure } from './value/ContainerMarkupStructure';
import { IBooksDisplayOptionsMarkupStructure } from './value/IBooksDisplayOptionsMarkupStructure';
import { PackageOpfMarkupStructure } from './value/PackageOpfMarkupStructure';
import type { XmlStructure } from './value/XmlStructure';

export function saveMarkupStructure(
  saveDir: ResolvedPath,
  bookMetadata: BookMetadata,
  bookConfig: FixedLayoutBookConfiguration | ReflowLayoutBookConfiguration,
  bookAdditionalMetadata: BookAdditionalMetadata[],
  items: ProcessedItem[],
) {
  const containerMarkup = new ContainerMarkupStructure();
  const iBooksMarkup = new IBooksDisplayOptionsMarkupStructure();
  const packageMarkup = new PackageOpfMarkupStructure();

  packageMarkup.setMetadata(bookMetadata, bookConfig, bookAdditionalMetadata);
  packageMarkup.setItems(items);

  return ResultAsync.combine([
    doSave(containerMarkup, saveDir),
    doSave(iBooksMarkup, saveDir),
    doSave(packageMarkup, saveDir),
  ])
    .map(() => ({
      bookMetadata,
      bookConfig,
      bookAdditionalMetadata,
    }))
    .mapErr((e) => new BookMetadataGeneratorError(e.path, e));
}

function doSave(markup: XmlStructure, saveDir: ResolvedPath) {
  return pipe(markup.serialize()).asyncAndThen((xmlStr) =>
    FileIo.save(ItemPath.getDestination(markup.itemPath, saveDir), xmlStr),
  );
}
