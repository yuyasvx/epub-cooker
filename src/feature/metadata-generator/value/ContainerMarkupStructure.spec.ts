import { describe, expect, test } from 'vitest';
import { ContainerMarkupStructure } from './ContainerMarkupStructure';

describe('ContainerMarkupStructure', () => {
  test('META-INF/container.xmlの内容が生成できる', () => {
    const containerXml = new ContainerMarkupStructure();

    expect(containerXml.serialize()).toBe(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
    );
  });
});
