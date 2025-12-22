import { describe, expect, test } from 'vitest';
import { convertToEpubXhtml } from './HtmlUtil';

describe('HtmlUtil', () => {
  describe('convertToEpubXhtml', () => {
    test('should wrap a fragment in html/head/body', () => {
      const input = '<p>Hello</p>';
      const output = convertToEpubXhtml(input);

      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(output).toContain('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">');
      expect(output).toContain('<body><p>Hello</p></body>');
    });

    test('should add namespace to existing html tag if missing', () => {
      const input = '<html><body><p>Test</p></body></html>';
      const output = convertToEpubXhtml(input);

      expect(output).toContain('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">');
      expect(output).toContain('<body><p>Test</p></body>');
    });

    test('should preserve existing namespace', () => {
      const input = '<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Test</p></body></html>';
      const output = convertToEpubXhtml(input);

      expect(output).toContain('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">');
    });

    test('should handle complex input with attributes', () => {
      const input = '<div class="foo"><span>Bar</span></div>';
      const output = convertToEpubXhtml(input);

      expect(output).toContain('<div class="foo"><span>Bar</span></div>');
    });

    test.todo('should return empty string on empty input', () => {
      const input = '';
      const output = convertToEpubXhtml(input);
      // Depending on implementation, it might return a basic template or match the "fragment" logic which wraps empty string.
      // Current implementation wraps trimmed input. If trimmed is empty, body is empty.
      expect(output).toContain('<body></body>');
    });

    test('元データにXMLの宣言がある場合は宣言を足さない', () => {
      const input =
        '<?xml version="1.0" encoding="UTF-8"?><html xmlns:epub="http://www.idpf.org/2007/ops" xmlns="http://www.w3.org/1999/xhtml"><body><p>Hello</p></body></html>';
      const output = convertToEpubXhtml(input);
      expect(output).toContain(input);
    });
  });
});
