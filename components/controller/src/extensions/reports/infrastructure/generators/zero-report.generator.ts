import { create } from 'xmlbuilder2';
import { ReportType, REPORT_CONFIG } from '../../domain/enums/report-type.enum';
import type { IReportGenerator, ReportInput, ReportOutput } from '../../domain/interfaces/report-generator.interface';

/**
 * Базовый генератор нулевой отчётности.
 * Используется для РСВ, ПСВ, ДУСН, 4-ФСС, Уведомление о взносах, УУСН.
 */
export function createZeroReportGenerator(reportType: ReportType, knd: string, versForm: string): IReportGenerator {
  return {
    reportType,

    generate(input: ReportInput): ReportOutput {
      const fileName = this.generateFileName(input);
      const errors: string[] = [];

      try {
        const periodCode = getPeriodCode(reportType, input.period);
        const idFile = fileName.replace('.xml', '');

        const doc = create({ version: '1.0', encoding: 'windows-1251' })
          .ele('Файл')
            .att('ИдФайл', idFile)
            .att('ВерсПрог', 'CoopReports 1.0')
            .att('ВерсФорм', versForm)
            .ele('Документ')
              .att('КНД', knd)
              .att('ДатаДок', formatDate(new Date()))
              .att('Период', periodCode)
              .att('ОтчетГод', String(input.year))
              .att('КодНО', input.kpp.substring(0, 4))
              .att('НомКорр', '0')
              .att('ПоМесту', '214')
              .ele('СвНП')
                .att('ОКВЭД', input.okved)
                .ele('НПЮЛ')
                  .att('НаимОрг', input.orgName)
                  .att('ИННЮЛ', input.inn)
                  .att('КПП', input.kpp)
                .up()
              .up()
              .ele('Подписант')
                .att('ПрПодп', '1')
                .ele('ФИО')
                  .att('Фамилия', input.signerFio.lastName)
                  .att('Имя', input.signerFio.firstName)
                  .att('Отчество', input.signerFio.middleName || '')
                .up()
              .up()
            .up()
          .up();

        const xml = doc.end({ prettyPrint: true });
        return { reportType, xml, fileName, errors, isValid: true };
      } catch (e: any) {
        errors.push(`Ошибка генерации ${REPORT_CONFIG[reportType]?.name}: ${e.message}`);
        return { reportType, xml: '', fileName, errors, isValid: false };
      }
    },

    generateFileName(input: ReportInput): string {
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const prefix = REPORT_CONFIG[reportType]?.xsdFile?.split('_')[0] || 'REPORT';
      return `${prefix}_${input.inn}_${input.kpp}_${dateStr}.xml`;
    },
  };
}

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function getPeriodCode(reportType: ReportType, period?: number): string {
  if (!period) return '34';
  const config = REPORT_CONFIG[reportType];
  if (config?.period === 'monthly') return String(period).padStart(2, '0');
  if (config?.period === 'quarterly') {
    return period === 1 ? '21' : period === 2 ? '31' : period === 3 ? '33' : '34';
  }
  return '34';
}
