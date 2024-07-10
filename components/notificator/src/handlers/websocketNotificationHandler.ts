import { BaseHandler } from './baseHandler'

export class WebsocketNotificationHandler extends BaseHandler {
  async handle(_event: any) {
    console.log(`Обрабатываем веб-сокет оповещения:`)
    // Логика обработки websocket_notification
  }
}
