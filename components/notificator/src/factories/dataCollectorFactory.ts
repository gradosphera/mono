import type { IDataCollector } from '../collectors/baseDataCollector'
import DefaultDataCollector from '../collectors/defaultDataCollector'

export class DataCollectorFactory {
  static async createDataCollector(code: string, action: string): Promise<IDataCollector> {
    const collectorModuleName = `${code}.${action}`

    const collectorModulePath = `../collectors/${collectorModuleName}`

    try {
      const module = await import(collectorModulePath)
      const DataCollectorClass = module.default

      return new DataCollectorClass()
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (error: any) {
      return new DefaultDataCollector()
    }
  }
}
