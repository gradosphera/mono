import { Injectable } from '@nestjs/common';
import { Cooperative } from 'cooptypes';
import moment from 'moment';

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
  convertSignedDocumentToBlockchainFormat(
    document: Cooperative.Document.ISignedDocument2
  ): Cooperative.Document.IChainDocument2 {
    return {
      version: document.version,
      hash: document.hash,
      doc_hash: document.doc_hash,
      meta_hash: document.meta_hash,
      meta: JSON.stringify(document.meta),
      signatures: document.signatures,
    };
  }

  /**
   * Преобразует Date в формат EOSIO time_point_sec для блокчейна
   * @param date Дата или строка с датой
   * @returns Строка в формате EOSIO time_point_sec (YYYY-MM-DDTHH:mm:ss.SSS)
   */
  convertDateToBlockchainFormat(date: Date | string): string {
    return moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS');
  }

  /**
   * Преобразует объект IChainDocument2 в ISignedDocument2
   * @param chainDoc Документ из блокчейна
   * @returns Документ в формате ISignedDocument2
   */
  static convertChainDocumentToSignedDocument2(
    chainDoc: Cooperative.Document.IChainDocument2
  ): Cooperative.Document.ISignedDocument2 {
    return {
      version: chainDoc.version,
      hash: chainDoc.hash,
      doc_hash: chainDoc.doc_hash,
      meta_hash: chainDoc.meta_hash,
      meta: typeof chainDoc.meta === 'string' ? JSON.parse(chainDoc.meta) : chainDoc.meta,
      signatures: chainDoc.signatures,
    };
  }
}
