import type { IGenerate, IGeneratedDocument } from './types'
import { api } from '../api'

export class DigitalDocument {
  public data!: IGeneratedDocument

  async generate(data: IGenerate): Promise<IGeneratedDocument> {
    this.data = await api.generateDocument(data)
    return this.data
  }
}
