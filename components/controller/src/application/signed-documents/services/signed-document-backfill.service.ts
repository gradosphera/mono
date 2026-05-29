import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { SignedDocumentStatus } from '~/domain/document/enums/signed-document-status.enum';
import { SignedDocumentIngestionService } from './signed-document-ingestion.service';
import type { IAction } from '~/types/common';

export interface BackfillStats {
  scanned: number;
  created: number;
  updated: number;
  skipped: number;
}

interface BackfillPass {
  type: string;
  status: SignedDocumentStatus;
}

// Порядок важен: сперва базовые записи (submitted/resolved), затем смена статусов поверх.
const PASSES: BackfillPass[] = [
  { type: 'newsubmitted', status: SignedDocumentStatus.Submitted },
  { type: 'newresolved', status: SignedDocumentStatus.Resolved },
  // newdeclined пока не приходит как registry-action (см. C28-21); пройдёт пустым — это безопасно.
  { type: 'newdeclined', status: SignedDocumentStatus.Declined },
];

const PAGE_LIMIT = 100;

/**
 * Разовый backfill реестра подписанных документов (C28-21).
 *
 * Сканирует все действия soviet (newsubmitted/newresolved/newdeclined) через explorer-источник,
 * для каждого достаёт документ из factory-Mongo и складывает в Postgres-проекцию.
 * Идемпотентен по (coopname, package) — повторный прогон безопасен.
 *
 * Запуск — по флагу окружения `SIGNED_DOCS_BACKFILL_ON_BOOT=true` (operator opt-in), детачем,
 * чтобы не блокировать старт приложения. Метод `run()` пригоден и для отдельного CLI-энтрипойнта.
 */
@Injectable()
export class SignedDocumentBackfillService implements OnModuleInit {
  private readonly logger = new Logger(SignedDocumentBackfillService.name);

  constructor(
    private readonly documentDomainService: DocumentDomainService,
    private readonly ingestion: SignedDocumentIngestionService
  ) {}

  onModuleInit(): void {
    if (process.env.SIGNED_DOCS_BACKFILL_ON_BOOT === 'true') {
      this.run().catch((error) => {
        this.logger.error(`Ошибка фонового backfill реестра: ${error?.message}`);
      });
    }
  }

  async run(): Promise<BackfillStats> {
    const stats: BackfillStats = { scanned: 0, created: 0, updated: 0, skipped: 0 };
    this.logger.log('Старт backfill реестра подписанных документов...');

    for (const pass of PASSES) {
      await this.runPass(pass, stats);
    }

    this.logger.log(
      `Backfill завершён. scanned=${stats.scanned} created=${stats.created} updated=${stats.updated} skipped=${stats.skipped}`
    );
    return stats;
  }

  private async runPass(pass: BackfillPass, stats: BackfillStats): Promise<void> {
    let page = 1;

    while (true) {
      const response = await this.documentDomainService.getImmutableSignedDocuments({
        type: pass.type,
        query: {},
        page,
        limit: PAGE_LIMIT,
      });

      const results = (response?.results ?? []) as unknown as IAction[];
      if (results.length === 0) break;

      for (const action of results) {
        stats.scanned++;
        const result = await this.ingestion.ingestAction(action, pass.status);
        stats[result === 'created' ? 'created' : result === 'updated' ? 'updated' : 'skipped']++;
      }

      if (results.length < PAGE_LIMIT) break;
      page++;
    }
  }
}
