import { DataCollectorFactory } from '../factories/dataCollectorFactory'
import { TemplateFactory } from '../factories/templateFactory'
import { postRequest } from '../utils/requests'
import { BaseHandler } from './baseHandler'

export class EmailNotificationHandler extends BaseHandler {
  async handle(event: any) {
    const { account, name } = event

    const dataCollector = await DataCollectorFactory.createDataCollector(account, name)
    const eventData = await dataCollector.collect(event)

    const emailTemplateStrategy = TemplateFactory.createTemplateStrategy('email', account, name)
    const message = emailTemplateStrategy.fillMessage(eventData)
    const subject = emailTemplateStrategy.fillSubject(eventData)

    await this.sendEmail(event.receipt.receiver, subject, message)
  }

  async sendEmail(to: string, subject: string, message: string) {
    console.log(`Отправляем оповещение на почту для аккаунта: ${to}`)
    await postRequest('notify/send', { type: 'email', to, subject, message })
  }
}
