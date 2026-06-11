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
  proposal: IExpenseProposalHeader
  items: IExpenseItem[]
}

export type Meta = IMetaDocument & Action

export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  user: ICommonUser
  vars: IVars
  proposal: IExpenseProposalHeader
  items: IExpenseItem[]
}

export const title = 'Служебная записка-смета о расходах'
export const description = 'Заявка-смета председателю кооператива на финансирование расходов по программе. Содержит описание цели и массив позиций расхода.'

export const context = `<style>h1{margin:0;text-align:center;}h3{margin:0;padding-top:15px;text-align:center;}.digital-document{padding:20px;white-space:pre-wrap;}.subheader{padding-bottom:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:left;word-wrap:break-word;overflow-wrap:break-word;}th{background-color:#f4f4f4;}.summary{margin-top:20px;text-align:right;font-weight:bold;}.signature{padding-top:30px;}</style><div class="digital-document"><div style="padding-bottom:30px;"><h1 style="text-align:center">{% trans 'PROPOSAL_TITLE' %}</h1><p style="text-align:center">{{vars.full_abbr_genitive}} «{{vars.name}}»</p><p style="text-align:right;padding-top:20px">{{ coop.city }}, {{ meta.created_at }}</p></div><h3>{% trans 'PURPOSE' %}</h3><p>{{ proposal.description }}</p><h3 style="padding-top:20px;">{% trans 'ITEMS' %}</h3><table><thead><tr><th>№</th><th>{% trans 'ITEM_DESCRIPTION' %}</th><th>{% trans 'ITEM_AMOUNT' %}</th><th>{% trans 'ITEM_RECIPIENT' %}</th><th>{% trans 'ITEM_MECHANICS' %}</th><th>{% trans 'ITEM_REQUISITES' %}</th></tr></thead><tbody>{% for item in items %}<tr><td>{{ item.number }}</td><td>{{ item.description }}</td><td>{{ item.amount }}</td><td>{% if item.recipient_type == 'SELF' %}{% trans 'RECIPIENT_SELF' %}{% elif item.recipient_type == 'MEMBER' %}{% trans 'RECIPIENT_MEMBER' %}: {{ item.recipient_name }}{% else %}{% trans 'RECIPIENT_ORG' %}: {{ item.recipient_name }}{% endif %}</td><td>{% if item.mechanics == 'ADVANCE' %}{% trans 'MECH_ADVANCE' %}{% else %}{% trans 'MECH_DIRECT' %}{% endif %}</td><td>{{ item.requisites }}</td></tr>{% endfor %}</tbody></table><p class="summary">{% trans 'TOTAL' %}: {{ proposal.total_amount }} ({{ proposal.items_count }} {% trans 'ITEMS_COUNT_SUFFIX' %})</p><p style="padding-top:15px;">{% trans 'SOURCE_WALLET' %}: {{ proposal.source_wallet }}</p><div class="signature"><p>{{ user.full_name_or_short_name }}</p><p>{% trans 'SIGNED_DIGITALLY' %}</p></div></div>`

export const translations = {
  ru: {
    PROPOSAL_TITLE: 'СЛУЖЕБНАЯ ЗАПИСКА-СМЕТА О РАСХОДАХ',
    PURPOSE: 'ЦЕЛЬ РАСХОДОВ',
    ITEMS: 'ПОЗИЦИИ РАСХОДА',
    ITEM_DESCRIPTION: 'Описание',
    ITEM_AMOUNT: 'Сумма',
    ITEM_RECIPIENT: 'Получатель',
    ITEM_MECHANICS: 'Механика',
    ITEM_REQUISITES: 'Реквизиты',
    RECIPIENT_SELF: 'Я (creator)',
    RECIPIENT_MEMBER: 'Пайщик',
    RECIPIENT_ORG: 'Организация',
    MECH_ADVANCE: 'Аванс под отчёт',
    MECH_DIRECT: 'Прямая оплата',
    TOTAL: 'Итого',
    ITEMS_COUNT_SUFFIX: 'поз.',
    SOURCE_WALLET: 'Источник средств',
    SIGNED_DIGITALLY: 'подписано электронной подписью',
  },
}

export const exampleData = {
  coop: { city: 'Москва' },
  meta: { created_at: '02.06.2026 14:00' },
  vars: { full_abbr_genitive: 'ПК', name: 'Восход' },
  user: { full_name_or_short_name: 'Иванов И.И.' },
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
      requisites: '',
    },
  ],
}
