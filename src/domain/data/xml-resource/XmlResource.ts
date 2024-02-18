import xml2js from "xml2js";
import { MarkupDefinition } from "../../prototype/MarkupDefinition";

export abstract class XmlResource {
  abstract readonly path: string;
  protected abstract resource: MarkupDefinition;

  public toXml() {
    const builder = new xml2js.Builder();
    // const sourceStr = JSON.stringify(this.resource.content);
    return builder.buildObject(this.resource.content);
  }
}
