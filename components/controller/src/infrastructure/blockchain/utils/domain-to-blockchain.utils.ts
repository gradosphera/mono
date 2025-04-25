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
    document: Cooperative.Document.ISignedDocument
  ): Cooperative.Document.IChainDocument {
    return {
      hash: document.hash,
      public_key: document.public_key,
      signature: document.signature,
      meta: JSON.stringify(document.meta),
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
}
