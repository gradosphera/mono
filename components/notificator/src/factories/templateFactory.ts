import type { ITemplateStrategy } from '../templates/templateStrategy'
import { EmailTemplateStrategy } from '../templates/emailTemplateStrategy'
import { PushTemplateStrategy } from '../templates/pushTemplateStrategy'

export class TemplateFactory {
  static createTemplateStrategy(type: string, account: string, name: string): ITemplateStrategy {
    const templateFile = `${account}.${name}.ts`

    switch (type) {
      case 'email':
        return new EmailTemplateStrategy(templateFile)
      case 'push':
        return new PushTemplateStrategy(templateFile)
      default:
        throw new Error('Unknown template type')
    }
  }
}
