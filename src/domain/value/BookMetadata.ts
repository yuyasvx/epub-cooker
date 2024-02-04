export class BookMetadata {
  constructor(
    public title: string,
    public creator?: string,
    public publisher?: string,
    public language?: string,
    public rights?: string,
    public description?: string,
    public genre?: string,
  ) {}
}
