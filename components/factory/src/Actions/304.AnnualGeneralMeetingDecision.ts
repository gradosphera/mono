import { DraftContract } from 'cooptypes'
import { AnnualGeneralMeetingDecision } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { AnnualGeneralMeetingDecision as Template } from '../Templates'

export class Factory extends DocFactory<AnnualGeneralMeetingDecision.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: AnnualGeneralMeetingDecision.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<AnnualGeneralMeetingDecision.Model>

    if (process.env.SOURCE === 'local') {
      template = AnnualGeneralMeetingDecision.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, AnnualGeneralMeetingDecision.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await super.getMeta({ title: template.title, ...data })
    const coop = await super.getCooperative(data.coopname, data.block_num)
    const vars = await super.getVars(data.coopname, data.block_num)
    const user = await super.getUser(data.username, data.block_num)

    const combinedData: AnnualGeneralMeetingDecision.Model = {
      meta,
      coop,
      vars,
    }

    await super.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]

    const document: IGeneratedDocument = await super.generatePDF(user.data, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
