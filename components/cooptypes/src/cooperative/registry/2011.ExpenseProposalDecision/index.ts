import type { IGenerate, IMetaDocument } from '../../document'
import type { ICommonUser, ICooperativeData, IVars } from '../../model'
import type { IExpenseItem, IExpenseProposalHeader } from '../2010.ExpenseProposalStatement'

export const registry_id = 2011

export type ExpenseProposalDecisionKind = 'approve' | 'decline'

export interface IExpenseProposalDecisionBody {
  kind: ExpenseProposalDecisionKind
  reason?: string
  protocol_number?: string
  protocol_date?: string
}

export interface Action extends IGenerate {
  proposal_hash: string
  proposal: IExpenseProposalHeader
  items: IExpenseItem[]
  decision: IExpenseProposalDecisionBody
}

export type Meta = IMetaDocument & Action

export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  user: ICommonUser
  vars: IVars
  proposal_hash: string
  /** Короткий идентификатор СЗ (первые 16 символов хэша, uppercase) */
  proposal_short_hash: string
  proposal: IExpenseProposalHeader
  items: IExpenseItem[]
  decision: IExpenseProposalDecisionBody
}

export const title = 'Протокол-1: решение по служебной записке о расходах'
export const description = 'Решение председателя/совета об утверждении (или отказе) служебной записки-сметы о расходах. Подписывается председателем поверх документа Creator.'

export const context = `<style>h1{margin:0;text-align:center;}h3{margin:0;padding-top:15px;text-align:center;}.digital-document{padding:20px;white-space:pre-wrap;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:left;word-wrap:break-word;overflow-wrap:break-word;}th{background-color:#f4f4f4;}.summary{margin-top:20px;text-align:right;font-weight:bold;}.decision-block{padding-top:20px;border:2px solid #333;padding:15px;margin-top:20px;}.signature{padding-top:30px;}</style><div class="digital-document"><div style="padding-bottom:30px;"><h1 style="text-align:center">{% trans 'PROTOCOL_TITLE' %}</h1><p style="text-align:center">{{vars.full_abbr_genitive}} «{{vars.name}}»</p><p style="text-align:right;padding-top:20px">{{ coop.city }}, {{ meta.created_at }}</p>{% if decision.protocol_number %}<p style="text-align:center;padding-top:10px;">{% trans 'PROTOCOL_NUMBER' %} {{ decision.protocol_number }} {% trans 'FROM' %} {{ decision.protocol_date }}</p>{% endif %}</div><h3>{% trans 'REFERENCE' %}</h3><p>{% trans 'REFERENCE_BODY' %}</p><p><strong>{% trans 'REFERENCE_HASH' %}:</strong> № {{ proposal_short_hash }}</p><p><strong>{% trans 'PURPOSE' %}:</strong> {{ proposal.description }}</p><h3 style="padding-top:20px;">{% trans 'ITEMS' %}</h3><table><thead><tr><th>№</th><th>{% trans 'ITEM_DESCRIPTION' %}</th><th>{% trans 'ITEM_AMOUNT' %}</th></tr></thead><tbody>{% for item in items %}<tr><td>{{ item.number }}</td><td>{{ item.description }}</td><td>{{ item.amount }}</td></tr>{% endfor %}</tbody></table><p class="summary">{% trans 'TOTAL' %}: {{ proposal.total_amount }}</p><div class="decision-block"><h3>{% trans 'DECISION_HEADER' %}</h3>{% if decision.kind == 'approve' %}<p><strong>{% trans 'DECISION_APPROVE' %}</strong></p>{% else %}<p><strong>{% trans 'DECISION_DECLINE' %}</strong></p>{% if decision.reason %}<p>{% trans 'DECLINE_REASON' %}: {{ decision.reason }}</p>{% endif %}{% endif %}</div><div class="signature"><p>{{ user.full_name_or_short_name }}</p><p>{% trans 'CHAIRMAN_SIGNATURE' %}</p><p>{% trans 'SIGNED_DIGITALLY' %}</p></div></div>`

export const translations = {
  ru: {
    PROTOCOL_TITLE: 'ПРОТОКОЛ-1: РЕШЕНИЕ ПО СЛУЖЕБНОЙ ЗАПИСКЕ О РАСХОДАХ',
    PROTOCOL_NUMBER: '№',
    FROM: 'от',
    REFERENCE: 'ОСНОВАНИЕ',
    REFERENCE_BODY: 'Рассмотрена служебная записка-смета о расходах:',
    REFERENCE_HASH: 'Служебная записка',
    PURPOSE: 'Цель',
    ITEMS: 'ПОЗИЦИИ РАСХОДА',
    ITEM_DESCRIPTION: 'Описание',
    ITEM_AMOUNT: 'Сумма',
    TOTAL: 'Итого',
    DECISION_HEADER: 'РЕШЕНИЕ',
    DECISION_APPROVE: 'УТВЕРДИТЬ расход в полном объёме согласно настоящей служебной записке.',
    DECISION_DECLINE: 'ОТКАЗАТЬ в утверждении расхода.',
    DECLINE_REASON: 'Основание отказа',
    CHAIRMAN_SIGNATURE: 'Председатель',
    SIGNED_DIGITALLY: 'подписано электронной подписью',
  },
}

export const exampleData = {
  coop: { city: 'Москва' },
  meta: { created_at: '03.06.2026 11:00' },
  vars: { full_abbr_genitive: 'ПК', name: 'Восход' },
  user: { full_name_or_short_name: 'Петров П.П.' },
  proposal_hash: '55c470039a8c53ce1b4b6e842fe8063ab3d5b85ba2ba8ab0ae6e30be3ad328b7',
  proposal_short_hash: '55C470039A8C53CE',
  proposal: {
    description: 'Закупка хостинга и бухгалтерских услуг на июнь 2026',
    total_amount: '15000.00 RUB',
    items_count: 2,
    source_wallet: 'w.cap.bla',
  },
  items: [
    { number: '1', description: 'Аренда серверов Yandex Cloud', amount: '12000.00 RUB' },
    { number: '2', description: 'Канцелярия для офиса', amount: '3000.00 RUB' },
  ],
  decision: {
    kind: 'approve',
    protocol_number: '15',
    protocol_date: '03.06.2026',
  },
}
