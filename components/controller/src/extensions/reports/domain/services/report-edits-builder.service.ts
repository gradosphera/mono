import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ReportType } from '../enums/report-type.enum';
import { ReportRequisitesService } from './report-requisites.service';
import { Ledger2Service } from '~/application/ledger2/services/ledger2.service';
import {
  BALANCE_CORRECTION_REPOSITORY,
  type BalanceCorrectionRepository,
} from '../repositories/balance-correction.repository';
import { toThousands } from '../../infrastructure/generators/buhotch.generator';
import { formatDate } from '../../infrastructure/generators/xml-utils';
import type { BuhotchEditsShape } from '../edits-shapes/buhotch-edits.shape';

/**
 * Строит «дефолтное» редактируемое состояние формы отчёта из:
 *   - реквизитов организации (`ReportRequisitesService.getMerged`),
 *   - остатков по счетам ledger2 (`Ledger2Service.getAccounts`),
 *   - ручных корректировок прошлых периодов (`BalanceCorrectionRepository`).
 *
 * Результат — POJO той же формы, что `Buhotch/Ndfl6/…EditsDTO`. Сервис
 * не трогает drafт: поверх наложения dirty-полей отвечает резолвер
 * (`buildInitialReportEdits`) через `applyDirtyOverrides`.
 */

// Группы счетов ledger2 для строк баланса (совпадают с buhotch.generator +
// report-preview.service, копия здесь осознанная — при STORY-1-4 генератор
// переедет на edits и эту константу можно будет консолидировать).
const ACCOUNT_GROUPS = {
  cash: [50000, 51000, 52000, 55000],
  nonMaterialAndLongFin: [1000, 4000, 8000, 583000],
  shortTermFin: [58000, 581000, 582000, 62000, 76000],
  targetFunds: [80000, 86000],
} as const;

// Display-id счетов для поиска корректировок (как их вводит бухгалтер).
const CORRECTION_DISPLAY_IDS = {
  nonMaterialAndLongFin: ['01', '04', '08', '58.3'],
  cash: ['50', '51', '52', '55'],
  shortTermFin: ['58', '58.1', '58.2', '62', '76'],
  targetFunds: ['80', '86', '86.01', '86.02', '86.03', '86.04', '86.05', '86.06', '86.07', '86.8'],
} as const;

type BalanceRowEdits = BuhotchEditsShape['balance']['assetsTotal'];

@Injectable()
export class ReportEditsBuilderService {
  constructor(
    private readonly requisitesService: ReportRequisitesService,
    private readonly ledger2Service: Ledger2Service,
    @Inject(BALANCE_CORRECTION_REPOSITORY)
    private readonly correctionRepo: BalanceCorrectionRepository,
  ) {}

  /**
   * Вернуть дефолтное состояние edits для указанного типа отчёта.
   * Сейчас реализован BUHOTCH; остальные типы — в STORY-2-5.
   */
  async build(
    reportType: ReportType,
    year: number,
    _period: number | null | undefined,
    coopname: string,
  ): Promise<unknown> {
    switch (reportType) {
      case ReportType.BUHOTCH:
        return this.buildBuhotch(coopname, year);
      default:
        throw new NotImplementedException(
          `buildInitialReportEdits: форма ${reportType} пока не поддержана (ждём STORY-2-5).`,
        );
    }
  }

  private async buildBuhotch(coopname: string, year: number): Promise<BuhotchEditsShape> {
    const [merged, accounts, corrections] = await Promise.all([
      this.requisitesService.getMerged(coopname),
      this.ledger2Service.getAccounts(coopname),
      this.correctionRepo.findForYear(coopname, year),
    ]);

    // Ledger2 может вернуть несколько записей на один accountId (разные
    // субсчета/валюты) — суммируем в map по id, потом уже группируем.
    const balanceById = new Map<number, number>();
    for (const acc of accounts) {
      const amount = this.parseAmount(acc.balance);
      balanceById.set(acc.id, (balanceById.get(acc.id) ?? 0) + amount);
    }
    const sumByIds = (ids: readonly number[]): number =>
      ids.reduce((s, id) => s + (balanceById.get(id) ?? 0), 0);

    const correctionsByDisplayId = new Map<string, { prev: number; pre: number }>();
    for (const c of corrections) {
      correctionsByDisplayId.set(c.account_display_id, {
        prev: Number(c.balance_previous),
        pre: Number(c.balance_pre_previous),
      });
    }
    const corrForDisplayIds = (ids: readonly string[]): { prev: number; pre: number } => {
      let prev = 0;
      let pre = 0;
      for (const id of ids) {
        const c = correctionsByDisplayId.get(id);
        if (c) {
          prev += c.prev;
          pre += c.pre;
        }
      }
      return { prev, pre };
    };

    const buildRow = (currentRub: number, corr: { prev: number; pre: number }): BalanceRowEdits => ({
      otch: toThousands(currentRub),
      prev: toThousands(corr.prev),
      prePrev: toThousands(corr.pre),
    });

    const nonMatFin = buildRow(
      sumByIds(ACCOUNT_GROUPS.nonMaterialAndLongFin),
      corrForDisplayIds(CORRECTION_DISPLAY_IDS.nonMaterialAndLongFin),
    );
    const cash = buildRow(
      sumByIds(ACCOUNT_GROUPS.cash),
      corrForDisplayIds(CORRECTION_DISPLAY_IDS.cash),
    );
    const shortFin = buildRow(
      sumByIds(ACCOUNT_GROUPS.shortTermFin),
      corrForDisplayIds(CORRECTION_DISPLAY_IDS.shortTermFin),
    );
    const target = buildRow(
      sumByIds(ACCOUNT_GROUPS.targetFunds),
      corrForDisplayIds(CORRECTION_DISPLAY_IDS.targetFunds),
    );

    // Итоги Актив/Пассив — сумма rounded-строк. Регламент 0710001 допускает
    // расхождение ±1 тыс. из-за независимого округления каждой строки.
    const assetsTotal: BalanceRowEdits = {
      otch: nonMatFin.otch + cash.otch + shortFin.otch,
      prev: nonMatFin.prev + cash.prev + shortFin.prev,
      prePrev: nonMatFin.prePrev + cash.prePrev + shortFin.prePrev,
    };
    const passivesTotal: BalanceRowEdits = { ...target };

    const inn = merged.inn.value ?? '';
    const kpp = merged.kpp.value ?? '';
    const signerTypeValue: BuhotchEditsShape['signer']['type'] =
      merged.signerType === 'representative' ? 'representative' : 'chairman';

    return {
      header: {
        idFile: this.generateBuhotchFileName(inn, kpp),
        programVersion: 'Платформа отчётности кооператива 1.0',
        docDate: formatDate(new Date()),
        reportYear: year,
        correctionNumber: 0,
        audit: false,
        approved: false,
      },
      organization: {
        orgName: merged.orgName.value ?? '',
        inn,
        kpp,
        address: merged.address.value,
        okpo: merged.okpo.value,
        okfs: merged.okfs.value ?? '',
        okopf: merged.okopf.value ?? '',
      },
      signer: {
        type: signerTypeValue,
        lastName: merged.signerLastName.value ?? '',
        firstName: merged.signerFirstName.value ?? '',
        middleName: merged.signerMiddleName.value,
        repDoc: merged.signerRepDoc.value,
      },
      balance: {
        assetsTotal,
        nonMaterialAndLongFin: this.rowOrNull(nonMatFin),
        cash: this.rowOrNull(cash),
        shortTermFin: this.rowOrNull(shortFin),
        passivesTotal,
        targetFunds: this.rowOrNull(target),
      },
      notes: {
        explanationFileName: '-',
      },
    };
  }

  private rowOrNull(row: BalanceRowEdits): BalanceRowEdits | null {
    return row.otch || row.prev || row.prePrev ? row : null;
  }

  private parseAmount(amountStr: string): number {
    // Совпадает с ReportResolver.parseAmount: поддержка отрицательных/дробных.
    const match = amountStr.match(/(-?\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  }

  private generateBuhotchFileName(inn: string, kpp: string): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const unit = `${inn}${kpp}`;
    const tax = kpp.substring(0, 4);
    return `NO_BOUPR_${tax}_${tax}_${unit}_${dateStr}_${randomUUID()}`;
  }
}
