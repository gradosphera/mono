import { DraftContract } from 'cooptypes'
import type { Interface } from '../Templates/100.ParticipantApplication'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import { Template } from '../Templates/100.ParticipantApplication'
import DataService from '../Services/Databazor/DataService'
import type { IGenerateJoinCoop } from '../Interfaces/Actions'

export const registry_id = 100

export class Factory extends DocFactory {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(options: IGenerateJoinCoop): Promise<IGeneratedDocument> {
    let template: ITemplate<Interface>

    if (process.env.SOURCE === 'local') {
      template = Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, registry_id, options.block_num)
    }

    const user = await super.getUser(options.username, options.block_num)

    const userData = {
      [user.type]: user.data,
    }

    const coop = await super.getCooperative(options.coopname, options.block_num)

    let { signature, ...modifiedOptions } = options

    const meta: IMetaDocument = await super.getMeta({ registry_id, title: template.title, ...modifiedOptions }) // Генерируем мета-данные

    interface SignatureData {
      username: string
      block_num: number
      signature: string
    }

    const data_service = new DataService<SignatureData>(this.storage, 'signatures')

    // пропуск сохранения необходим при вступлении для того, чтобы подготовить документ только для отображения без сохранения
    if (!options.skip_save) {
      // если подпись не указана, то проверяем на наличие в базе данных
      if (!signature) {
        if (options.block_num) {
          const block_filter = options.block_num ? { block_num: { $lte: options.block_num } } : {}
          const db_signature = await data_service.getOne({ username: options.username, ...block_filter }) as SignatureData

          if (db_signature)
            signature = db_signature.signature
          else throw new Error('Не указана подпись пользователя')
        }
        else { throw new Error('Не указана подпись пользователя') }
      }
      else {
        // если подпись указана - сохраняем в хранилище
        const data_service = new DataService<SignatureData>(this.storage, 'signatures')
        await data_service.save({ username: options.username, block_num: meta.block_num, signature })
      }
    }

    const combinedData: Interface = { ...userData, meta, coop, type: user.type, signature }

    // валидируем скомбинированные данные
    await super.validate(combinedData, template.model)

    // получаем комплекс перевода
    const translation = template.translations[meta.lang]

    // генерируем документ
    const document: IGeneratedDocument = await super.generatePDF(user.data, template.context, combinedData, translation, meta)

    // сохраняем его в бд
    if (!options.skip_save)
      await super.saveDraft(document)

    return document
  }
}
