/** @internal */
export type MetadataPartialStructure = {
  $: {
    'xmlns:opf': 'http://www.idpf.org/2007/opf';
    'xmlns:dc': 'http://purl.org/dc/elements/1.1/';
    'xmlns:dcterms': 'http://purl.org/dc/terms/';
  };
  'dc:title': [{ _: string; $: { id: string } }];
  'dc:creator'?: [{ $: { id: 'creator' }; _: string }];
  'dc:publisher'?: [string];
  'dc:date'?: [string];
  'dc:language'?: [{ $: { id: 'language' }; _: string }];
  'dc:identifier'?: [{ $: { id: 'book-id' }; _: string }];
  meta: MetadataEntry[];
};

/** @internal */
export type MetadataEntry<V = unknown> = Readonly<{
  _: V;
  $: { property: string };
}>;
