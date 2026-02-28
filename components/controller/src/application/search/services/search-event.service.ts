import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SovietContract } from 'cooptypes';
import { DocumentSearchService } from '~/infrastructure/search/opensearch.service';
import { GeneratorInfrastructureService } from '~/infrastructure/generator/generator.service';
import { DocumentInteractor } from '~/application/document/interactors/document.interactor';
import type { IAction } from '~/types/common';

/**
 * Сервис индексации документов по событию blockchain.
 * Слушает action::soviet::newsubmitted — подписанные и принятые документы.
 */
@Injectable()
export class SearchEventService implements OnModuleInit {
  private readonly logger = new Logger(SearchEventService.name);

  constructor(
    private readonly documentSearch: DocumentSearchService,
    private readonly generatorService: GeneratorInfrastructureService,
    private readonly documentInteractor: DocumentInteractor,
  ) {}

  async onModuleInit() {
    if (this.documentSearch.isAvailable()) {
      // Запускаем асинхронную ре-индексацию при старте
      this.reindexAllDocuments().catch((err) => {
        this.logger.error(`Ошибка при фоновой ре-индексации: ${err.message}`);
      });
    }
  }

  /**
   * Метод полной ре-индексации только документов типа newsubmitted из блокчейна.
   * Собирает агрегаты для получения полного содержимого документа.
   */
  async reindexAllDocuments(): Promise<void> {
    this.logger.log('Начало полной ре-индексации документов (newsubmitted)...');
    let totalIndexed = 0;
    let currentPage = 1;
    const limit = 100;

    try {
      while (true) {
        const result = await this.documentInteractor.getDocumentsAggregate({
          type: 'newsubmitted',
          page: currentPage,
          limit,
          query: {}, // Обязательное поле согласно GetDocumentsInputDomainInterface
        });

        if (!result.items || result.items.length === 0) {
          break;
        }

        for (const packageAggregate of result.items) {
          // В пакете может быть заявление, решение и акты. Индексируем всё, что есть.
          const aggregatesToindex = [
            packageAggregate.statement?.documentAggregate,
            packageAggregate.decision?.documentAggregate,
            ...packageAggregate.acts.map(act => act.documentAggregate),
            ...packageAggregate.links
          ].filter(Boolean);

          for (const aggregate of aggregatesToindex) {
            const doc = aggregate?.rawDocument;
            const signedDoc = aggregate?.document;

            if (!doc || !signedDoc) continue;

            try {
              await this.documentSearch.indexDocument({
                hash: doc.hash,
                full_title: doc.full_title || '',
                html: doc.html || '',
                username: doc.meta?.username || signedDoc.meta?.username || '',
                coopname: doc.meta?.coopname || signedDoc.meta?.coopname || '',
                registry_id: doc.meta?.registry_id || signedDoc.meta?.registry_id || 0,
                created_at: doc.meta?.created_at || signedDoc.meta?.created_at || '',
              });
              totalIndexed++;
            } catch (docError: any) {
              this.logger.warn(`Ошибка индексации документа ${doc.hash}: ${docError.message}`);
            }
          }
        }

        if (currentPage >= result.totalPages) {
          break;
        }
        currentPage++;
      }

      this.logger.log(`Ре-индексация завершена. Проиндексировано документов: ${totalIndexed}`);
    } catch (error: any) {
      this.logger.error(`Ошибка при ре-индексации документов: ${error.message}`);
    }
  }

  @OnEvent(`action::${SovietContract.contractName.production}::${SovietContract.Actions.Registry.NewSubmitted.actionName}`)
  async onDocumentSubmitted(action: IAction): Promise<void> {
    if (!this.documentSearch.isAvailable()) return;

    try {
      const docHash = action.data?.document?.hash;
      if (!docHash) {
        this.logger.debug('Событие newsubmitted без хеша документа, пропускаем');
        return;
      }

      const document = await this.generatorService.getDocument({ hash: docHash });
      if (!document) {
        this.logger.debug(`Документ ${docHash.substring(0, 8)} не найден в MongoDB`);
        return;
      }

      await this.documentSearch.indexDocument({
        hash: document.hash,
        full_title: document.full_title || '',
        html: document.html || '',
        username: document.meta?.username || action.data?.username || '',
        coopname: document.meta?.coopname || action.data?.coopname || '',
        registry_id: document.meta?.registry_id || 0,
        created_at: document.meta?.created_at || '',
      });

      this.logger.log(`Документ проиндексирован: ${document.full_title?.substring(0, 50)}`);
    } catch (error: any) {
      this.logger.warn(`Ошибка индексации документа по событию newsubmitted: ${error?.message}`);
    }
  }
}
