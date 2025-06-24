import type { IGenerate, IMetaDocument } from '../../document'
import type { ICommonUser, ICooperativeData, IVars } from '../../model'

export const registry_id = 900

// Интерфейс запроса без чувствительных данных
export interface IMoneyReturnRequest {
  method_id: string // ID платежного метода вместо банковских реквизитов
  amount: string
  currency: string
}

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  request: IMoneyReturnRequest
}

export type Meta = IMetaDocument & Action

// Модель данных документа с детальными платежными данными
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  user: ICommonUser
  request: {
    payment_details: string // Детали платежа из хранилища
    amount: string
    currency: string
  }
}

export const title = 'Заявление на возврат паевого взноса денежными средствами'
export const description = 'Форма заявления на возврат паевого взноса денежными средствами'
export const context = '<div class="digital-document"><div style="text-align: right; margin:">\n<p style="margin: 0px !important">{% trans \'v_soviet\' %} {{ vars.full_abbr_genitive}} "{{vars.name}}"</p>\n<p style="margin: 0px !important">{% trans \'from_participant\' %}</p>\n<p style="margin: 0px !important">{{ user.full_name_or_short_name}}</p>\n</div>\n<div style="text-align: center">\n<h1 class="header">{% trans \'statement\' %}</h1>\n</div>\n<p>{% trans \'money_return_request\', coop.short_name %}</p>\n<table>\n<tbody>\n<tr>\n<th>{% trans \'asset_form\' %}</th>\n<td>{% trans \'money_assets\' %}</td>\n</tr>\n<tr>\n<th>{% trans \'name_requisites\' %}</th>\n<td>{% trans \'return_part_contribution\' %}</td>\n</tr>\n<tr>\n<th>№</th>\n<td>1</td>\n</tr>\n<tr>\n<th>{% trans \'payment_details_field\' %}</th>\n<td style="white-space: pre-line;">{{ request.payment_details }}</td>\n</tr>\n<tr>\n<th>{% trans \'article\' %}</th>\n<td>na</td>\n</tr>\n<tr>\n<th>{% trans \'unit_measurement\' %}</th>\n<td>{{ request.currency }}</td>\n</tr>\n<tr>\n<th>{% trans \'quantity\' %}</th>\n<td>{{ request.amount }}</td>\n</tr>\n<tr>\n<th>{% trans \'unit_cost\' %}</th>\n<td>na</td>\n</tr>\n<tr>\n<th>{% trans \'total_cost\' %}</th>\n<td>{{ request.amount }} {{ request.currency }}</td>\n</tr>\n</tbody>\n</table>\n<p>{% trans \'signature\' %}</p>\n<p>{{ user.full_name_or_short_name }}</p>\n<p>{{ meta.created_at }}</p>\n\n<style>\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n};\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\nth, td {\n  border: 1px solid #ccc;\n  padding: 8px;\n  text-align: left;\n  word-wrap: break-word; \n  overflow-wrap: break-word; \n}\nth {\n  background-color: #f4f4f4;\n  width: 30%;\n}\n</style>\n\n'

export const translations = {
  ru: {
    v_soviet: 'В Совет',
    from_participant: 'от пайщика',
    statement: 'ЗАЯВЛЕНИЕ',
    money_return_request: 'Прошу возвратить принадлежащий мне паевой взнос в {0} в соответствии с соглашением новации (ст.414 ГК РФ) в виде следующего имущества:',
    payment_details_field: 'Реквизиты получателя',
    article: 'Артикул',
    name_requisites: 'Наименование/Реквизиты',
    asset_form: 'Форма имущества',
    unit_measurement: 'Ед изм.',
    quantity: 'Количество',
    unit_cost: 'Стоимость единицы',
    total_cost: 'Стоимость Всего',
    return_part_contribution: 'Возврат паевого взноса',
    money_assets: 'Денежные средства',
    signature: 'Подписано электронной подписью.',
  },
  // ... другие переводы
}

export const exampleData = {
  vars: {
    name: 'ВОСХОД',
    full_abbr_genitive: 'Потребительского Кооператива',
  },
  user: {
    full_name_or_short_name: 'Иванов Иван Иванович',
  },
  coop: {
    short_name: 'ПК "ВОСХОД"',
  },
  meta: {
    created_at: '18.03.2025',
  },
  request: {
    amount: '50 000',
    currency: 'Руб.',
    payment_details: '№ счета получателя: 40817 810 6 3826 1231150\nБанк получателя: ПАО «Сбербанк»\nКорр. счет банка: 30101 810 4 0000 0000225\nБИК 44525225\nПолучатель: Иванов Иван Иванович',
  },
}
