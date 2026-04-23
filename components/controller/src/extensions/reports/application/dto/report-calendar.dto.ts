import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ReportType } from '../../domain/enums/report-type.enum';

export enum CalendarEntryStatus {
  EMPTY = 'empty',
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  OVERDUE = 'overdue',
}

registerEnumType(CalendarEntryStatus, {
  name: 'CalendarEntryStatus',
  description:
    'Статус ячейки календаря: empty (не трогали), draft (черновик есть, не сдано), ' +
    'submitted (сгенерирован валидный XML), overdue (срок прошёл, не сдано).',
});

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
