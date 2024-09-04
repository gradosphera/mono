/* eslint-disable node/prefer-global/process */
import type { BaseHandler } from '../handlers/baseHandler'
import { EmailNotificationHandler } from '../handlers/emailNotificationHandler'
import { PushNotificationHandler } from '../handlers/pushNotificationHandler'
import { WebsocketNotificationHandler } from '../handlers/websocketNotificationHandler'

export class NotificationHandlerFactory {
  static createHandler(group: string, type: string): BaseHandler | null {
    if (type === 'action') {
      switch (group) {
        case `${process.env.COOPNAME}-email`:
          return new EmailNotificationHandler()
        case `${process.env.COOPNAME}-websocket`:
          return new WebsocketNotificationHandler()
        case `${process.env.COOPNAME}-push`:
          return new PushNotificationHandler()
        default:
          return null
      }
    }

    return null
  }
}
