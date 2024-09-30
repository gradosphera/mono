import nunjucks from 'nunjucks'
import { v4 as uuidv4 } from 'uuid' // Импортируем функцию для генерации UUID
import type { ITranslations, NestedRecord } from '../../Interfaces'

export interface ITemplateEngine {
  renderTemplate: (template: string, vars: unknown, translation: Record<string, string>) => string
}

class TransExtension {
  tags = ['trans']

  parse(parser: any, nodes: any) {
    const tok = parser.nextToken()
    const args = parser.parseSignature(null, true)
    parser.advanceAfterBlockEnd(tok.value)
    return new nodes.CallExtension(this, 'run', args)
  }

  run(context: any, key: string, ...args: string[]): string {
    const translations = context.lookup('translation') || {}
    let translation = translations[key] || key
    args.forEach((value, index) => {
      translation = translation.replace(new RegExp(`\\{${index}\\}`, 'g'), value)
    })
    translation = translation.replace(/\n/g, '<br>')
    return new nunjucks.runtime.SafeString(translation).toString()
  }
}

export class TemplateEngine implements ITemplateEngine {
  private readonly env: nunjucks.Environment
  private readonly translation: ITranslations

  constructor(translation: ITranslations) {
    this.translation = translation
    this.env = new nunjucks.Environment(null, { noCache: true }) // Отключаем кэширование
    const transExtension = new TransExtension()
    const uniqueExtensionName = `TransExtension_${uuidv4()}` // Генерируем уникальное имя
    this.env.addExtension(uniqueExtensionName, transExtension)
  }

  renderTemplate(template: string, vars: any): string {
    const context = {
      ...vars,
      translation: this.translation,
    }
    return this.env.renderString(template, context)
  }
}
