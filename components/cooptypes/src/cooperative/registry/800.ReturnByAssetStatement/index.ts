import type { IGenerate, IMetaDocument } from '../../document'
import type { ICommonRequest, ICommonUser, ICooperativeData, IVars } from '../../model'

export const registry_id = 800

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  request: ICommonRequest
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  user: ICommonUser
  request: ICommonRequest
}

export const title = 'Заявление на возврат паевого взноса имуществом'
export const description = 'Форма заявления на возврат паевого взноса имуществом'
export const context = '<div class="digital-document"><div style="text-align: right; margin:">\n<p style="margin: 0px !important">{% trans \'v_soviet\' %} {{ vars.full_abbr_genitive}} "{{vars.name}}"</p>\n<p style="margin: 0px !important">{% trans \'from\' %} {{ user.full_name_or_short_name}}</p>\n</div>\n<div style="text-align: center">\n<h1 class="header"> {% trans \'statement\' %}</h1>\n</div>\n<p>{% trans \'property_contribution\', coop.short_name %}</p>\n<table>\n        <tbody>\n            <tr>\n                <th>№</th>\n                <td>1</td>\n            </tr>\n            <tr>\n                <th>{% trans \'article\' %}</th>\n                <td>{{request.hash}}</td>\n            </tr>\n            <tr>\n                <th>{% trans \'asset_title\' %}</th>\n                <td>{{request.title}}</td>\n            </tr>\n            <tr>\n                <th>{% trans \'form_of_asset\' %}</th>\n                <td>{% trans \'form_of_asset_type\' %}</td>\n            </tr>\n            <tr>\n                <th>{% trans \'unit_of_measurement\' %}</th>\n                <td>{{ request.unit_of_measurement}}</td>\n            </tr>\n            <tr>\n                <th>{% trans \'units\' %}</th>\n                <td>{{ request.units }}</td>\n            </tr>\n            <tr>\n                <th>{% trans \'unit_cost\', request.currency %}</th>\n                <td>{{ request.unit_cost }}</td>\n            </tr>\n            <tr>\n                <th>{% trans \'total_cost\', request.currency %}</th>\n                <td>{{ request.total_cost }}</td>\n            </tr>\n        </tbody>\n    </table>\n<p>{% trans \'signature\' %}</p>\n<p>{{ user.full_name_or_short_name }}</p>\n<p>{{ meta.created_at }}</p>\n\n<style>\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n};\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\nth, td {\n  border: 1px solid #ccc;\n  padding: 8px;\n  text-align: left;\n  word-wrap: break-word; \n  overflow-wrap: break-word; \n}\nth {\n  background-color: #f4f4f4;\n  width: 30%;\n}\n</style>\n\n'

export const translations = {
  ru: {
    from: 'от',
    v_soviet: 'В Совет',
    statement: 'ЗАЯВЛЕНИЕ',
    property_contribution: 'Прошу возвратить принадлежащий  мне паевой взнос в {0} в соответствии с соглашением новации в виде следующего имущества:',
    signature: 'Подписано электронной подписью.',
    unit_cost: 'Стоимость Единицы, {0}',
    total_cost: 'Стоимость Всего, {0}',
    article: 'Артикул',
    asset_title: 'Наименование/Реквизиты',
    form_of_asset: 'Форма имущества',
    form_of_asset_type: 'Материальная',
    unit_of_measurement: 'Единицы измерения',
    units: 'Количество',
  },
  // ... другие переводы
}
export const exampleData = {
  vars: {
    name: 'Восход',
    full_abbr_genitive: 'потребительского кооператива',
  },
  user: {
    full_name_or_short_name: 'Иванов Иван Иванович',
  },
  coop: {
    short_name: 'ПК ВОСХОД',
  },
  meta: {
    created_at: '21.01.2025 12:13',
  },
  request: {
    hash: '123',
    title: 'Молоко "Бурёнка"',
    unit_of_measurement: 'Литр',
    units: '10',
    unit_cost: '100',
    total_cost: '1000',
    currency: 'RUB',
  },
}
