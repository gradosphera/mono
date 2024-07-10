import { DataCollectorFactory } from '../factories/dataCollectorFactory'
import { TemplateFactory } from '../factories/templateFactory'
import { BaseHandler } from './baseHandler'

export class PushNotificationHandler extends BaseHandler {
  async handle(_event: any) {
    const { account, name } = _event

    const dataCollector = await DataCollectorFactory.createDataCollector(account, name)
    const eventData = await dataCollector.collect(_event)

    const pushTemplateStrategy = TemplateFactory.createTemplateStrategy('push', account, name)
    const message = pushTemplateStrategy.fillMessage(eventData)
    const subject = pushTemplateStrategy.fillSubject(eventData)

    this.sendPushNotification(_event.receipt.receiver, subject, message)
  }

  sendPushNotification(to: string, subject: string, message: string) {
    console.log(`Отправляем пуш-оповещения с темой ${subject} пользователю ${to}:`)
    console.log(message)
  }
}
