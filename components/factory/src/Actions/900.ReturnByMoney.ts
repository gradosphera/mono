import { DraftContract } from 'cooptypes'
import { ReturnByMoney } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import { type PaymentData, PaymentMethod } from '../Models/PaymentMethod'

export { ReturnByMoney as Template } from '../Templates'

export class Factory extends DocFactory<ReturnByMoney.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: ReturnByMoney.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<ReturnByMoney.Model>

    if (process.env.SOURCE === 'local') {
      template = ReturnByMoney.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, ReturnByMoney.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await this.getCooperative(data.coopname, data.block_num)
    const vars = await this.getVars(data.coopname, data.block_num)
    const user = await this.getUser(data.username, data.block_num)

    const commonUser = this.getCommonUser(user)

    // Извлекаем платежные данные из хранилища по method_id
    const paymentMethodService = new PaymentMethod(this.storage)
    const paymentMethod = await paymentMethodService.getOne({
      method_id: data.request.method_id,
      username: data.username,
      deleted: false,
    })

    if (!paymentMethod) {
      throw new Error(`Платежный метод с ID ${data.request.method_id} не найден для пользователя ${data.username}`)
    }

    const combinedData: ReturnByMoney.Model = {
      meta,
      coop,
      vars,
      user: commonUser,
      request: {
        payment_details: this.formatPaymentDetails(paymentMethod, commonUser.full_name_or_short_name),
        amount: data.request.amount,
        currency: data.request.currency,
      },
    }

    await this.validate(combinedData, template.model)
    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF(commonUser.full_name_or_short_name, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
