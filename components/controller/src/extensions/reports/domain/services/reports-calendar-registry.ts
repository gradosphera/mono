import { ReportType } from '../enums/report-type.enum';

/**
 * Реестр дат сдачи отчётов ФНС/СФР на 2026 год.
 *
 * Источники:
 * - ФНС (6-НДФЛ): ФЗ №540-ФЗ от 27.11.2023, сроки п.2 ст.230 НК РФ с 2024 г.
 * - РСВ: ст.431 НК РФ — до 25-го числа месяца следующего за отчётным периодом.
 * - ПСВ: ст.431 НК РФ — до 25-го числа каждого месяца, кроме последнего
 *   месяца каждого квартала (т.к. за эти месяцы РСВ).
 * - БУХОТЧ: ст.18 402-ФЗ — не позднее 3 месяцев после окончания года.
 * - ЕФС-1 ОСС: приказ СФР №1462 от 17.11.2025 — ежеквартально до 25-го.
 *
 * Перенос выходных реализован в `shiftToBusinessDay` — Sat/Sun сдвигаются
 * на ближайший понедельник. Производственный календарь РФ (праздничные
 * дни) пока НЕ учитывается: если 25-е — 1 января, календарь покажет
 * 1 января, а законный срок — 9-е. Это debt, см. 989-9 «Debt».
 */

export type PeriodKind = 'yearly' | 'quarterly' | 'monthly';

export interface CalendarPeriodEntry {
  /** Код периода для генератора: 1..4 для quarterly, 1..12 для monthly, null для yearly. */
  periodCode: number | null;
  /** Человекочитаемая метка: «I кв.», «Январь», «Год». */
  label: string;
  /** Месяц сдачи (1..12). Год сдачи = reportYear или reportYear+1 (см. dueYearOffset). */
  dueMonth: number;
  /** День месяца сдачи (обычно 25, иногда 31/1/28). */
  dueDay: number;
  /** 0 = сдавать в том же году, 1 = в следующем. */
  dueYearOffset: 0 | 1;
}

export interface CalendarFormEntry {
  reportType: ReportType;
  /** Читаемое короткое имя для UI. */
  shortName: string;
  periodKind: PeriodKind;
  /** Список периодов года со сроками. Для yearly — массив из одного элемента. */
  periods: CalendarPeriodEntry[];
}

function quarterEntries(dueMonth: (q: 1 | 2 | 3 | 4) => number, dueDay = 25, yearOffset: (q: 1 | 2 | 3 | 4) => 0 | 1 = () => 0): CalendarPeriodEntry[] {
  return [1, 2, 3, 4].map((q) => {
    const quarter = q as 1 | 2 | 3 | 4;
    return {
      periodCode: q,
      label: quarter === 1 ? 'I кв.' : quarter === 2 ? 'Полугодие' : quarter === 3 ? '9 мес.' : 'Год',
      dueMonth: dueMonth(quarter),
      dueDay,
      dueYearOffset: yearOffset(quarter),
    };
  });
}

const RUSSIAN_MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

/**
 * ПСВ: за каждый месяц-кроме-последнего-месяца-квартала, до 25-го
 * следующего месяца. Итого 8 записей: Янв/Фев/Апр/Май/Июл/Авг/Окт/Ноя.
 * Месяц сдачи = reportMonth + 1 (февраль для января, итд).
 * Для ноября — сдача 25 декабря; последний месяц квартала (март/июнь/сент/дек)
 * в ПСВ не входит (закрывается РСВ).
 */
function psvEntries(): CalendarPeriodEntry[] {
  const psvMonths = [1, 2, 4, 5, 7, 8, 10, 11] as const;
  return psvMonths.map((reportMonth) => {
    const dueMonth = reportMonth + 1; // 1..12 (ноябрь → декабрь)
    return {
      periodCode: reportMonth,
      label: RUSSIAN_MONTHS[reportMonth - 1] ?? String(reportMonth),
      dueMonth,
      dueDay: 25,
      dueYearOffset: 0,
    };
  });
}

export const REPORTS_CALENDAR_REGISTRY: CalendarFormEntry[] = [
  {
    reportType: ReportType.BUHOTCH,
    shortName: 'Бухотчётность',
    periodKind: 'yearly',
    periods: [
      {
        periodCode: null,
        label: 'Год',
        dueMonth: 3,
        dueDay: 31,
        dueYearOffset: 1, // за 2026 год → сдача 31.03.2027
      },
    ],
  },
  {
    reportType: ReportType.NDFL6,
    shortName: '6-НДФЛ',
    periodKind: 'quarterly',
    periods: quarterEntries(
      (q) => (q === 1 ? 4 : q === 2 ? 7 : q === 3 ? 10 : 2),
      25,
      (q) => (q === 4 ? 1 : 0),
    ),
  },
  {
    reportType: ReportType.RSV,
    shortName: 'РСВ',
    periodKind: 'quarterly',
    periods: quarterEntries(
      (q) => (q === 1 ? 4 : q === 2 ? 7 : q === 3 ? 10 : 1),
      25,
      (q) => (q === 4 ? 1 : 0),
    ),
  },
  {
    reportType: ReportType.PSV,
    shortName: 'ПСВ',
    periodKind: 'monthly',
    periods: psvEntries(),
  },
  {
    reportType: ReportType.FSS4,
    shortName: 'ЕФС-1',
    periodKind: 'quarterly',
    periods: quarterEntries(
      (q) => (q === 1 ? 4 : q === 2 ? 7 : q === 3 ? 10 : 1),
      25,
      (q) => (q === 4 ? 1 : 0),
    ),
  },
];

/**
 * Перенос даты с субботы/воскресенья на ближайший понедельник.
 * Производственный календарь РФ (праздники) не учитывается —
 * только Sat/Sun. Для 1 января и т.п. срок может быть показан
 * неправильно, но регламентно ФНС продлевает его сама.
 */
function shiftToBusinessDay(year: number, month1to12: number, day: number): { year: number; month: number; day: number } {
  // JS Date: month 0..11, getUTCDay() — 0=Sun, 6=Sat.
  const d = new Date(Date.UTC(year, month1to12 - 1, day));
  const dow = d.getUTCDay();
  let shift = 0;
  if (dow === 6) shift = 2; // Sat → Mon
  else if (dow === 0) shift = 1; // Sun → Mon
  if (shift === 0) return { year, month: month1to12, day };
  d.setUTCDate(d.getUTCDate() + shift);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/**
 * Собрать ISO-дату (YYYY-MM-DD) из reportYear + entry с переносом на рабочий день.
 * reportYear здесь — год, ЗА который отчитываются. dueYearOffset сдвигает на +1
 * если срок в следующем году.
 */
export function calcDueDate(reportYear: number, entry: CalendarPeriodEntry): string {
  const rawYear = reportYear + entry.dueYearOffset;
  const { year, month, day } = shiftToBusinessDay(rawYear, entry.dueMonth, entry.dueDay);
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}
