import { ItemPath } from '../../../value/ItemPath';
import { XmlStructure } from './XmlStructure';

/** @internal */
export class ContainerMarkupStructure extends XmlStructure {
  readonly content = {
    container: {
      $: { version: '1.0', xmlns: 'urn:oasis:names:tc:opendocument:xmlns:container' },
      rootfiles: [
        { rootfile: [{ $: { 'full-path': 'OPS/package.opf', 'media-type': 'application/oebps-package+xml' } }] },
      ],
    },
  };
  readonly itemPath = ItemPath('META-INF/container.xml');
}
