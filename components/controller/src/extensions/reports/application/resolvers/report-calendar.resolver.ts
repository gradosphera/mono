import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { CurrentUser } from '~/application/auth/decorators/current-user.decorator';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { config } from '~/config';
import { ReportType } from '../../domain/enums/report-type.enum';
import {
  REPORTS_CALENDAR_REGISTRY,
  calcDueDate,
  type CalendarFormEntry,
} from '../../domain/services/reports-calendar-registry';
import {
  GENERATED_REPORT_REPOSITORY,
  type GeneratedReportRepository,
} from '../../domain/repositories/generated-report.repository';
import {
  REPORT_DRAFT_REPOSITORY,
  type ReportDraftRepository,
} from '../../domain/repositories/report-draft.repository';
import {
  CalendarEntryStatus,
  ReportCalendarPeriodEntryDTO,
  ReportCalendarRowDTO,
} from '../dto/report-calendar.dto';

/**
 * Календарь отчётности — матрица 5 форм × 12 месяцев для UI.
 *
 * Статус каждой ячейки вычисляется из:
 *   1. GeneratedReport (архив) — если есть isValid=true — submitted.
 *   2. ReportDraft — если есть и не submitted — draft.
 *   3. Иначе — empty, или overdue если дата сдачи уже прошла.
 */
@Resolver()
export class ReportCalendarResolver {
  constructor(
    @Inject(GENERATED_REPORT_REPOSITORY)
    private readonly reportRepo: GeneratedReportRepository,
    @Inject(REPORT_DRAFT_REPOSITORY)
    private readonly draftRepo: ReportDraftRepository,
  ) {}

  @Query(() => [ReportCalendarRowDTO], {
    name: 'getReportCalendar',
    description: 'Матрица отчётов × периодов для календарного виджета на странице отчётности',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async getReportCalendar(
    @Args('year', { type: () => Int }) year: number,
    @CurrentUser() currentUser: MonoAccountDomainInterface,
  ): Promise<ReportCalendarRowDTO[]> {
    const coopname = config.coopname;
    const ownerUsername = currentUser.username;
    const todayIso = toIsoDate(new Date());

    // Одним сканом подгружаем всё по архиву и draftам за год — экономим
    // N×12 запросов к БД.
    const [archive, drafts] = await Promise.all([
      this.reportRepo.list({ coopname, year }, 500, 0),
      this.draftRepo.list({ coopname, owner_username: ownerUsername, year }),
    ]);

    // Map: key = reportType|period → last record
    const archiveByKey = new Map<string, { isValid: boolean }>();
    for (const r of archive.items) {
      const key = makeKey(r.report_type, r.period ?? null);
      // Архив возвращает DESC по created_at, первая запись — самая свежая.
      if (!archiveByKey.has(key)) {
        archiveByKey.set(key, { isValid: r.is_valid });
      }
    }
    const draftKeys = new Set<string>();
    for (const d of drafts) {
      draftKeys.add(makeKey(d.report_type, d.period ?? null));
    }

    return REPORTS_CALENDAR_REGISTRY.map((row) =>
      this.toRow(row, year, todayIso, archiveByKey, draftKeys),
    );
  }

  private toRow(
    form: CalendarFormEntry,
    reportYear: number,
    todayIso: string,
    archive: Map<string, { isValid: boolean }>,
    drafts: Set<string>,
  ): ReportCalendarRowDTO {
    const periods: ReportCalendarPeriodEntryDTO[] = form.periods.map((p) => {
      const dueDate = calcDueDate(reportYear, p);
      const key = makeKey(form.reportType, p.periodCode);
      const arch = archive.get(key);
      let status: CalendarEntryStatus;
      if (arch?.isValid) {
        status = CalendarEntryStatus.SUBMITTED;
      } else if (drafts.has(key)) {
        status = CalendarEntryStatus.DRAFT;
      } else if (dueDate < todayIso) {
        status = CalendarEntryStatus.OVERDUE;
      } else {
        status = CalendarEntryStatus.EMPTY;
      }
      return {
        periodCode: p.periodCode,
        label: p.label,
        dueMonth: p.dueMonth,
        dueDate,
        status,
      };
    });

    return {
      reportType: form.reportType,
      shortName: form.shortName,
      periodKind: form.periodKind,
      periods,
    };
  }
}

function makeKey(reportType: ReportType, period: number | null): string {
  return `${reportType}|${period ?? '_'}`;
}

function toIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
