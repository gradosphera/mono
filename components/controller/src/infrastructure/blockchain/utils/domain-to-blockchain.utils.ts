import { Injectable } from '@nestjs/common';
import { Cooperative } from 'cooptypes';
import { SignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Утилитарный класс для конвертации доменных объектов в инфраструктурные типы блокчейна
 */
@Injectable()
export class DomainToBlockchainUtils {
  /**
   * Преобразует доменный объект SignedDocument в формат блокчейна
   * @param document Доменный объект подписанного документа
   * @returns Объект документа в формате блокчейна
   */
  convertSignedDocumentToBlockchainFormat<T>(
    document: SignedDocumentDomainInterface<T>
  ): Cooperative.Document.ISignedDocument {
    return {
      hash: document.hash,
      public_key: document.public_key,
      signature: document.signature,
      meta: JSON.stringify(document.meta),
    };
  }

  /**
   * Преобразует Date в формат ISO строки для блокчейна
   * @param date Дата
   * @returns Строка в формате ISO
   */
  convertDateToBlockchainFormat(date: Date | string): string {
    return date instanceof Date ? date.toISOString() : date;
  }
}
