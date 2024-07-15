import { io } from '../utils/sockets'
import { BaseHandler } from './baseHandler'

export class WebsocketNotificationHandler extends BaseHandler {
  async handle(event: any) {
    io.emit('event', event)
  }
}
