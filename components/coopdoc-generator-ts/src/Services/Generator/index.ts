import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import moment from 'moment-timezone'
import { v4 as uuidv4 } from 'uuid'
import type { IGeneratedDocument, IMetaDocument, ITranslations } from '../../Interfaces'
import { TemplateEngine } from '../Templator'
import { calculateSha256 } from '../../Utils/calculateSHA'
import { ArialBase64 } from '../../Fonts/arial'

const weasyPrintVersion = '62.3'

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
    const tempId = uuidv4() // Генерируем уникальный ID для временных файлов
    const tempDir = path.join(__dirname, 'tmp')

    // Создаем папку tmp, если её нет
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir)
    }

    const tempHtmlPath = path.join(tempDir, `${tempId}.html`)
    const tempPdfPath = path.join(tempDir, `${tempId}.pdf`)

    // CSS с указанием кодировки и шрифтом для кириллицы
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
      <meta charset="UTF-8">
    `

    // Объединяем CSS и HTML-контент
    const htmlWithFontStyle = fontStyle + htmlContent

    // Сохраняем HTML-контент во временный файл
    fs.writeFileSync(tempHtmlPath, htmlWithFontStyle, { encoding: 'utf8' })

    return new Promise((resolve, reject) => {
      // Запускаем WeasyPrint для конвертации HTML в PDF
      exec(`SOURCE_DATE_EPOCH=0 weasyprint ${tempHtmlPath} ${tempPdfPath}`, (error) => {
        if (error) {
          // Удаляем временные файлы при ошибке
          fs.unlinkSync(tempHtmlPath)
          reject(error)
        }
        else {
          // Читаем PDF-файл и возвращаем его как Uint8Array
          const pdfBuffer = fs.readFileSync(tempPdfPath)
          // Удаляем временные файлы после завершения
          fs.unlinkSync(tempHtmlPath)
          fs.unlinkSync(tempPdfPath)
          resolve(new Uint8Array(pdfBuffer))
        }
      })
    })
  }

  private static async updateMetadata(pdfBuffer: ArrayBuffer, meta: IMetaDocument): Promise<Uint8Array> {
    const dateWithTimezone = moment.tz(meta.created_at, 'DD.MM.YYYY HH:mm', meta.timezone).toDate()

    const pdfDoc = await PDFDocument.load(pdfBuffer)
    pdfDoc.setTitle(meta.title)
    pdfDoc.setLanguage(meta.lang)
    pdfDoc.setSubject(`Шаблона документа по реестру №${meta.registry_id}`)
    pdfDoc.setCreator(`${meta.generator}-${meta.version}`)
    pdfDoc.setCreationDate(dateWithTimezone)
    pdfDoc.setModificationDate(dateWithTimezone)
    pdfDoc.setProducer(`weasyprint-v${weasyPrintVersion}`)

    return pdfDoc.save({ useObjectStreams: false })
  }
}
