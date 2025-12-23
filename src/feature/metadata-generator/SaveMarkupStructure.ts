import { ResultAsync } from 'neverthrow';
import * as FileIo from '../../lib/file-io/FileIo';
import { pipe } from '../../lib/util/EffectUtil';
import type { EpubProjectV2 } from '../../value/EpubProject';
import { ItemPath } from '../../value/ItemPath';
import type { ResolvedPath } from '../../value/ResolvedPath';
import type { ProcessedItem } from '../item-loader/loader/value/ProcessedItem';
import { ContainerMarkupStructure } from './value/ContainerMarkupStructure';
import { IBooksDisplayOptionsMarkupStructure } from './value/IBooksDisplayOptionsMarkupStructure';
import { PackageOpfMarkupStructure } from './value/PackageOpfMarkupStructure';
import type { XmlStructure } from './value/XmlStructure';

export function saveMarkupStructure(saveDir: ResolvedPath, project: EpubProjectV2, items: ProcessedItem[]) {
  const containerMarkup = new ContainerMarkupStructure();
  const iBooksMarkup = new IBooksDisplayOptionsMarkupStructure();
  const packageMarkup = new PackageOpfMarkupStructure();

  packageMarkup.setMetadata(project);
  packageMarkup.setItems(items);

  return ResultAsync.combine([
    doSave(containerMarkup, saveDir),
    doSave(iBooksMarkup, saveDir),
    doSave(packageMarkup, saveDir),
  ]).map(() => project);
}

function doSave(markup: XmlStructure, saveDir: ResolvedPath) {
  return pipe(markup.serialize()).asyncAndThen((xmlStr) =>
    FileIo.save(ItemPath.getDestination(markup.itemPath, saveDir), xmlStr),
  );
}
