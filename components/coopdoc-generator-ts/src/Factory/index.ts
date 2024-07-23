import type { JSONSchemaType } from 'ajv'
import moment from 'moment-timezone'
import { DraftContract, SovietContract } from 'cooptypes'
import type { ICombinedData, IGeneratedDocument, IMetaDocument, IMetaDocumentPartial, ITemplate, ITranslations } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'
import type { IndividualData, OrganizationData } from '../Models'
import { Individual, Organization } from '../Models'
import type { IDecisionData, IGenerate } from '../Interfaces/Documents'
import { PDFService } from '../Services/Generator'
import packageJson from '../../package.json'
import { Validator } from '../Services/Validator'
import type { CooperativeData } from '../Models/Cooperative'
import { Cooperative } from '../Models/Cooperative'
import type { EntrepreneurData } from '../Models/Entrepreneur'
import { Entrepreneur } from '../Models/Entrepreneur'
import { getFetch } from '../Utils/getFetch'
import { getEnvVar } from '../config'
import { getCurrentBlock } from '../Utils/getCurrentBlock'

const packageVersion = packageJson.version

export abstract class DocFactory {
  abstract generateDocument(options: IGenerate): Promise<IGeneratedDocument>

  public storage: MongoDBConnector

  constructor(storage: MongoDBConnector) {
    this.storage = storage
  }

  async validate(combinedData: ICombinedData, schema: any) {
    return new Validator(schema, combinedData).validate()
  }

  async getUser(username: string, block_num?: number): Promise<{ type: string, data: IndividualData | OrganizationData | EntrepreneurData }> {
    const block_filter = block_num ? { block_num: { $lte: block_num } } : {}

    const individual = await new Individual(this.storage).getOne({ username, ...block_filter })
    const organization = await new Organization(this.storage).getOne({ username, ...block_filter })
    const entrepreneur = await new Entrepreneur(this.storage).getOne({ username, ...block_filter })

    const userData: { type: string, data: IndividualData | OrganizationData | EntrepreneurData } = {
      type: '',
      data: {} as IndividualData | OrganizationData | EntrepreneurData,
    }

    if (individual) {
      userData.type = 'individual'
      userData.data = individual
    }

    if (organization) {
      if (userData.type !== '')
        throw new Error('Найдено более одного типа данных')

      userData.type = 'organization'
      userData.data = organization
    }

    if (entrepreneur) {
      if (userData.type !== '')
        throw new Error('Найдено более одного типа данных')

      userData.type = 'entrepreneur'
      userData.data = entrepreneur
    }

    if (userData.type === '')
      throw new Error('Пользователь не найден')

    return userData
  }

  async getCooperative(username: string, block_num?: number): Promise<CooperativeData> {
    const coop = await new Cooperative(this.storage).getOne(username, block_num)

    if (!coop)
      throw new Error('Кооператив не найден')
    return coop
  }

  async getDecision(coop: CooperativeData, coopname: string, decision_id: number, created_at: string): Promise<IDecisionData> {
    const votes_for_actions = (await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-actions`, new URLSearchParams({
      filter: JSON.stringify({
        'account': process.env.SOVIET_CONTRACT,
        'name': SovietContract.Actions.Decisions.VoteFor.actionName,
        'receiver': process.env.SOVIET_CONTRACT,
        'data.decision_id': String(decision_id),
        'data.coopname': coopname,
      }),
    })))?.results

    if (!votes_for_actions || votes_for_actions.length === 0)
      throw new Error('Голоса за решение не найдены')

    const votes_against_actions = (await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-actions`, new URLSearchParams({
      filter: JSON.stringify({
        'account': process.env.SOVIET_CONTRACT,
        'name': SovietContract.Actions.Decisions.VoteAgainst.actionName,
        'receiver': process.env.SOVIET_CONTRACT,
        'data.decision_id': String(decision_id),
        'data.coopname': coopname,
      }),
    })))?.results

    const votes_against = votes_against_actions ? votes_against_actions.length : 0
    const votes_for = votes_for_actions.length

    const total_members = coop.totalMembers
    const total_voters = votes_for + votes_against
    const votes_abstained = total_members - total_voters

    const voters_percent: number = Number.parseFloat((total_voters / total_members * 100).toFixed(0))

    const [date, time] = created_at.split(' ')

    return {
      id: decision_id,
      date,
      time,
      votes_for,
      votes_against,
      votes_abstained,
      voters_percent,
    }
  }

  async getTemplate<T>(registry_id: number, block_num?: number): Promise<ITemplate<T>> {
    const block_filter = block_num ? { block_num: { $lte: block_num } } : {}

    const templateResponse = await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-tables`, new URLSearchParams({
      filter: JSON.stringify({
        'code': DraftContract.contractName.production,
        'scope': DraftContract.contractName.production,
        'table': DraftContract.Tables.Drafts.tableName,
        'value.registry_id': String(registry_id),
        ...block_filter,
      }),
    }))

    const draft = templateResponse.results[0]?.value as DraftContract.Tables.Drafts.IDraft

    if (!draft)
      throw new Error('Шаблон не найден')

    const translationsResponse = await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-tables`, new URLSearchParams({
      filter: JSON.stringify({
        'code': DraftContract.contractName.production,
        'scope': DraftContract.contractName.production,
        'table': 'translations',
        'value.draft_id': String(draft.id),
        ...block_filter,
      }),
    }))

    const translations = translationsResponse.results

    if (!translations.length)
      throw new Error('Ни один перевод не найден')

    const translationsObj: any = Object.fromEntries(
      translations.map(({ value }: { value: DraftContract.Tables.Translations.ITranslation }) => [value.lang, JSON.parse(value.data)]),
    )

    return {
      title: draft.title,
      description: draft.description,
      model: JSON.parse(draft.model) as JSONSchemaType<T>,
      context: draft.context,
      translations: translationsObj as ITranslations,
    }
  }

  async generatePDF(
    data: IndividualData | OrganizationData | EntrepreneurData,
    context: string,
    vars: ICombinedData,
    translation: ITranslations,
    meta: IMetaDocument,
  ): Promise<IGeneratedDocument> {
    const pdfService = new PDFService()
    const document: IGeneratedDocument = await pdfService.generateDocument(context, vars, translation, meta)
    const full_name = this.getFullName(data)

    document.full_title = `${document.meta.title} - ${full_name} - ${document.meta.created_at}.pdf`

    return document
  }

  getFullName(data: IndividualData | OrganizationData | EntrepreneurData): string {
    if ('first_name' in data)
      return `${data.last_name} ${data.first_name} ${data.middle_name}`

    if ('represented_by' in data)
      return `${data.represented_by.last_name} ${data.represented_by.first_name} ${data.represented_by.middle_name}`

    return ''
  }

  async saveDraft(document: IGeneratedDocument): Promise<void> {
    await this.storage.saveDraft(document)
  }

  async getMeta<T extends IMetaDocumentPartial>({
    code,
    action,
    title,
    username,
    coopname,
    registry_id,
    lang = 'ru',
    generator = 'coopjs',
    version = packageVersion, // TODO перенести в .env
    created_at,
    block_num,
    timezone = 'Europe/Moscow', // TODO перенести в .env
    ...restParams
  }: T): Promise<IMetaDocument> {
    let dateWithTimezone

    if (!title)
      throw new Error('Заголовок документа должен быть установлен')

    if (!code || !action)
      throw new Error('Параметры действия должны быть переданы')

    if (created_at)
      dateWithTimezone = moment.tz(created_at, 'DD.MM.YYYY HH:mm', timezone).format('DD.MM.YYYY HH:mm').toString()
    else
      dateWithTimezone = moment.tz(timezone).format('DD.MM.YYYY HH:mm').toString()

    if (!block_num)
      block_num = await getCurrentBlock()

    return {
      code,
      action,
      title,
      lang,
      registry_id,
      generator,
      version,
      coopname,
      username,
      created_at: dateWithTimezone,
      block_num,
      timezone,
      ...restParams,
    }
  }
}
