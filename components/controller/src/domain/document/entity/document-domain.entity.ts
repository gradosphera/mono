import type { Cooperative } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '../interfaces/generated-document-domain.interface';

export class DocumentDomainEntity implements GeneratedDocumentDomainInterface {
  full_title: string;
  html: string;
  hash: string;
  meta: Cooperative.Document.IMetaDocument & { [key: string]: any };
  binary: string; // Хранится как строка (Base64)

  constructor(data: Cooperative.Document.IGeneratedDocument) {
    this.full_title = data.full_title;
    this.html = data.html;
    this.hash = data.hash;
    this.meta = data.meta;
    this.binary = Buffer.from(data.binary).toString('base64'); // Преобразуем Uint8Array в Base64 строку
  }

  toDTO(): Cooperative.Document.IGeneratedDocument {
    return {
      full_title: this.full_title,
      html: this.html,
      hash: this.hash,
      meta: this.meta,
      binary: Buffer.from(this.binary, 'base64'), // Преобразуем обратно в Uint8Array
    };
  }
}
