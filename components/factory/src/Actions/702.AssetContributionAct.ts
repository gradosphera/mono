import { DraftContract } from 'cooptypes'
import { AssetContributionAct } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import type { ExternalOrganizationData } from '../Models'

export { AssetContributionAct as Template } from '../Templates'

export class Factory extends DocFactory<AssetContributionAct.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: AssetContributionAct.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<AssetContributionAct.Model>

    if (process.env.SOURCE === 'local') {
      template = AssetContributionAct.Template
    }
    else {
      template = await this.getTemplate(DraftContract.contractName.production, AssetContributionAct.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const coop = await this.getCooperative(data.coopname, data.block_num)
    const vars = await this.getVars(data.coopname, data.block_num)
    const user = await this.getUser(data.username, data.block_num)

    const request = await this.getRequest(data.request_id, data.block_num)

    // Извлекаем данные уже принятого решения совета
    const decision = await this.getApprovedDecision(coop, data.coopname, data.decision_id)
    const commonUser = this.getCommonUser(user)
    const receiver = await this.getUser(data.receiver, data.block_num)

    if (coop.is_branched && !data.braname)
      throw new Error('Branch name is required')

    let branch: ExternalOrganizationData | undefined

    if (data.braname)
      branch = await this.getOrganization(data.braname, data.block_num)

    const program = await this.getProgram(request.program_id)

    const combinedData: AssetContributionAct.Model = {
      meta,
      coop,
      vars,
      user: commonUser,
      request,
      decision,
      program,
      act_id: data.act_id,
      receiver: this.getFirstLastMiddleName(receiver.data),
      branch,
    }

    await this.validate(combinedData, template.model)
    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF(commonUser.full_name_or_short_name, template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
