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

export class EmailTemplateStrategy implements ITemplateStrategy {
  public message!: HandlebarsTemplateDelegate
  public subject!: HandlebarsTemplateDelegate
  public process: boolean

  constructor(templateFile: string) {
    try {
      const templatePath = path.resolve(__dirname, `../../emailTemplates/${templateFile}`)
      const { notificationTemplate } = importSync(templatePath)

      this.subject = Handlebars.compile(notificationTemplate.subject)
      this.message = Handlebars.compile(notificationTemplate.message)
      this.process = true
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (e: any) {
      this.process = false
    }
  }

  fillMessage(data: any): string {
    return this.message(data)
  }

  fillSubject(data: any): string {
    return this.subject(data)
  }
}
