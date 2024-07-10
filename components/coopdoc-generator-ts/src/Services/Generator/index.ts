import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import moment from 'moment-timezone'
import type { IGeneratedDocument, IMetaDocument, ITranslations } from '../../Interfaces'
import { TemplateEngine } from '../Templator'
import { calculateSha256 } from '../../Utils/calculateSHA'

export interface IPDFService {
  generateDocument: (
    template: string,
    combinedVars: any,
    translation: ITranslations,
    meta: IMetaDocument,
  ) => Promise<IGeneratedDocument>
}

export class PDFService implements IPDFService {
  public async generateDocument(
    template: string,
    combinedVars: any,
    translation: ITranslations,
    meta: IMetaDocument,
  ): Promise<IGeneratedDocument> {
    // Создаем экземпляр TemplateEngine и генерируем HTML

    const templateEngine = new TemplateEngine(translation)
    const html = templateEngine.renderTemplate(template, combinedVars)

    // Генерируем PDF буфер из HTML
    const buffer = await PDFService.generatePDFBuffer(html)

    // Обновляем метаданные
    const binary: Uint8Array = await PDFService.updateMetadata(buffer, meta)

    // Вычисляем SHA-256 хэш буфера
    const hash = calculateSha256(binary)

    return { html, hash, binary, meta }
  }

  private static async generatePDFBuffer(htmlContent: string): Promise<Uint8Array> {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()

    // const data = await inlineCss(htmlContent, { url: 'about:blank' })
    // const template = hb.compile(htmlContent, { strict: true })
    // const result = template({})

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    })

    // Добавьте задержку перед созданием PDF
    await new Promise(resolve => setTimeout(resolve, 1000))

    const pdfBuffer = await page.pdf({ format: 'A4' })
    await browser.close()
    return new Uint8Array(pdfBuffer)
  }

  private static async updateMetadata(pdfBuffer: ArrayBuffer, meta: IMetaDocument): Promise<Uint8Array> {
    const dateWithTimezone = moment.tz(meta.created_at, 'DD.MM.YYYY HH:mm', meta.timezone).toDate()

    const pdfDoc = await PDFDocument.load(pdfBuffer)
    pdfDoc.setTitle(meta.title)
    pdfDoc.setLanguage(meta.lang)
    pdfDoc.setProducer(meta.version)
    pdfDoc.setSubject(`документ для действия: ${meta.code}::${meta.action}`)
    pdfDoc.setCreator(meta.generator)
    pdfDoc.setCreationDate(dateWithTimezone)
    pdfDoc.setModificationDate(dateWithTimezone)
    return pdfDoc.save()
  }
}
