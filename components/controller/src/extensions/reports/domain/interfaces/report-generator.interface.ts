import type { ReportType } from '../enums/report-type.enum';

/**
 * Входные данные для генерации отчёта
 */
export interface ReportInput {
  /** Тип отчёта */
  reportType: ReportType;
  /** Год отчётного периода */
  year: number;
  /** Квартал (1-4) или месяц (1-12) */
  period?: number;
  /** ИНН организации */
  inn: string;
  /** КПП организации */
  kpp: string;
  /** Наименование организации */
  orgName: string;
  /** ОГРН */
  ogrn: string;
  /** ОКВЭД */
  okved: string;
  /** ОКПО */
  okpo?: string;
  /** ОКФС — форма собственности */
  okfs: string;
  /** ОКОПФ — организационно-правовая форма */
  okopf: string;
  /** ФИО подписанта */
  signerFio: { lastName: string; firstName: string; middleName?: string };
  /** Данные из ledger (балансы по счетам) */
  ledgerData?: LedgerAccountData[];
}

/**
 * Данные по бухгалтерскому счёту из ledger
 */
export interface LedgerAccountData {
  /** ID счёта (51, 80, 86, etc.) */
  accountId: number;
  /** Наименование счёта */
  name: string;
  /** Доступные средства */
  available: number;
  /** Заблокированные средства */
  blocked: number;
}

/**
 * Результат генерации отчёта
 */
export interface ReportOutput {
  /** Тип отчёта */
  reportType: ReportType;
  /** XML содержимое (windows-1251 encoded) */
  xml: string;
  /** Имя файла для ФНС */
  fileName: string;
  /** Ошибки валидации (если есть) */
  errors: string[];
  /** Успешна ли валидация */
  isValid: boolean;
}

/**
 * Интерфейс генератора отчёта.
 * Каждый тип отчёта реализует этот интерфейс.
 */
export interface IReportGenerator {
  /** Тип отчёта */
  readonly reportType: ReportType;

  /** Генерация XML */
  generate(input: ReportInput): ReportOutput;

  /** Генерация имени файла по стандарту ФНС */
  generateFileName(input: ReportInput): string;
}
