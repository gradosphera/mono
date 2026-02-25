import { create } from 'xmlbuilder2';
import { ReportType } from '../../domain/enums/report-type.enum';
import type { IReportGenerator, ReportInput, ReportOutput } from '../../domain/interfaces/report-generator.interface';

/**
 * Генератор 6-НДФЛ — нулевая отчётность
 */
export class Ndfl6Generator implements IReportGenerator {
  readonly reportType = ReportType.NDFL6;

  generate(input: ReportInput): ReportOutput {
    const fileName = this.generateFileName(input);
    const errors: string[] = [];

    try {
      const periodCode = input.period === 1 ? '21' : input.period === 2 ? '31' : input.period === 3 ? '33' : '34';
      const idFile = fileName.replace('.xml', '');

      const doc = create({ version: '1.0', encoding: 'windows-1251' })
        .ele('Файл')
          .att('ИдФайл', idFile)
          .att('ВерсПрог', 'CoopReports 1.0')
          .att('ВерсФорм', '5.05')
          .ele('Документ')
            .att('КНД', '1151100')
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
            .ele('НДФЛ6')
              .ele('ОбобщПоказ')
                .att('КолФЛДоход', '0')
                .att('КолФЛВыч', '0')
              .up()
            .up()
          .up()
        .up();

      const xml = doc.end({ prettyPrint: true });
      return { reportType: this.reportType, xml, fileName, errors, isValid: true };
    } catch (e: any) {
      errors.push(`Ошибка генерации 6-НДФЛ: ${e.message}`);
      return { reportType: this.reportType, xml: '', fileName, errors, isValid: false };
    }
  }

  generateFileName(input: ReportInput): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    return `NO_NDFL6.2_${input.inn}_${input.kpp}_${dateStr}.xml`;
  }
}

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}
