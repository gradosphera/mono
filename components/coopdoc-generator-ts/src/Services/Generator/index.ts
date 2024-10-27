import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import moment from 'moment-timezone'
import type { IGeneratedDocument, IMetaDocument, ITranslations } from '../../Interfaces'
import { TemplateEngine } from '../Templator'
import { calculateSha256 } from '../../Utils/calculateSHA'
import { ArialBase64 } from '../../Fonts/arial'

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
    // Читаем шрифт из файла и кодируем в Base64

    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-software-rasterizer',
        '--deterministic-fetch', // для предсказуемости загрузки данных
        '--enable-use-zoom-for-dsf', // подавляет случайные изменения в масштабировании
      ],
      timeout: 120000,
      protocolTimeout: 120000,
    })

    const page = await browser.newPage()

    // Устанавливаем фиксированные параметры viewport для стабильного рендеринга
    await page.setViewport({
      width: 1280,
      height: 1024,
      deviceScaleFactor: 2, // Увеличиваем DPI для большей предсказуемости
    })

    // CSS для встраивания шрифта Arial с использованием Base64
    const fontStyle = `
    <style>
      @font-face {
        font-family: 'Arial';
        src: url(data:font/ttf;base64,${ArialBase64}) format('truetype');
      }
      * {
        font-family: 'Arial', sans-serif;
      }
    </style>
  `

    // Вставляем CSS-шрифт в HTML-контент
    const htmlWithFontStyle = fontStyle + htmlContent

    await page.setContent(htmlWithFontStyle, {
      waitUntil: 'networkidle0',
    })

    await page.evaluateHandle('document.fonts.ready')

    // Добавьте задержку перед созданием PDF
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Генерация PDF с дополнительными параметрами для стабильности
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      scale: 1, // Устанавливаем фиксированный скейлинг
      preferCSSPageSize: true, // Убедиться, что CSS задает размер страницы
    })

    await browser.close()
    return new Uint8Array(pdfBuffer)
  }

  private static async updateMetadata(pdfBuffer: ArrayBuffer, meta: IMetaDocument): Promise<Uint8Array> {
    const dateWithTimezone = moment.tz(meta.created_at, 'DD.MM.YYYY HH:mm', meta.timezone).toDate()

    const pdfDoc = await PDFDocument.load(pdfBuffer)
    pdfDoc.setTitle(meta.title)
    pdfDoc.setLanguage(meta.lang)
    pdfDoc.setProducer(meta.version)
    pdfDoc.setSubject(`Шаблона документа по реестру №${meta.registry_id}`)
    pdfDoc.setCreator(meta.generator)
    pdfDoc.setCreationDate(dateWithTimezone)
    pdfDoc.setModificationDate(dateWithTimezone)
    pdfDoc.setProducer('') // Очищает Producer, если нужно

    return pdfDoc.save({ useObjectStreams: false })
  }
}
