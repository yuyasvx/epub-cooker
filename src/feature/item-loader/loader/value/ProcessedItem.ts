import mime from 'mime-types';
import { v4 } from 'uuid';
import type { PageSpreadPositionType } from '../../../../enums/PageSpreadPositionType';
import type { ProcessedItemType } from '../enums/ProcessedItemType';

export type ProcessedItem = Readonly<{
  itemId: string;
  mimeType: string;
  itemType: ProcessedItemType;
  itemPath: string;
  fileSizeByte: number;
  spreadPosition: PageSpreadPositionType;
}>;

export function ProcessedItem(
  itemType: ProcessedItemType,
  itemPath: string,
  fileSizeByte: number,
  spreadPosition: PageSpreadPositionType,
): ProcessedItem {
  const mimeType = mime.lookup(itemPath);
  return {
    itemId: generateId(),
    mimeType: mimeType ? mimeType : 'application/octet-stream',
    itemType,
    itemPath,
    fileSizeByte,
    spreadPosition,
  };
}

function generateId() {
  // IDというかXMLの名前空間としてNCNameというのに準拠してないとダメらしく、先頭にアンスコを入れると違反しなくなる
  return `_${v4().replaceAll('-', '')}`;
}
