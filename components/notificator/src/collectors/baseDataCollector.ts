export interface IDataCollector {
  collect: (event: any) => Promise<any>
}

export abstract class BaseDataCollector implements IDataCollector {
  abstract collect(event: any): Promise<any>
}
