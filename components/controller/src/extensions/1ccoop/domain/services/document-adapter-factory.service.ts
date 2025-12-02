import { Injectable, Inject, forwardRef } from '@nestjs/common';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';
import type { OneCoopDocumentOutputInterface } from '../interfaces/oneccoop-document-output.interface';
import { OneCoopDocumentAction, SUPPORTED_DOCUMENT_ACTIONS } from '../enums/oneccoop-document-action.enum';
import { JoinCoopDocumentAdapter } from '../adapters/joincoop-document.adapter';
import type { BaseDocumentAdapter } from '../adapters/base-document.adapter';

/**
 * Фабрика адаптеров документов 1CCoop
 * Маршрутизирует обработку пакетов документов на соответствующие адаптеры
 */
@Injectable()
export class DocumentAdapterFactoryService {
  private readonly adapters: Map<OneCoopDocumentAction, BaseDocumentAdapter<unknown>>;

  constructor(
    @Inject(forwardRef(() => JoinCoopDocumentAdapter))
    private readonly joinCoopAdapter: JoinCoopDocumentAdapter
  ) {
    // Регистрируем все доступные адаптеры
    this.adapters = new Map<OneCoopDocumentAction, BaseDocumentAdapter<unknown>>([
      [OneCoopDocumentAction.JOINCOOP, this.joinCoopAdapter],
    ]);
  }

  /**
   * Получает список поддерживаемых типов действий
   */
  getSupportedActions(): OneCoopDocumentAction[] {
    return SUPPORTED_DOCUMENT_ACTIONS;
  }

  /**
   * Обрабатывает пакет документов и возвращает данные в формате 1CCoop
   * @param packageAggregate Агрегат пакета документов
   * @param action Тип действия документа
   * @param blockNum Номер блока
   * @returns Документ в формате 1CCoop или null
   */
  async adaptDocument(
    packageAggregate: DocumentPackageAggregateDomainInterface,
    action: OneCoopDocumentAction,
    blockNum: number
  ): Promise<OneCoopDocumentOutputInterface<unknown> | null> {
    const adapter = this.adapters.get(action);

    if (!adapter) {
      console.warn(`[1CCoop] Адаптер для действия "${action}" не найден`);
      return null;
    }

    return adapter.adapt(packageAggregate, blockNum);
  }

  /**
   * Проверяет, поддерживается ли тип действия
   */
  isActionSupported(action: string): action is OneCoopDocumentAction {
    return SUPPORTED_DOCUMENT_ACTIONS.includes(action as OneCoopDocumentAction);
  }
}
