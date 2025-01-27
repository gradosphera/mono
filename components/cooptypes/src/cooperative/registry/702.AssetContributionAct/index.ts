import type { IDecisionData, IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData, IFirstLastMiddleName, IMiddlewareRequest, IMiddlewareUser, IVars } from '../../model'
import type { IOrganizationData } from '../../users'

export const registry_id = 702

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  request_id: number
  decision_id: number
  act_id: string
  receiver: string
}

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  user: IMiddlewareUser
  request: IMiddlewareRequest
  desision: IDecisionData
  currency: string
  act_id: string
  receiver: IFirstLastMiddleName
  program: {
    name: string
  }
  branch: IOrganizationData
}

export const title = 'Акт приёма-передачи имущества'
export const description = 'Форма акта приёма-передачи имущества'
export const context = '<style> \nh1 {\nmargin: 0px; \ntext-align:center;\n}\nh3{\nmargin: 0px;\npadding-top: 15px;\n}\n.about {\npadding: 20px;\n}\n.about p{\nmargin: 0px;\n}\n.signature {\npadding-top: 20px;\n}\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n}\n.subheader {\npadding-bottom: 20px; \n}\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\nth, td {\n  border: 1px solid #ccc;\n  padding: 8px;\n  text-align: left;\n  word-wrap: break-word; \n  overflow-wrap: break-word; \n}\nth {\n  background-color: #f4f4f4;\n  width: 30%;\n}\n</style>\n\n<div class="digital-document"><h1 class="header">{% trans \'act_number\', act_id %}</h1>\n<p style="text-align:center" class="subheader">{% trans \'act_name\', program.name %}</p>\n<p style="text-align: right"> {{ meta.created_at }}, {{ coop.city }}</p>\n\n{% if coop.is_branched %}<p>{% trans \'branched_contribution_act\', branch.short_name, vars.full_abbr_genitive, vars.name, user.full_name, program.name, decision_id %}</p>{% else %}<p>{% trans \'contribution_act\', vars.full_abbr, vars.name, user.full_name, program.name, decision_id %}</p>{% endif %}\n\n<table>\n<tbody>\n<tr>\n  <th>№</th>\n  <td>1</td>\n</tr>\n  <th>{% trans \'article\' %}</th>\n  <td>{{request.hash}}</td>\n</tr>\n<tr>\n  <th>{% trans \'asset_title\' %}</th>\n  <td>{{request.title}}</td>\n</tr>\n<tr>\n  <th>{% trans \'form_of_asset\' %}</th>\n  <td>{% trans \'form_of_asset_type\' %}</td>\n</tr>\n<tr>\n  <th>{% trans \'unit_of_measurement\' %}</th>\n  <td>{{ request.unit_of_measurement}}</td>\n</tr>\n<tr>\n  <th>{% trans \'units\' %} </th>\n  <td>{{ request.units }}</td>\n</tr>\n<tr>\n  <th>{% trans \'unit_cost\', currency %}</th>\n  <td>{{ request.unit_cost }}</td>\n</tr>\n<tr>\n  <th>{% trans \'total_cost\', currency %}</th>\n  <td>{{ request.total_cost }}</td>\n</tr>\n</tbody>\n</table>\n\n<p>{% trans \'no_claims\' %}</p>\n<table>\n      <tbody>\n       <tr>\n          <th></th>\n          <td>{% trans \'participant_full_name\' %}</td>\n          <td>{% trans \'signature\' %}</td>\n        </tr>\n         <tr>\n          <th>{% trans \'received_order\' %}</th>\n          <td>{{ user.full_name }}</td>\n          <td>{% trans \'signature_placeholder\' %}</td>\n        </tr>\n        <tr>\n          <th>{% trans \'transferred_order\' %}</th>\n          <td>{{ receiver.last_name }} {{ receiver.first_name }} {{ receiver.middle_name }}</td>\n          <td>{% trans \'signature_placeholder\' %}</td>\n        </tr>\n      </tbody>\n    </table>\n</div>'

export const translations = {
  ru: {
    signature: 'Подпись',
    unit_of_measurement: 'Единицы измерения',
    article: 'Артикул',
    asset_title: 'Наименование / реквизиты',
    form_of_asset: 'Форма имущества',
    units: 'Количество',
    unit_cost: 'Стоимость Единицы, {0}',
    total_cost: 'Стоимость Всего, {0}',
    form_of_asset_type: 'Материальная',
    act_number: 'АКТ №{0}',
    act_name: 'приема-передачи имущества по Целевой Потребительской Программе «{0}»',
    no_claims: 'Претензий по качеству имущества Кооператив не имеет.',
    contribution_act: '{0} "{1}" (далее Кооператив) в лице полномочного Представителя Кооператива, и пайщик Кооператива {2} (далее "Пайщик"), составили настоящий Акт о том, что Пайщик передал, а Кооператив получил от Пайщика, в соответствии с Целевой Потребительской Программой "{3}" и Протоколом Совета №{4} следующее имущество:\n',
    branched_contribution_act: '\nКооперативный участок "{0}" {1} "{2}" (далее Кооператив) в лице полномочного Представителя Кооператива, и пайщик Кооператива {3} (далее "Пайщик"), составили настоящий Акт о том, что Пайщик передал, а Кооператив получил от Пайщика, в соответствии с Целевой Потребительской Программой "{4}" и Протоколом Совета №{5} следующее имущество:',
    received_order: 'Передал',
    signature_placeholder: 'подписан электронной подписью',
    transferred_order: 'Получил',
    participant_full_name: 'ФИО/Наименование Пайщика',
  },
  // ... другие переводы
}
