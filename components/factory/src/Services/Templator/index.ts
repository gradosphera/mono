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
    this.env = new nunjucks.Environment()
    const transExtension = new TransExtension(translation)
    this.env.addExtension('TransExtension', transExtension)
  }

  renderTemplate(template: string, vars: any): string {
    return this.env.renderString(template, vars)
  }
}
