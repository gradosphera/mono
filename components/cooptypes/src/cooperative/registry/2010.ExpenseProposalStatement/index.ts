import type { IGenerate, IMetaDocument } from '../../document'
import type { ICommonUser, ICooperativeData, IVars } from '../../model'

export const registry_id = 2010

export type ExpenseItemRecipientType = 'SELF' | 'MEMBER' | 'ORG'
export type ExpenseItemPaymentMechanics = 'ADVANCE' | 'DIRECT'

export interface IExpenseItem {
  number: string
  description: string
  amount: string
  recipient_type: ExpenseItemRecipientType
  mechanics: ExpenseItemPaymentMechanics
  recipient_name?: string
  requisites?: string
}

export interface IExpenseProposalHeader {
  description: string
  total_amount: string
  items_count: number
  source_wallet: string
}

export interface Action extends IGenerate {
  proposal_hash: string
  proposal: IExpenseProposalHeader
  items: IExpenseItem[]
}

export type Meta = IMetaDocument & Action

export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  user: ICommonUser
  vars: IVars
  proposal_hash: string
  proposal: IExpenseProposalHeader
  items: IExpenseItem[]
}

export const title = 'Служебная записка-смета о расходах'
export const description = 'Заявка-смета председателю кооператива на финансирование расходов по программе. Содержит описание цели и массив позиций расхода.'

// Вёрстка по бумажному образцу служебной записки: шапка-адресат справа,
// дата слева, центрированный заголовок с идентификатором (= proposal_hash,
// по нему записку можно найти), позиции — нумерованным списком с полными
// реквизитами получателей. Кошелёк-источник в документе не указывается.
export const context = `<style>h1{margin:0;text-align:center;}.digital-document{padding:20px;}.doc-header{text-align:right;padding-bottom:25px;}.doc-header p{margin:2px 0;}.doc-id{text-align:center;font-size:12px;word-break:break-all;padding-top:6px;padding-bottom:25px;}ol.items{padding-left:25px;margin:10px 0;}ol.items li{padding-bottom:10px;}.signature{padding-top:40px;}</style><div class="digital-document"><div class="doc-header"><p>{% trans 'TO_COUNCIL' %} {{vars.full_abbr_genitive}} «{{vars.name}}»</p><p>{% trans 'FROM_MEMBER' %} {{ user.full_name_or_short_name }}</p></div><p>{% trans 'DATE' %}: {{ meta.created_at }}</p><h1 style="padding-top:25px;">{% trans 'PROPOSAL_TITLE' %}</h1><p class="doc-id">№ {{ proposal_hash }}</p><p>{% trans 'BODY_INTRO' %} {{ proposal.total_amount }}, {% trans 'BODY_NAMELY' %}:</p><ol class="items">{% for item in items %}<li>{{ item.description }} — {{ item.amount }} ({% if item.mechanics == 'ADVANCE' %}{% trans 'MECH_ADVANCE' %}{% else %}{% trans 'MECH_DIRECT' %}{% endif %}). {% trans 'ITEM_RECIPIENT' %}: {% if item.recipient_type == 'SELF' %}{{ user.full_name_or_short_name }}{% else %}{{ item.recipient_name }}{% endif %}{% if item.requisites %}. {% trans 'ITEM_REQUISITES' %}: {{ item.requisites }}{% endif %}</li>{% endfor %}</ol><p>{% trans 'PURPOSE' %}: {{ proposal.description }}</p><div class="signature"><p>{{ user.full_name_or_short_name }}</p><p>{% trans 'SIGNED_DIGITALLY' %}</p></div></div>`

export const translations = {
  ru: {
    TO_COUNCIL: 'В Совет',
    FROM_MEMBER: 'от пайщика',
    DATE: 'Дата',
    PROPOSAL_TITLE: 'СЛУЖЕБНАЯ ЗАПИСКА',
    BODY_INTRO: 'Прошу согласовать списание затрат в общей сумме',
    BODY_NAMELY: 'а именно',
    MECH_ADVANCE: 'аванс под отчёт',
    MECH_DIRECT: 'прямая оплата',
    ITEM_RECIPIENT: 'Получатель',
    ITEM_REQUISITES: 'Реквизиты',
    PURPOSE: 'Цель расходов',
    SIGNED_DIGITALLY: 'подписано электронной подписью',
  },
}

export const exampleData = {
  coop: { city: 'Москва' },
  meta: { created_at: '02.06.2026 14:00' },
  vars: { full_abbr_genitive: 'ПК', name: 'Восход' },
  user: { full_name_or_short_name: 'Иванов И.И.' },
  proposal_hash: '55c470039a8c53ce1b4b6e842fe8063ab3d5b85ba2ba8ab0ae6e30be3ad328b7',
  proposal: {
    description: 'Закупка хостинга и бухгалтерских услуг на июнь 2026',
    total_amount: '15000.00 RUB',
    items_count: 2,
    source_wallet: 'w.cap.bla',
  },
  items: [
    {
      number: '1',
      description: 'Аренда серверов Yandex Cloud (тариф S, июнь)',
      amount: '12000.00 RUB',
      recipient_type: 'ORG',
      mechanics: 'DIRECT',
      recipient_name: 'ООО «Яндекс.Облако»',
      requisites: 'ИНН 7704414297, р/с 40702810000000000000, БИК 044525000',
    },
    {
      number: '2',
      description: 'Канцелярия для офиса',
      amount: '3000.00 RUB',
      recipient_type: 'SELF',
      mechanics: 'ADVANCE',
      recipient_name: '',
      requisites: 'Банковский перевод: счёт 40817810000000000000, Банк ВТБ (ПАО), БИК 044525187',
    },
  ],
}
