import nunjucks from 'nunjucks'
import type { ITranslations, NestedRecord } from '../../Interfaces'

export interface ITemplateEngine {
  renderTemplate: (template: string, vars: unknown, translation: Record<string, string>) => string
}

class TransExtension {
  tags = ['trans']
  private readonly translation: ITranslations

  constructor(translation: ITranslations) {
    this.translation = translation
  }

  parse(parser: any, nodes: any) {
    const tok = parser.nextToken()
    const args = parser.parseSignature(null, true)
    parser.advanceAfterBlockEnd(tok.value)
    return new nodes.CallExtension(this, 'run', args)
  }

  run(_context: any, key: string, ...args: string[]): string | NestedRecord {
    let translation = this.translation[key] || key
    args.forEach((value, index) => {
      translation = translation.replace(new RegExp(`\\{${index}\\}`, 'g'), value)
    })

    return new nunjucks.runtime.SafeString(translation as unknown as string)
  }
}

export class TemplateEngine implements ITemplateEngine {
  private readonly env: nunjucks.Environment

  constructor(translation: ITranslations) {
    // Включаем явный режим без автоэкранирования, чтобы HTML из данных рендерился как разметка
    this.env = new nunjucks.Environment(undefined, { autoescape: false })
    const transExtension = new TransExtension(translation)
    this.env.addExtension('TransExtension', transExtension)
  }

  // Декодируем HTML-сущности, если до фабрики дошёл экранированный текст (например, &lt;div&gt;)
  private decodeHtml(value: string): string {
    return value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, '\'')
  }

  private prepareVars(value: unknown): unknown {
    if (typeof value === 'string') {
      return this.decodeHtml(value)
    }
    if (Array.isArray(value)) {
      return value.map(v => this.prepareVars(v))
    }
    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        result[k] = this.prepareVars(v)
      }
      return result
    }
    return value
  }

  renderTemplate(template: string, vars: any): string {
    const prepared = this.prepareVars(vars)
    const context = prepared && typeof prepared === 'object' ? (prepared as object) : {}
    return this.env.renderString(template, context)
  }
}
