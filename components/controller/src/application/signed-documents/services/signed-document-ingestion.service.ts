import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cooperative, SovietContract } from 'cooptypes';
import { DocumentPackageAggregator } from '~/domain/document/aggregators/document-package.aggregator';
import {
  SIGNED_DOCUMENT_REPOSITORY,
  type SignedDocumentRepository,
} from '~/domain/document/repository/signed-document.repository';
import { SignedDocumentStatus } from '~/domain/document/enums/signed-document-status.enum';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';
import config from '~/config/config';
import type { IAction } from '~/types/common';

const SOVIET = SovietContract.contractName.production;
const Registry = SovietContract.Actions.Registry;

export type IngestResult = 'created' | 'updated' | 'skipped';

/**
 * Наполнение реестра подписанных документов (Postgres-проекция, C28-21).
 *
 * Источник — внутренняя событийная шина (EventEmitter2): парсер ретранслирует blockchain-события
 * контракта soviet как `action::soviet::*`. На каждое релевантное событие собирается ГОТОВЫЙ агрегат
 * пакета (DocumentPackageAggregator) и кладётся в PG целиком — чтобы getDocuments/поиск работали
 * из Postgres без сборки на лету. Парсер не трогаем (parser1→parser2 прозрачно для подписчика).
 *
 * - newsubmitted/newresolved/newdeclined — несут заявление: пересобираем агрегат + ставим статус;
 * - newdecision/newact/newlink — досборка: пересобираем агрегат по сохранённому действию-носителю,
 *   статус не меняем.
 */
@Injectable()
export class SignedDocumentIngestionService {
  private readonly logger = new Logger(SignedDocumentIngestionService.name);

  constructor(
    @Inject(SIGNED_DOCUMENT_REPOSITORY) private readonly repository: SignedDocumentRepository,
    private readonly aggregator: DocumentPackageAggregator
  ) {}

  @OnEvent(`action::${SOVIET}::${Registry.NewSubmitted.actionName}`)
  async onNewSubmitted(action: IAction): Promise<void> {
    await this.safeStatusEvent(action, SignedDocumentStatus.Submitted, Registry.NewSubmitted.actionName);
  }

  @OnEvent(`action::${SOVIET}::${Registry.NewResolved.actionName}`)
  async onNewResolved(action: IAction): Promise<void> {
    await this.safeStatusEvent(action, SignedDocumentStatus.Resolved, Registry.NewResolved.actionName);
  }

  @OnEvent(`action::${SOVIET}::${Registry.NewDeclined.actionName}`)
  async onNewDeclined(action: IAction): Promise<void> {
    await this.safeStatusEvent(action, SignedDocumentStatus.Declined, Registry.NewDeclined.actionName);
  }

  @OnEvent(`action::${SOVIET}::${Registry.NewDecision.actionName}`)
  async onNewDecision(action: IAction): Promise<void> {
    await this.safeReassemble(action, Registry.NewDecision.actionName);
  }

  @OnEvent(`action::${SOVIET}::${Registry.NewAct.actionName}`)
  async onNewAct(action: IAction): Promise<void> {
    await this.safeReassemble(action, Registry.NewAct.actionName);
  }

  @OnEvent(`action::${SOVIET}::${Registry.NewLink.actionName}`)
  async onNewLink(action: IAction): Promise<void> {
    await this.safeReassemble(action, Registry.NewLink.actionName);
  }

  /**
   * Идемпотентно записывает действие-носитель заявления в реестр.
   * Используется и листенерами шины, и backfill'ом.
   */
  async ingestAction(action: IAction, status: SignedDocumentStatus): Promise<IngestResult> {
    const data = (action?.data ?? {}) as Record<string, any>;
    const packageHash: string | undefined = data.package;
    if (!packageHash) return 'skipped';

    const coopname: string = data.coopname || config.coopname;
    const current = await this.repository.getStatus(coopname, packageHash);

    // Не понижаем статус: submitted не перетирает resolved/declined.
    if (status === SignedDocumentStatus.Submitted && current && current !== SignedDocumentStatus.Submitted) {
      return 'skipped';
    }
    // Тот же статус уже стоит — идемпотентно выходим (повторный backfill безопасен).
    if (current === status) return 'skipped';

    await this.assembleAndUpsert(action, status, coopname, packageHash);
    return current ? 'updated' : 'created';
  }

  private async safeStatusEvent(action: IAction, status: SignedDocumentStatus, label: string): Promise<void> {
    try {
      const result = await this.ingestAction(action, status);
      if (result !== 'skipped') {
        this.logger.log(`[${label}] запись реестра ${result}: package=${this.shortPackage(action)}`);
      }
    } catch (error: any) {
      this.logger.warn(`Ошибка ingestion события ${label}: ${error?.message}`);
    }
  }

  private async safeReassemble(action: IAction, label: string): Promise<void> {
    try {
      const data = (action?.data ?? {}) as Record<string, any>;
      const packageHash: string | undefined = data.package;
      if (!packageHash) return;

      const coopname: string = data.coopname || config.coopname;
      const current = await this.repository.getStatus(coopname, packageHash);
      if (!current) return; // ещё нет заявления по пакету — нечего дособирать

      const source = await this.repository.getSourceActionData(coopname, packageHash);
      if (!source) return;

      await this.assembleAndUpsert(source as unknown as IAction, current, coopname, packageHash);
      this.logger.log(`[${label}] агрегат пересобран: package=${this.shortPackage(action)}`);
    } catch (error: any) {
      this.logger.warn(`Ошибка пересборки агрегата по событию ${label}: ${error?.message}`);
    }
  }

  private async assembleAndUpsert(
    sourceAction: IAction,
    status: SignedDocumentStatus,
    coopname: string,
    packageHash: string
  ): Promise<void> {
    const aggregate = await this.buildAggregateSafe(sourceAction);
    const data = (sourceAction?.data ?? {}) as Record<string, any>;
    const statement = aggregate?.statement;
    const rawDoc = statement?.documentAggregate?.rawDocument;
    const meta = (rawDoc?.meta ?? {}) as Record<string, any>;

    await this.repository.upsert({
      coopname,
      packageHash,
      hash: statement?.documentAggregate?.hash || data.document?.hash || data.document?.doc_hash || '',
      username: meta.username || data.username || '',
      status,
      action: data.action || '',
      registry_id: typeof meta.registry_id === 'number' ? meta.registry_id : 0,
      full_title: rawDoc?.full_title || '',
      content_text: this.stripHtml(rawDoc?.html || ''),
      signers_text: this.collectSignersText(aggregate),
      block_num: this.resolveBlockNum(meta.block_num, sourceAction?.block_num),
      document_created_at: meta.created_at ? new Date(meta.created_at) : null,
      document_aggregate: aggregate,
      source_action_data: sourceAction as unknown as Record<string, unknown>,
    });
  }

  private async buildAggregateSafe(action: IAction): Promise<DocumentPackageAggregateDomainInterface | null> {
    try {
      return await this.aggregator.buildDocumentPackageAggregate(action as unknown as Cooperative.Blockchain.IAction);
    } catch (error: any) {
      this.logger.debug(`Не удалось собрать агрегат пакета: ${error?.message}`);
      return null;
    }
  }

  /**
   * Собирает ФИО/наименования всех подписантов пакета из signer_certificate всех частей агрегата
   * (заявление/решение/акты/связанные). Это и есть основной индекс поиска по подписанту —
   * соподписанты (председатель/совет) подписывают решение и акты, а не тело заявления,
   * поэтому content_text их не покрывает. Username добавляется тоже (редкий поиск по нему).
   */
  private collectSignersText(aggregate: DocumentPackageAggregateDomainInterface | null): string {
    if (!aggregate) return '';

    const docAggregates = [
      aggregate.statement?.documentAggregate,
      aggregate.decision?.documentAggregate,
      ...aggregate.acts.map((act) => act?.documentAggregate),
      ...aggregate.links,
    ];

    const parts = new Set<string>();
    for (const da of docAggregates) {
      const signatures = da?.document?.signatures ?? [];
      for (const sig of signatures) {
        if (sig?.signer) parts.add(String(sig.signer));
        const cert = sig?.signer_certificate as Record<string, any> | null | undefined;
        if (!cert) continue;
        for (const key of ['last_name', 'first_name', 'middle_name', 'short_name']) {
          if (cert[key]) parts.add(String(cert[key]));
        }
      }
    }

    return Array.from(parts).join(' ');
  }

  private shortPackage(action: IAction): string {
    const pkg = (action?.data as Record<string, any>)?.package;
    return typeof pkg === 'string' ? pkg.substring(0, 8) : '?';
  }

  private resolveBlockNum(metaBlockNum: unknown, actionBlockNum: unknown): string | null {
    if (metaBlockNum !== undefined && metaBlockNum !== null) return String(metaBlockNum);
    if (actionBlockNum !== undefined && actionBlockNum !== null) return String(actionBlockNum);
    return null;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
