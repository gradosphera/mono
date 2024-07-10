import type { BaseHandler } from '../handlers/baseHandler'
import { EmailNotificationHandler } from '../handlers/emailNotificationHandler'
import { PushNotificationHandler } from '../handlers/pushNotificationHandler'
import { WebsocketNotificationHandler } from '../handlers/websocketNotificationHandler'

export class NotificationHandlerFactory {
  static createHandler(group: string, type: string): BaseHandler | null {
    if (type === 'action') {
      switch (group) {
        case 'emailGroup':
          return new EmailNotificationHandler()
        case 'websocketGroup':
          return new WebsocketNotificationHandler()
        case 'pushGroup':
          return new PushNotificationHandler()
        default:
          return null
      }
    }

    return null
  }
}
