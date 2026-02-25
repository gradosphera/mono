import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SovietContract } from 'cooptypes';
import { DocumentSearchService } from '~/infrastructure/search/opensearch.service';
import { GeneratorInfrastructureService } from '~/infrastructure/generator/generator.service';
import type { IAction } from '~/types/common';

/**
 * Сервис индексации документов по событию blockchain.
 * Слушает action::soviet::newsubmitted — подписанные и принятые документы.
 */
@Injectable()
export class SearchEventService {
  private readonly logger = new Logger(SearchEventService.name);

  constructor(
    private readonly documentSearch: DocumentSearchService,
    private readonly generatorService: GeneratorInfrastructureService,
  ) {}

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
