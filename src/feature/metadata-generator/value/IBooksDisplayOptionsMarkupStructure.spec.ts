import { describe, expect, test } from 'vitest';
import { IBooksDisplayOptionsMarkupStructure } from './IBooksDisplayOptionsMarkupStructure';

describe('IBooksDisplayOptionsMarkupStructure', () => {
  test('META-INF/com.apple.ibooks.display-options.xmlの内容が生成できる', () => {
    const xml = new IBooksDisplayOptionsMarkupStructure();

    expect(xml.serialize()).toBe(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<display_options>
  <platform name="*">
    <option name="specified-fonts">true</option>
  </platform>
</display_options>`,
    );
  });
});
