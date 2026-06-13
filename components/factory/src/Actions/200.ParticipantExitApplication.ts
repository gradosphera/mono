import { DraftContract } from 'cooptypes'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import DataService from '../Services/Databazor/DataService'
import { ParticipantExitApplication } from '../Templates'
import { isEmpty } from '../Utils'

export { ParticipantExitApplication as Template } from '../Templates'

export class Factory extends DocFactory<ParticipantExitApplication.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ParticipantExitApplication.Action, _options?: IGenerationOptions): Promise<IGeneratedDocument> {
    const { template, user, coop, vars } = await this.resolveParallel({
      template: () => process.env.SOURCE === 'local'
        ? Promise.resolve(ParticipantExitApplication.Template as ITemplate<ParticipantExitApplication.Model>)
        : this.getTemplate<ParticipantExitApplication.Model>(DraftContract.contractName.production, ParticipantExitApplication.registry_id, data.block_num),
      user: () => super.getUser(data.username, data.block_num),
      coop: () => super.getCooperative(data.coopname, data.block_num),
      vars: () => super.getVars(data.coopname, data.block_num),
    })

    const userData = {
      [user.type]: user.data,
    }

    let { signature, ...modifieddata } = data
    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...modifieddata }) // Генерируем мета-данные

    interface SignatureData {
      username: string
      block_num: number
      signature: string
    }

    const data_service = new DataService<SignatureData>(this.storage, 'signatures')

    // пропуск сохранения необходим для подготовки документа только для отображения без сохранения
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

    if (!vars?.participant_exit_application || isEmpty(vars.participant_exit_application.protocol_number) || isEmpty(vars.participant_exit_application.protocol_day_month_year))
      throw new Error('Реквизиты протокола для заявления на выход не заполнены. Заполните номер и дату протокола в настройках кооператива.')

    const combinedData: ParticipantExitApplication.Model = {
      ...userData,
      meta,
      coop,
      type: user.type,
      vars,
      signature,
    }

    // валидируем скомбинированные данные
    await super.validate(combinedData, template.model)

    // получаем комплекс перевода
    const translation = template.translations[meta.lang]

    // генерируем документ
    const document: IGeneratedDocument = await super.generatePDF('', template.context, combinedData, translation, meta, data.skip_save)

    return document
  }
}
