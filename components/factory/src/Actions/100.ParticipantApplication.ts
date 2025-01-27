import { DraftContract } from 'cooptypes'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import DataService from '../Services/Databazor/DataService'
import { ParticipantApplication } from '../templates'

export { ParticipantApplication as Template } from '../templates'

export class Factory extends DocFactory<ParticipantApplication.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ParticipantApplication.Action, _options?: IGenerationOptions): Promise<IGeneratedDocument> {
    // TODO надо использовать skip_save из options вместо skip_save из data, для этого на фронте внести соответствующие правки
    let template: ITemplate<ParticipantApplication.Model>

    if (process.env.SOURCE === 'local') {
      template = ParticipantApplication.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ParticipantApplication.registry_id, data.block_num)
    }

    const user = await super.getUser(data.username, data.block_num)

    let bank_account = {} as any

    if (user.type === 'organization' || user.type === 'entrepreneur')
      bank_account = await super.getBankAccount(data.username, data.block_num)

    const userData = {
      [user.type]: {
        ...user.data,
        bank_account,
      },
    }

    const coop = await super.getCooperative(data.coopname, data.block_num)
    const coop_bank_account = await super.getBankAccount(data.coopname, data.block_num)

    // добавлено для обратной совместимости с осенними версия 2024
    const extended_coop = { ...coop, bank_account: coop_bank_account }

    if (coop.is_branched && !data.braname)
      throw new Error('Кооперативный участок должен быть указан')

    let branch

    if (data.braname)
      branch = await super.getOrganization(data.braname, data.block_num)

    console.log(branch)

    let { signature, ...modifieddata } = data
    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...modifieddata }) // Генерируем мета-данные

    interface SignatureData {
      username: string
      block_num: number
      signature: string
    }

    const data_service = new DataService<SignatureData>(this.storage, 'signatures')

    // пропуск сохранения необходим при вступлении для того, чтобы подготовить документ только для отображения без сохранения
    if (!data.skip_save) {
      // если подпись не указана, то проверяем на наличие в базе данных
      if (!signature) {
        if (data.block_num) {
          const block_filter = data.block_num ? { block_num: { $lte: data.block_num } } : {}
          const db_signature = await data_service.getOne({ username: data.username, ...block_filter }) as SignatureData

          if (db_signature)
            signature = db_signature.signature
          else throw new Error('Не указана подпись пользователя')
        }
        else { throw new Error('Не указана подпись пользователя') }
      }
      else {
        // если подпись указана - сохраняем в хранилище
        const data_service = new DataService<SignatureData>(this.storage, 'signatures')
        await data_service.save({ username: data.username, block_num: meta.block_num, signature })
      }
    }

    const vars = await super.getVars(data.coopname, data.block_num)

    const combinedData: ParticipantApplication.Model = { ...userData, meta, coop: extended_coop, branch, type: user.type, vars, signature }

    // валидируем скомбинированные данные
    await super.validate(combinedData, template.model)

    // получаем комплекс перевода
    const translation = template.translations[meta.lang]

    // генерируем документ
    const document: IGeneratedDocument = await super.generatePDF(user.data, template.context, combinedData, translation, meta, data.skip_save)

    return document
  }
}
