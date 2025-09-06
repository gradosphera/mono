import { Injectable } from '@nestjs/common';
import { Cooperative } from 'cooptypes';
import moment from 'moment';
import config from '~/config/config';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

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
  convertSignedDocumentToBlockchainFormat(document: ISignedDocumentDomainInterface): Cooperative.Document.IChainDocument2 {
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
   * Преобразует документ из блокчейна в доменный интерфейс
   * @param chainDoc Документ из блокчейна
   * @returns Документ в доменном формате
   */
  convertBlockchainDocumentToDomainFormat(chainDoc: Cooperative.Document.IChainDocument2): ISignedDocumentDomainInterface {
    return {
      version: chainDoc.version,
      hash: chainDoc.hash,
      doc_hash: chainDoc.doc_hash,
      meta_hash: chainDoc.meta_hash,
      meta: typeof chainDoc.meta === 'string' ? (chainDoc.meta === '' ? {} : JSON.parse(chainDoc.meta)) : chainDoc.meta,
      signatures: chainDoc.signatures,
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
   * Форматирование quantity с проверкой символа и использованием precision из конфига
   * @param quantity Строка в формате "число символ" (например, "100.0 AXON")
   * @returns Отформатированная строка quantity для блокчейна
   */
  formatQuantityWithPrecision(quantity: string): string {
    // Извлекаем число и символ
    const parts = quantity.split(' ');
    if (parts.length !== 2) {
      throw new Error(`Неверный формат quantity: ${quantity}. Ожидается "число символ"`);
    }

    const [amount, symbol] = parts;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount)) {
      throw new Error(`Некорректное числовое значение в quantity: ${amount}`);
    }

    // Проверяем символ на соответствие с конфигом
    let precision: number;
    if (symbol === config.blockchain.root_symbol) {
      precision = config.blockchain.root_precision;
    } else if (symbol === config.blockchain.root_govern_symbol) {
      precision = config.blockchain.root_govern_precision;
    } else {
      throw new Error(
        `Неподдерживаемый символ: ${symbol}. Поддерживаются только: ${config.blockchain.root_symbol}, ${config.blockchain.root_govern_symbol}`
      );
    }

    // Форматируем к необходимому количеству знаков после запятой
    const formattedAmount = numericAmount.toFixed(precision);

    return `${formattedAmount} ${symbol}`;
  }

  /**
   * Преобразует объект IChainDocument2 в ISignedDocument2 (для совместимости)
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
      meta: typeof chainDoc.meta === 'string' ? (chainDoc.meta === '' ? {} : JSON.parse(chainDoc.meta)) : chainDoc.meta,
      signatures: chainDoc.signatures,
    };
  }

  /**
   * Преобразует документ из блокчейна в доменный интерфейс (правильная версия)
   * @param chainDoc Документ из блокчейна
   * @returns Документ в доменном формате
   */
  static convertChainDocumentToDomainFormat(chainDoc: Cooperative.Document.IChainDocument2): ISignedDocumentDomainInterface {
    return {
      version: chainDoc.version,
      hash: chainDoc.hash,
      doc_hash: chainDoc.doc_hash,
      meta_hash: chainDoc.meta_hash,
      meta: typeof chainDoc.meta === 'string' ? (chainDoc.meta === '' ? {} : JSON.parse(chainDoc.meta)) : chainDoc.meta,
      signatures: chainDoc.signatures,
    };
  }
}
