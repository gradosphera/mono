import type { IGenerate, IGeneratedDocument } from './types'
import { api } from '../api'

export class DigitalDocument {
  public data!: IGeneratedDocument

  async generate<T extends IGenerate>(data: T): Promise<IGeneratedDocument> {
    this.data = await api.generateDocument(data);
    return this.data;
  }

}
