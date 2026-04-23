import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { CurrentUser } from '~/application/auth/decorators/current-user.decorator';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { config } from '~/config';
import { ReportType } from '../../domain/enums/report-type.enum';
import { ReportSubmissionMark } from '../../domain/enums/report-submission-mark.enum';
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
  REPORT_SUBMISSION_MARK_REPOSITORY,
  type ReportSubmissionMarkRepository,
} from '../../domain/repositories/report-submission-mark.repository';
import {
  CalendarEntryStatus,
  MarkReportPeriodInputDTO,
  ReportCalendarPeriodEntryDTO,
  ReportCalendarRowDTO,
} from '../dto/report-calendar.dto';

/**
 * Календарь отчётности — матрица 5 форм × 12 месяцев для UI.
 *
 * Приоритет статусов (сверху — сильнее):
 *   1. submitted (есть валидный XML в архиве);
 *   2. submitted_externally (отметка «сдано вне платформы»);
 *   3. draft (есть черновик);
 *   4. not_required (отметка «не надо сдавать»);
 *   5. overdue (dueDate < today);
 *   6. empty.
 */
@Resolver()
export class ReportCalendarResolver {
  constructor(
    @Inject(GENERATED_REPORT_REPOSITORY)
    private readonly reportRepo: GeneratedReportRepository,
    @Inject(REPORT_DRAFT_REPOSITORY)
    private readonly draftRepo: ReportDraftRepository,
    @Inject(REPORT_SUBMISSION_MARK_REPOSITORY)
    private readonly markRepo: ReportSubmissionMarkRepository,
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

    const [archive, drafts, marks] = await Promise.all([
      this.reportRepo.list({ coopname, year }, 500, 0),
      this.draftRepo.list({ coopname, owner_username: ownerUsername, year }),
      this.markRepo.list({ coopname, year }),
    ]);

    const archiveByKey = new Map<string, { isValid: boolean }>();
    for (const r of archive.items) {
      const key = makeKey(r.report_type, r.period ?? null);
      if (!archiveByKey.has(key)) {
        archiveByKey.set(key, { isValid: r.is_valid });
      }
    }
    const draftKeys = new Set<string>();
    for (const d of drafts) {
      draftKeys.add(makeKey(d.report_type, d.period ?? null));
    }
    const marksByKey = new Map<string, ReportSubmissionMark>();
    for (const m of marks) {
      marksByKey.set(makeKey(m.report_type, m.period ?? null), m.mark);
    }

    return REPORTS_CALENDAR_REGISTRY.map((row) =>
      this.toRow(row, year, todayIso, archiveByKey, draftKeys, marksByKey),
    );
  }

  @Mutation(() => Boolean, {
    name: 'markReportPeriod',
    description:
      'Поставить или снять отметку на ячейку календаря. mark=null — снять. ' +
      'Сейчас поддерживается только NOT_REQUIRED («не надо сдавать»).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async markReportPeriod(
    @Args('data', { type: () => MarkReportPeriodInputDTO }) data: MarkReportPeriodInputDTO,
    @CurrentUser() currentUser: MonoAccountDomainInterface,
  ): Promise<boolean> {
    const coopname = config.coopname;
    const period = data.period ?? null;
    if (data.mark == null) {
      await this.markRepo.remove(coopname, data.reportType, data.year, period);
      return true;
    }
    await this.markRepo.set({
      coopname,
      report_type: data.reportType,
      year: data.year,
      period,
      mark: data.mark,
      created_by: currentUser.username,
    });
    return true;
  }

  private toRow(
    form: CalendarFormEntry,
    reportYear: number,
    todayIso: string,
    archive: Map<string, { isValid: boolean }>,
    drafts: Set<string>,
    marks: Map<string, ReportSubmissionMark>,
  ): ReportCalendarRowDTO {
    const periods: ReportCalendarPeriodEntryDTO[] = form.periods.map((p) => {
      const dueDate = calcDueDate(reportYear, p);
      const key = makeKey(form.reportType, p.periodCode);
      const arch = archive.get(key);
      const mark = marks.get(key);

      let status: CalendarEntryStatus;
      if (arch?.isValid) {
        status = CalendarEntryStatus.SUBMITTED;
      } else if (mark === ReportSubmissionMark.SUBMITTED_EXTERNALLY) {
        status = CalendarEntryStatus.SUBMITTED_EXTERNALLY;
      } else if (drafts.has(key)) {
        status = CalendarEntryStatus.DRAFT;
      } else if (mark === ReportSubmissionMark.NOT_REQUIRED) {
        status = CalendarEntryStatus.NOT_REQUIRED;
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
