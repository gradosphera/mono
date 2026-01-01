import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DocumentDataPort, DOCUMENT_DATA_PORT } from '~/domain/document/ports/document-data.port';
import { DocumentAction } from '~/domain/document/enums/document-action.enum';
import { DocumentAdapterFactoryService } from '../../domain/services/document-adapter-factory.service';
import type { GetOneCoopDocumentsInputInterface } from '../../domain/interfaces/get-oneccoop-documents-input.interface';
import type { OneCoopDocumentOutputInterface } from '../../domain/interfaces/oneccoop-document-output.interface';
import { OneCoopDocumentAction, SUPPORTED_DOCUMENT_ACTIONS } from '../../domain/enums/oneccoop-document-action.enum';
import { config } from '~/config';

/**
 * Интерфейс результата извлечения документов
 */
export interface OneCoopDocumentsResult {
  items: OneCoopDocumentOutputInterface<unknown>[];
  total_count: number;
  total_pages: number;
  current_page: number;
  max_block_num: number;
}

/**
 * Application сервис для работы с документами 1CCoop
 * Координирует извлечение и обработку документов
 */
@Injectable()
export class OneCoopApplicationService {
  constructor(
    @Inject(DOCUMENT_DATA_PORT)
    private readonly documentPort: DocumentDataPort,
    @Inject(forwardRef(() => DocumentAdapterFactoryService))
    private readonly adapterFactory: DocumentAdapterFactoryService
  ) {}

  /**
   * Получает документы для синхронизации с 1С
   * @param input Параметры запроса
   * @returns Пагинированный результат с документами в формате 1CCoop
   */
  async getDocuments(input: GetOneCoopDocumentsInputInterface): Promise<OneCoopDocumentsResult> {
    const { block_from, block_to, page = 1, limit = 100 } = input;

    // Преобразуем наши действия в DocumentAction для запроса
    const actions = this.mapToDocumentActions(SUPPORTED_DOCUMENT_ACTIONS);

    // Извлекаем документы через порт
    const documentsResult = await this.documentPort.getDocumentsAggregate({
      type: 'newresolved', // Только утверждённые документы
      actions,
      after_block: block_from,
      before_block: block_to,
      page,
      limit,
      query: {
        receiver: config.coopname,
      },
    });

    // Обрабатываем каждый пакет через фабрику адаптеров
    const processedDocuments: OneCoopDocumentOutputInterface<unknown>[] = [];
    let maxBlockNum = block_from;

    for (const packageAggregate of documentsResult.items) {
      // Получаем action из statement
      const actionName = packageAggregate.statement?.action?.data?.action as string | undefined;

      if (!actionName || !this.adapterFactory.isActionSupported(actionName)) {
        continue;
      }

      // Получаем block_num из action
      const blockNum = packageAggregate.statement?.action?.block_num || 0;

      // Обрабатываем документ через адаптер
      const adapted = await this.adapterFactory.adaptDocument(
        packageAggregate,
        actionName as OneCoopDocumentAction,
        blockNum
      );

      if (adapted) {
        processedDocuments.push(adapted);

        // Обновляем максимальный номер блока
        if (blockNum > maxBlockNum) {
          maxBlockNum = blockNum;
        }
      }
    }

    return {
      items: processedDocuments,
      total_count: documentsResult.totalCount,
      total_pages: documentsResult.totalPages,
      current_page: documentsResult.currentPage,
      max_block_num: maxBlockNum,
    };
  }

  /**
   * Преобразует OneCoopDocumentAction в DocumentAction
   */
  private mapToDocumentActions(actions: OneCoopDocumentAction[]): DocumentAction[] {
    const mapping: Record<OneCoopDocumentAction, DocumentAction> = {
      [OneCoopDocumentAction.JOINCOOP]: DocumentAction.JOINCOOP,
    };

    return actions.map((action) => mapping[action]).filter(Boolean);
  }
}
