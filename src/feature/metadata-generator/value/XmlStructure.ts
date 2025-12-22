import xml2js from 'xml2js';
import type { ItemPath } from '../../../value/ItemPath';

/**
 * @internal
 * XML文書をデシリアライズして構造化したもの
 */
export abstract class XmlStructure {
  private readonly builder = new xml2js.Builder();
  abstract readonly content: object;
  abstract readonly itemPath: ItemPath;

  serialize() {
    return this.builder.buildObject(this.content);
  }
}
