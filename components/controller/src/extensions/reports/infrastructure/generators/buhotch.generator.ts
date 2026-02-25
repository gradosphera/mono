import { create } from 'xmlbuilder2';
import * as iconv from 'iconv-lite';
import { ReportType } from '../../domain/enums/report-type.enum';
import type { IReportGenerator, ReportInput, ReportOutput } from '../../domain/interfaces/report-generator.interface';

/**
 * Генератор бухгалтерского баланса (NO_BUHOTCH)
 * Формат: XML в кодировке windows-1251 с кириллическими тегами
 * Стандарт: Приказ ФНС КЧ-17-18/692 от 11.03.2025
 */
export class BuhotchGenerator implements IReportGenerator {
  readonly reportType = ReportType.BUHOTCH;

  generate(input: ReportInput): ReportOutput {
    const fileName = this.generateFileName(input);
    const errors: string[] = [];

    try {
      const xml = this.buildXml(input);
      return { reportType: this.reportType, xml, fileName, errors, isValid: errors.length === 0 };
    } catch (e: any) {
      errors.push(`Ошибка генерации: ${e.message}`);
      return { reportType: this.reportType, xml: '', fileName, errors, isValid: false };
    }
  }

  generateFileName(input: ReportInput): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    return `NO_BUHOTCH_${input.inn}_${input.kpp}_${dateStr}_${randomId()}.xml`;
  }

  private buildXml(input: ReportInput): string {
    const account51 = input.ledgerData?.find(a => a.accountId === 51);
    const account80 = input.ledgerData?.find(a => a.accountId === 80);
    const account86 = input.ledgerData?.find(a => a.accountId === 86);

    const cashAmount = account51 ? Math.round(account51.available / 1000) : 0;
    const shareCapital = account80 ? Math.round(account80.available / 1000) : 0;
    const targetFunding = account86 ? Math.round(account86.available / 1000) : 0;

    const totalCurrentAssets = cashAmount;
    const totalAssets = totalCurrentAssets;
    const totalCapital = shareCapital + targetFunding;
    const totalLiabilities = totalCapital;

    const idFile = this.generateFileName(input).replace('.xml', '');

    const doc = create({ version: '1.0', encoding: 'windows-1251' })
      .ele('Файл')
        .att('ИдФайл', idFile)
        .att('ВерсПрог', 'CoopReports 1.0')
        .att('ВерсФорм', '5.09')
        .ele('Документ')
          .att('КНД', '0710099')
          .att('ДатаДок', formatDate(new Date()))
          .att('Период', '34')
          .att('ОтчетГод', String(input.year))
          .att('НомКорр', '0')
          .att('ОКЕИ', '384')
          .att('ПрАудит', '0')
          .ele('СвНП')
            .ele('НПЮЛ')
              .att('НаимОрг', input.orgName)
              .att('ИННЮЛ', input.inn)
              .att('КПП', input.kpp)
              .att('АдрМН', '-')
            .up()
            .att('ОКВЭД2', input.okved)
            .att('ОКФС', input.okfs)
            .att('ОКОПФ', input.okopf)
          .up()
          .ele('Подписант')
            .att('ПрПодп', '1')
            .ele('ФИО')
              .att('Фамилия', input.signerFio.lastName)
              .att('Имя', input.signerFio.firstName)
              .att('Отчество', input.signerFio.middleName || '')
            .up()
          .up()
          .ele('Баланс')
            .ele('Актив')
              .ele('ВнеОбА')
                .att('Пояснения', '')
                .att('СумОтч', '0')
                .att('СумПрдщ', '0')
                .att('СумПрдшв', '0')
              .up()
              .ele('ОбА')
                .ele('ДенежнСр')
                  .att('Пояснения', '')
                  .att('СумОтч', String(cashAmount))
                  .att('СумПрдщ', '0')
                  .att('СумПрдшв', '0')
                .up()
                .att('Пояснения', '')
                .att('СумОтч', String(totalCurrentAssets))
                .att('СумПрдщ', '0')
                .att('СумПрдшв', '0')
              .up()
              .att('СумОтч', String(totalAssets))
              .att('СумПрдщ', '0')
              .att('СумПрдшв', '0')
            .up()
            .ele('Пассив')
              .ele('Капитал')
                .ele('УстКап')
                  .att('Пояснения', '')
                  .att('СумОтч', String(shareCapital))
                  .att('СумПрдщ', '0')
                  .att('СумПрдшв', '0')
                .up()
                .ele('ЦелФинанс')
                  .att('Пояснения', '')
                  .att('СумОтч', String(targetFunding))
                  .att('СумПрдщ', '0')
                  .att('СумПрдшв', '0')
                .up()
                .att('Пояснения', '')
                .att('СумОтч', String(totalCapital))
                .att('СумПрдщ', '0')
                .att('СумПрдшв', '0')
              .up()
              .ele('ДолгОбяз')
                .att('Пояснения', '')
                .att('СумОтч', '0')
                .att('СумПрдщ', '0')
                .att('СумПрдшв', '0')
              .up()
              .ele('КрОбяз')
                .att('Пояснения', '')
                .att('СумОтч', '0')
                .att('СумПрдщ', '0')
                .att('СумПрдшв', '0')
              .up()
              .att('СумОтч', String(totalLiabilities))
              .att('СумПрдщ', '0')
              .att('СумПрдшв', '0')
            .up()
          .up()
        .up()
      .up();

    return doc.end({ prettyPrint: true });
  }
}

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function randomId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
