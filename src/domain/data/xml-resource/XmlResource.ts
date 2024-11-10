import xml2js from "xml2js";

export abstract class XmlResource {
  abstract readonly path: string;
  protected abstract resource: MarkupDefinition;

  public toXml() {
    const builder = new xml2js.Builder();
    return builder.buildObject(this.resource.content);
  }
}

export interface MarkupDefinition<T = unknown> {
  decleration: string;
  content: T;
}
