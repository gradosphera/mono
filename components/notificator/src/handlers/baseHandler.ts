export interface NotificationHandler {
  handle: (event: any) => Promise<void>
}

export abstract class BaseHandler implements NotificationHandler {
  abstract handle(event: any): Promise<void>
}
