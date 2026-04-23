import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ReportType } from '../../domain/enums/report-type.enum';
import { ReportSubmissionMark } from '../../domain/enums/report-submission-mark.enum';

export enum CalendarEntryStatus {
  EMPTY = 'empty',
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  OVERDUE = 'overdue',
  NOT_REQUIRED = 'not_required',
}

registerEnumType(CalendarEntryStatus, {
  name: 'CalendarEntryStatus',
  description:
    'Статус ячейки календаря: empty (не трогали), draft (черновик есть, не сдано), ' +
    'submitted (сгенерирован валидный XML), overdue (срок прошёл, не сдано), ' +
    'not_required (кооператив отметил, что сдавать не надо). ' +
    'Приоритет: submitted > draft > not_required > overdue > empty.',
});

registerEnumType(ReportSubmissionMark, {
  name: 'ReportSubmissionMark',
  description: 'Пользовательская отметка на ячейке календаря. Пока только NOT_REQUIRED.',
});

@InputType('MarkReportPeriodInput')
export class MarkReportPeriodInputDTO {
  @Field(() => ReportType)
  @IsEnum(ReportType)
  reportType!: ReportType;

  @Field(() => Int)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(54)
  period?: number;

  /** null — снять отметку; непустое значение — поставить. */
  @Field(() => ReportSubmissionMark, { nullable: true })
  @IsOptional()
  @IsEnum(ReportSubmissionMark)
  mark?: ReportSubmissionMark | null;
}

@ObjectType('ReportCalendarPeriodEntry')
export class ReportCalendarPeriodEntryDTO {
  /** 1..4 для quarterly, 1..12 для monthly, null для yearly. */
  @Field(() => Int, { nullable: true })
  periodCode!: number | null;

  /** Человекочитаемая метка: «I кв.», «Январь», «Год». */
  @Field(() => String)
  label!: string;

  /** Месяц сдачи в календаре UI (1..12). */
  @Field(() => Int)
  dueMonth!: number;

  /** ISO-дата сдачи (YYYY-MM-DD). */
  @Field(() => String)
  dueDate!: string;

  @Field(() => CalendarEntryStatus)
  status!: CalendarEntryStatus;
}

@ObjectType('ReportCalendarRow')
export class ReportCalendarRowDTO {
  @Field(() => ReportType)
  reportType!: ReportType;

  @Field(() => String)
  shortName!: string;

  /** 'yearly' | 'quarterly' | 'monthly'. */
  @Field(() => String)
  periodKind!: string;

  @Field(() => [ReportCalendarPeriodEntryDTO])
  periods!: ReportCalendarPeriodEntryDTO[];
}
