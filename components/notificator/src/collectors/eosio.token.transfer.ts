import { BaseDataCollector } from './baseDataCollector'

export default class Collector extends BaseDataCollector {
  async collect(event: any): Promise<any> {
    // Пример извлечения данных из события или сторонних источников
    return {
      account: event.account,
      name: event.name,
      receipt: event.receipt,
      ...event,
    }
  }
}
