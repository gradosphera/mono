import { BaseDataCollector } from './baseDataCollector'

export default class DefaultDataCollector extends BaseDataCollector {
  async collect(event: any): Promise<any> {
    // Пример извлечения данных из события
    return event
  }
}
