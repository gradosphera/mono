import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SovietContract } from 'cooptypes';
import { GeneratorInfrastructureService } from '~/infrastructure/generator/generator.service';
import {
  SIGNED_DOCUMENT_REPOSITORY,
  type SignedDocumentRepository,
  type SignedDocumentUpsertInput,
} from '~/domain/document/repository/signed-document.repository';
import { SignedDocumentStatus } from '~/domain/document/enums/signed-document-status.enum';
import config from '~/config/config';
import type { IAction } from '~/types/common';

const SOVIET = SovietContract.contractName.production;

export type IngestResult = 'created' | 'updated' | 'skipped';

/**
 * Наполнение реестра подписанных документов (Postgres-проекция, C28-21).
 *
 * Источник — внутренняя событийная шина (EventEmitter2). Парсер ретранслирует blockchain-события
 * контракта soviet как `action::soviet::*`; мы подписываемся и обновляем PG-сущность.
 * Парсер при этом не трогаем (parser1→parser2 прозрачно для подписчика).
 */
@Injectable()
export class SignedDocumentIngestionService {
  private readonly logger = new Logger(SignedDocumentIngestionService.name);

  constructor(
    @Inject(SIGNED_DOCUMENT_REPOSITORY) private readonly repository: SignedDocumentRepository,
    private readonly generator: GeneratorInfrastructureService
  ) {}

  @OnEvent(`action::${SOVIET}::${SovietContract.Actions.Registry.NewSubmitted.actionName}`)
  async onNewSubmitted(action: IAction): Promise<void> {
    await this.safeIngest(action, SignedDocumentStatus.Submitted, 'newsubmitted');
  }

  @OnEvent(`action::${SOVIET}::${SovietContract.Actions.Registry.NewResolved.actionName}`)
  async onNewResolved(action: IAction): Promise<void> {
    await this.safeIngest(action, SignedDocumentStatus.Resolved, 'newresolved');
  }

  // ВНИМАНИЕ: `newdeclined` пока не экспортирован как registry-action в cooptypes
  // (есть только интерфейс INewdeclined). Подписываемся по строке-литералу на будущее —
  // как только действие начнёт приходить на шину, статус declined будет ловиться (см. C28-21).
  @OnEvent(`action::${SOVIET}::newdeclined`)
  async onNewDeclined(action: IAction): Promise<void> {
    await this.safeIngest(action, SignedDocumentStatus.Declined, 'newdeclined');
  }

  /**
   * Идемпотентно записывает действие в реестр.
   * Используется и листенерами шины, и backfill'ом.
   */
  async ingestAction(action: IAction, status: SignedDocumentStatus): Promise<IngestResult> {
    const data = (action?.data ?? {}) as Record<string, any>;
    const packageHash: string | undefined = data.package;
    const docHash: string | undefined = data.document?.hash;
    if (!packageHash || !docHash) return 'skipped';

    const coopname: string = data.coopname || config.coopname;
    const current = await this.repository.getStatus(coopname, packageHash);

    // Не понижаем статус: submitted не перетирает уже resolved/declined.
    if (status === SignedDocumentStatus.Submitted && current && current !== SignedDocumentStatus.Submitted) {
      return 'skipped';
    }
    // Тот же статус уже стоит — идемпотентно выходим (повторный backfill безопасен).
    if (current === status) return 'skipped';

    // Запись есть и это смена статуса (не submitted) — меняем поле без перезагрузки контента.
    if (current && status !== SignedDocumentStatus.Submitted) {
      const ok = await this.repository.setStatus(coopname, packageHash, status);
      if (ok) return 'updated';
    }

    const input = await this.buildInput(action, status, coopname, packageHash, docHash);
    await this.repository.upsert(input);
    return current ? 'updated' : 'created';
  }

  private async safeIngest(action: IAction, status: SignedDocumentStatus, label: string): Promise<void> {
    try {
      const result = await this.ingestAction(action, status);
      if (result !== 'skipped') {
        this.logger.log(`[${label}] запись реестра ${result}: package=${action?.data?.package?.substring?.(0, 8)}`);
      }
    } catch (error: any) {
      this.logger.warn(`Ошибка ingestion события ${label}: ${error?.message}`);
    }
  }

  private async buildInput(
    action: IAction,
    status: SignedDocumentStatus,
    coopname: string,
    packageHash: string,
    docHash: string
  ): Promise<SignedDocumentUpsertInput> {
    let doc: Awaited<ReturnType<GeneratorInfrastructureService['getDocument']>> = null;
    try {
      doc = await this.generator.getDocument({ hash: docHash });
    } catch (error: any) {
      this.logger.debug(`Документ ${docHash.substring(0, 8)} не получен из MongoDB: ${error?.message}`);
    }

    const meta = (doc?.meta ?? {}) as Record<string, any>;
    const html = doc?.html ?? '';

    return {
      coopname,
      packageHash,
      hash: docHash,
      username: meta.username || (action?.data?.username as string) || '',
      status,
      registry_id: typeof meta.registry_id === 'number' ? meta.registry_id : 0,
      full_title: doc?.full_title ?? '',
      content_text: this.stripHtml(html),
      html: html || null,
      pdf: this.toPdfBuffer(doc?.binary),
      block_num: this.resolveBlockNum(meta.block_num, action?.block_num),
      document_aggregate: null,
      meta: doc?.meta ? (doc.meta as unknown as Record<string, unknown>) : null,
      document_created_at: meta.created_at ? new Date(meta.created_at) : null,
    };
  }

  private resolveBlockNum(metaBlockNum: unknown, actionBlockNum: unknown): string | null {
    if (metaBlockNum !== undefined && metaBlockNum !== null) return String(metaBlockNum);
    if (actionBlockNum !== undefined && actionBlockNum !== null) return String(actionBlockNum);
    return null;
  }

  private toPdfBuffer(binary: unknown): Buffer | null {
    if (!binary) return null;
    try {
      const anyBin = binary as any;
      if (Buffer.isBuffer(anyBin)) return anyBin;
      // BSON Binary хранит байты в .buffer; Uint8Array/ArrayBuffer Buffer.from принимает напрямую.
      return Buffer.from(anyBin.buffer ?? anyBin);
    } catch {
      return null;
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
