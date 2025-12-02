import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';
import type { OneCoopDocumentOutputInterface } from '../interfaces/oneccoop-document-output.interface';
import type { OneCoopDocumentAction } from '../enums/oneccoop-document-action.enum';

/**
 * Базовый абстрактный класс для адаптеров документов 1CCoop
 * Каждый тип документа должен иметь свой адаптер, наследующий этот класс
 */
export abstract class BaseDocumentAdapter<T> {
  /**
   * Тип действия, обрабатываемый этим адаптером
   */
  abstract readonly action: OneCoopDocumentAction;

  /**
   * Преобразует агрегат пакета документов в выходной формат 1CCoop
   * @param packageAggregate Агрегат пакета документов из системы
   * @param blockNum Номер блока
   * @returns Документ в формате 1CCoop или null если обработка невозможна
   */
  abstract adapt(
    packageAggregate: DocumentPackageAggregateDomainInterface,
    blockNum: number
  ): Promise<OneCoopDocumentOutputInterface<T> | null>;

  /**
   * Извлекает числовое значение из строки формата "1000.00 RUB"
   * @param asset Строка с суммой и валютой
   * @returns Числовое значение суммы
   */
  protected parseAssetValue(asset: string): number {
    if (!asset) return 0;

    const match = asset.match(/^(\d+\.?\d*)\s*/);
    if (!match) return 0;

    return parseFloat(match[1]);
  }
}
