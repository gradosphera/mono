import type { IGenerate, IGeneratedDocument } from './types'
import { api } from '../api';
import { useGlobalStore } from 'src/shared/store';
import type { IObjectedDocument } from 'src/shared/lib/types/document';
import type { Cooperative } from 'cooptypes';
import type { Types } from '@coopenomics/coopjs';

export type ZGeneratedDocument = Cooperative.Document.ZGeneratedDocument

export const useSignDocument = () => {
  const globalStore = useGlobalStore()

  const signDocument = async(document: ZGeneratedDocument): Promise<Cooperative.Document.ISignedDocument> => {
    if (!document)
      throw new Error('Документ на подпись не предоставлен')

    const digital_signature = await globalStore.signDigest(document.hash);

    const doc: Types.ZSignedDocument = {
      hash: document.hash,
      meta: document.meta,
      public_key: digital_signature.public_key,
      signature: digital_signature.signature,
    }

    return doc
  }

  return {
    signDocument
  }
}

export class DigitalDocument {
  public data: IGeneratedDocument | undefined
  public signedDocument: IObjectedDocument | undefined

  constructor(document?: IGeneratedDocument){
    this.data = document
  }

  async generate<T extends IGenerate>(data: T, options?: Cooperative.Document.IGenerationOptions): Promise<IGeneratedDocument> {
    this.data = await api.generateDocument(data, options);
    return this.data;
  }

  async sign(): Promise<Cooperative.Document.ISignedDocument> {
    const globalStore = useGlobalStore()
    if (!this.data)
      throw new Error('Ошибка генерации документа')

    const digital_signature = await globalStore.signDigest(this.data.hash);

    this.signedDocument = {
      hash: this.data.hash,
      meta: this.data.meta,
      public_key: digital_signature.public_key,
      signature: digital_signature.signature,
    };

    return this.signedDocument

  }

}
