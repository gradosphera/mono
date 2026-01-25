import type { ICommonUser, ICooperativeData, IVars } from '../../model'
import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1020

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  appendix_hash: string
  appendix_created_at: string
  project_hash: string
  amount: string
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  user: ICommonUser
  appendix_hash: string
  short_appendix_hash: string
  contributor_contract_number: string
  contributor_contract_created_at: string
  appendix_created_at: string
  project_hash: string
  amount: string
}

export const title = 'Заявление об инвестировании денежных средств в генерацию'
export const description = 'Заявление о зачете части паевого взноса в качестве инвестиции в проект'

export const context = `<div class="digital-document"><p style="text-align: right">{% trans 'council_of' %} {{ vars.full_abbr_genitive }} "{{ vars.name }}"</p><p style="text-align: right">{% trans 'from_shareholder' %} {{ user.full_name_or_short_name }}</p><div style="text-align: center"><h1>{% trans 'statement' %}</h1></div><p>{% trans 'in_accordance_with_appendix' %} №{{ short_appendix_hash }} {% trans 'from_date' %} {{ appendix_created_at }} {% trans 'to_agreement' %} {{ contributor_contract_number }} {% trans 'from_date' %} {{ contributor_contract_created_at }}, {% trans 'request_to_credit' %} {% trans 'target_share_contribution' %} {% trans 'target_consumer_program' %} "{% trans 'digital_wallet' %}" {% trans 'in_amount' %} {{ amount }} {% trans 'as_share_contribution' %} {% trans 'to_project' %} №{{ project_hash }}.</p><p style="text-align: right">{{ meta.created_at }}</p><p style="text-align: right">{% trans 'signed_by_digital_signature' %}</p></div><style>.digital-document {padding: 20px;white-space: pre-wrap;}</style>`

export const translations = {
  ru: {
    council_of: 'В Совет',
    from_shareholder: 'От пайщика',
    statement: 'ЗАЯВЛЕНИЕ',
    in_accordance_with_appendix: 'В соответствии с Приложением',
    from_date: 'от',
    to_agreement: 'к Договору об участии в хозяйственной деятельности №',
    request_to_credit: 'прошу зачесть часть моего',
    target_share_contribution: 'целевого паевого взноса',
    target_consumer_program: 'по Целевой Потребительской Программе',
    digital_wallet: 'ЦИФРОВОЙ КОШЕЛЕК',
    in_amount: 'в размере',
    as_share_contribution: 'в качестве паевого взноса',
    to_project: 'в Проект',
    signed_by_digital_signature: 'Подписано электронной подписью',
  },
}

export const exampleData = {
  meta: {
    created_at: '15.01.2026 14:30',
  },
  appendix_hash: 'A001INV1',
  short_appendix_hash: 'A001INV1',
  contributor_contract_number: 'INV123456789',
  contributor_contract_created_at: '10.01.2026',
  appendix_created_at: '12.01.2026',
  project_hash: 'PRJ20260115001',
  amount: '50000.00 RUB',
  vars: {
    name: 'ВОСХОД',
    full_abbr_genitive: 'Потребительского Кооператива',
  },
  user: {
    full_name_or_short_name: 'Иванов Иван Иванович',
    phone: '+7 999 123-45-67',
    email: 'ivanov@example.com',
  },
  coop: {
    city: 'Москва',
  },
}
