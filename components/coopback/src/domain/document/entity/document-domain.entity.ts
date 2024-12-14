import type { Cooperative } from 'cooptypes';

export class DocumentDomainEntity implements Cooperative.Document.IGeneratedDocument {
  full_title?: string;
  html: string;
  hash: string;
  meta: Cooperative.Document.IMetaDocument & { [key: string]: any };
  binary: Uint8Array;

  constructor(data: Cooperative.Document.IGeneratedDocument) {
    this.full_title = data.full_title;
    this.html = data.html;
    this.hash = data.hash;
    this.meta = data.meta;
    this.binary = data.binary;
  }

  // Дополнительные методы, если они нужны
  getMetaField(field: string): unknown {
    return this.meta[field];
  }

  validateHash(expectedHash: string): boolean {
    return this.hash === expectedHash;
  }

  toDTO(): Cooperative.Document.IGeneratedDocument {
    return {
      full_title: this.full_title,
      html: this.html,
      hash: this.hash,
      meta: this.meta,
      binary: this.binary,
    };
  }
}
