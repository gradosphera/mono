import type { ICommonUser, ICooperativeData, IVars } from '../../model'
import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1025

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  contributor_hash: string
  contributor_created_at: string
  generator_agreement_hash: string
  generator_agreement_created_at: string
  project_hash: string
  amount: string
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  vars: IVars
  common_user: ICommonUser
  contributor_hash: string
  contributor_short_hash: string
  contributor_created_at: string
  generator_agreement_hash: string
  generator_agreement_short_hash: string
  generator_agreement_created_at: string
  project_hash: string
  amount: string
}

export const title = 'Заявление о возврате неиспользованных средств генерации'
export const description = 'Заявление о переводе части целевого паевого взноса на цифровой кошелек'

export const context = `<div class="digital-document"><p>{% trans 'to_council' %} {{ vars.full_abbr_genitive }} "{{ vars.name }}"</p><p>{% trans 'from_shareholder' %} {{ common_user.full_name_or_short_name }}</p><div style="text-align: center"><h2>{% trans 'statement_title' %}</h2></div><p>{% trans 'statement_text' %} № {{ contributor_short_hash }} {% trans 'from_date' %} {{ contributor_created_at }} {% trans 'and_appendix' %} №{{ generator_agreement_short_hash }} {% trans 'from_date' %} {{ generator_agreement_created_at }}, {% trans 'request_translation' %} {{ amount }} {% trans 'allocated_to_project' %} №{{ project_hash }} {% trans 'to_wallet' %}.</p><p>{% trans 'signed_by_digital_signature' %}							{{ meta.created_at }}</p></div><style>.digital-document {padding: 20px;white-space: pre-wrap;}</style>`

export const translations = {
  ru: {
    to_council: 'В Совет',
    from_shareholder: 'От пайщика:',
    statement_title: 'ЗАЯВЛЕНИЕ',
    statement_text: 'В соответствии с условиями Договора об участии в хозяйственной деятельности',
    from_date: 'от',
    and_appendix: 'и его Приложением',
    request_translation: 'прошу осуществить перевод части моего целевого паевого взноса в размере',
    allocated_to_project: 'аллоцированных в Проект',
    to_wallet: 'на мой цифровой кошелек в Целевой Потребительской Программе "ЦИФРОВОЙ КОШЕЛЕК"',
    signed_by_digital_signature: 'Подписано электронной подписью',
  },
}

export const exampleData = {
  meta: {
    created_at: '11.04.2024 12:00',
  },
  contributor_hash: 'ED3BCFC5B681AA83D123456789ABCDEF',
  contributor_short_hash: 'ED3BCFC5B681AA83D',
  contributor_created_at: '11.04.2024',
  generator_agreement_hash: 'ed3bcfd5b681aa83d3956642e19320d5036c5a7533ebb4c4bdd81db412c6474301f7561cbe0d61fc666334119c21bffbb955526ee923f5e637d6167af2a903a2',
  generator_agreement_short_hash: 'ed3bcfd5b681aa83d',
  generator_agreement_created_at: '11.04.2024',
  project_hash: 'B2C3D4E5F6789ABC',
  amount: '5000.00 RUB',
  vars: {
    name: 'ВОСХОД',
    full_abbr_genitive: 'Потребительского Кооператива',
    full_abbr: 'Потребительский Кооператив',
  },
  common_user: {
    full_name_or_short_name: 'Иванов Иван Иванович',
    email: 'ivanov@example.com',
    phone: '+7 999 123-45-67',
  },
}
