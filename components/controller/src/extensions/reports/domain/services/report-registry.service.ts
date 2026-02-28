import { Injectable, Logger } from '@nestjs/common';
import type { IReportGenerator, ReportInput, ReportOutput } from '../interfaces/report-generator.interface';
import { ReportType, REPORT_CONFIG } from '../enums/report-type.enum';

/**
 * Реестр генераторов отчётов — фабрика.
 * Каждый генератор регистрируется по типу отчёта.
 */
@Injectable()
export class ReportRegistryService {
  private readonly logger = new Logger(ReportRegistryService.name);
  private readonly generators = new Map<ReportType, IReportGenerator>();

  /**
   * Регистрация генератора отчёта
   */
  register(generator: IReportGenerator): void {
    this.generators.set(generator.reportType, generator);
    this.logger.log(`Генератор зарегистрирован: ${REPORT_CONFIG[generator.reportType]?.name || generator.reportType}`);
  }

  /**
   * Генерация отчёта
   */
  generate(input: ReportInput): ReportOutput {
    const generator = this.generators.get(input.reportType);
    if (!generator) {
      throw new Error(`Генератор для типа отчёта "${input.reportType}" не зарегистрирован`);
    }
    return generator.generate(input);
  }

  /**
   * Получение списка зарегистрированных типов отчётов
   */
  getAvailableReports(): { type: ReportType; name: string; period: string; deadline: string }[] {
    return Array.from(this.generators.keys()).map(type => ({
      type,
      name: REPORT_CONFIG[type]?.name || type,
      period: REPORT_CONFIG[type]?.period || 'unknown',
      deadline: REPORT_CONFIG[type]?.deadlineDescription || '',
    }));
  }

  /**
   * Проверка доступности генерации (наступил ли срок)
   */
  isGenerationAvailable(reportType: ReportType, year: number, period?: number): boolean {
    const config = REPORT_CONFIG[reportType];
    if (!config) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const quarterEndMonth = (period || 0) * 3;
        
    switch (config.period) {
      case 'yearly':
        return currentYear > year;
      case 'quarterly':
        if (period === undefined) return false;
        return (currentYear > year) || (currentYear === year && currentMonth > quarterEndMonth);
      case 'monthly':
        if (period === undefined) return false;
        return (currentYear > year) || (currentYear === year && currentMonth > period);
      default:
        return true;
    }
  }
}
