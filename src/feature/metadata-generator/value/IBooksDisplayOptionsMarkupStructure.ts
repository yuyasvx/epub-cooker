import { ItemPath } from '../../../value/ItemPath';
import { XmlStructure } from './XmlStructure';

/** @internal */
export class IBooksDisplayOptionsMarkupStructure extends XmlStructure {
  readonly content = {
    display_options: { platform: [{ $: { name: '*' }, option: [{ _: 'true', $: { name: 'specified-fonts' } }] }] },
  } as const;
  readonly itemPath = ItemPath('META-INF/com.apple.ibooks.display-options.xml');
}
