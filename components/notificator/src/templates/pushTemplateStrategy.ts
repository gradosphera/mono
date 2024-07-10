import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import Handlebars from 'handlebars'
import importSync from 'import-sync'
import type { ITemplateStrategy } from './templateStrategy'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

Handlebars.registerHelper('eq', (a, b) => {
  return a === b
})

export class PushTemplateStrategy implements ITemplateStrategy {
  private message: HandlebarsTemplateDelegate
  public subject: HandlebarsTemplateDelegate

  constructor(templateFile: string) {
    const templatePath = path.resolve(__dirname, `../../pushTemplates/${templateFile}`)
    const { notificationTemplate } = importSync(templatePath)

    this.subject = Handlebars.compile(notificationTemplate.subject)
    this.message = Handlebars.compile(notificationTemplate.message)
  }

  fillMessage(data: any): string {
    return this.message(data)
  }

  fillSubject(data: any): string {
    return this.subject(data)
  }
}
