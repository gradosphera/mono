import type { IDecisionData, IGenerate, IMetaDocument } from '../../document'
import type { ICommonRequest, ICommonUser, ICooperativeData, IVars } from '../../model'

export const registry_id = 701

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  request_id: number
  decision_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  user: ICommonUser
  request: ICommonRequest
  decision: IDecisionData
}

export const title = 'Протокол решения совета о форме и стоимости имущества'
export const description = 'Форма протокола решения совета о форме и стоимости имущества'
export const context = '<style> \nh1 {\nmargin: 0px; \ntext-align:center;\n}\nh3{\nmargin: 0px;\npadding-top: 15px;\n}\n.about {\npadding: 20px;\n}\n.about p{\nmargin: 0px;\n}\n.signature {\npadding-top: 20px;\n}\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n}\n.subheader {\npadding-bottom: 20px; \n}\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\nth, td {\n  border: 1px solid #ccc;\n  padding: 8px;\n  text-align: left;\n  word-wrap: break-word; \n  overflow-wrap: break-word; \n}\nth {\n  background-color: #f4f4f4;\n  width: 30%;\n}\n</style>\n\n<div class="digital-document"><h1 class="header">{% trans \'protocol_number\', decision.id %}</h1>\n<p style="text-align:center" class="subheader">{% trans \'council_meeting_name\' %} {{vars.full_abbr_genitive}} "{{vars.name}}"</p>\n<p style="text-align: right"> {{ meta.created_at }}, {{ coop.city }}</p>\n<table class="about">\n<tbody>\n<tr>\n  <th>{% trans \'meeting_format\' %}</th>\n  <td>{% trans \'meeting_format_value\' %}</td>\n</tr>\n<tr>\n  <th>{% trans \'meeting_place\' %}</th>\n  <td>{{ coop.full_address }}</td>\n</tr>\n<tr>\n  <th>{% trans \'meeting_date\' %}</th>\n  <td>{{ decision.date }}</td>\n</tr>\n<tr>\n  <th>{% trans \'opening_time\' %}</th>\n  <td>{{ decision.time }}</td>\n</tr>\n</tbody>\n</table>\n<h3>{% trans \'council_members\' %}</h3>\n<table>\n<tbody>\n{% for member in coop.members %}\n<tr>\n<th>{% if member.is_chairman %}{% trans \'chairman_of_the_council\' %}{% else %}{% trans \'member_of_the_council\' %}{% endif %}</th>\n<td>{{ member.last_name }} {{ member.first_name }} {{ member.middle_name }}</td>\n</tr>\n{% endfor %}\n</tbody>\n</table>\n<h3>{% trans \'meeting_legality\' %} </h3>\n<p>{% trans \'voting_results\', decision.voters_percent %} {% trans \'quorum\' %} {% trans \'chairman_of_the_meeting\', coop.chairman.last_name, coop.chairman.first_name, coop.chairman.middle_name %}.</p>\n<h3>{% trans \'agenda\' %}</h3>\n<table>\n<tbody>\n<tr>\n<th>№</th>\n<td></td>\n</tr>\n<tr>\n<th>1</th>\n<td>{% trans \'question_number_one\' %}\n\n<table>\n<tbody>\n<tr>\n  <th>{% trans \'full_name\' %}</th>\n  <td>{{ user.full_name_or_short_name }}</td>\n</tr>\n\n<tr>\n  <th>{% trans \'user.birthdate_or_ogrn\' %}</th>\n  <td>{{ user.birthdate_or_ogrn }}</td>\n</tr>\n\n<tr>\n  <th>{% trans \'article\' %}</th>\n  <td>{{request.hash}}</td>\n</tr>\n<tr>\n  <th>{% trans \'asset_title\' %}</th>\n  <td>{{request.title}}</td>\n</tr>\n<tr>\n  <th>{% trans \'form_of_asset\' %}</th>\n  <td>{% trans \'form_of_asset_type\' %}</td>\n</tr>\n<tr>\n  <th>{% trans \'unit_of_measurement\' %}</th>\n  <td>{{ request.unit_of_measurement}}</td>\n</tr>\n<tr>\n  <th>{% trans \'units\' %} </th>\n  <td>{{ request.units }}</td>\n</tr>\n<tr>\n  <th>{% trans \'unit_cost\', request.currency %}</th>\n  <td>{{ request.unit_cost }}</td>\n</tr>\n<tr>\n  <th>{% trans \'total_cost\', request.currency %}</th>\n  <td>{{ request.total_cost }}</td>\n</tr>\n</tbody>\n</table>\n<tr>\n</td>\n</tr>\n</tbody>\n</table>\n<h3>{% trans \'voting\' %}</h3>\n<p>{% trans \'vote_results\' %} </p><table>\n<tbody>\n<tr>\n<th>{% trans \'votes_for\' %}</th>\n<td>{{ decision.votes_for }}</td>\n</tr>\n<tr>\n<th>{% trans \'votes_against\' %}</th>\n<td>{{ decision.votes_against }}</td>\n</tr>\n<tr>\n<th>{% trans \'votes_abstained\' %}</th>\n<td>{{ decision.votes_abstained }}</td>\n</tr>\n</tbody>\n</table>\n<h3>{% trans \'decision_made\' %}</h3>\n<table>\n<tbody>\n<tr>\n<th>№</th>\n<td></td>\n</tr>\n<tr>\n<th>1</th>\n<td>{% trans \'decision_number_one\', user.full_name_or_short_name %}</td>\n</tr>\n</tbody>\n</table>\n<hr>\n<p>{% trans \'closing_time\', decision.time %}</p>\n<div class="signature"><p>{% trans \'signature\' %}</p><p>{% trans \'chairman\' %} {{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}</p></div></div>'

export const translations = {
  ru: {
    'meeting_format': 'Форма',
    'meeting_date': 'Дата',
    'meeting_place': 'Место',
    'opening_time': 'Время открытия',
    'council_members': 'ЧЛЕНЫ СОВЕТА',
    'voting_results': 'Количество голосов составляет {0}% от общего числа членов Совета.',
    'meeting_legality': 'СОБРАНИЕ ПРАВОМОЧНО',
    'chairman_of_the_meeting': 'Председатель собрания совета: {0} {1} {2}',
    'agenda': 'ПОВЕСТКА ДНЯ',
    'vote_results': 'По первому вопросу повестки дня проголосовали:',
    'decision_made': 'РЕШИЛИ',
    'closing_time': 'Время закрытия собрания совета: {0}.',
    'protocol_number': 'ПРОТОКОЛ № {0}',
    'council_meeting_name': 'Собрания Совета',
    'chairman_of_the_council': 'Председатель совета',
    'signature': 'Документ подписан электронной подписью.',
    'chairman': 'Председатель',
    'quorum': 'Кворум для решения поставленных на повестку дня вопросов имеется.',
    'voting': 'ГОЛОСОВАНИЕ',
    'meeting_format_value': 'Заочная',
    'member_of_the_council': 'Член совета',
    'votes_for': 'ЗА',
    'votes_against': 'ПРОТИВ',
    'votes_abstained': 'ВОЗДЕРЖАЛСЯ',
    'question_number_one': 'Утвердить форму и стоимость паевого взноса пайщика Кооператива на основании поданного заявления, а именно: ',
    'full_name': 'ФИО/ИП/Полное наименование юр./лица',
    'user.birthdate_or_ogrn': 'Дата рождения/ОГРНИП/ОГРН',
    'unit_of_measurement': 'Единицы измерения',
    'article': 'Артикул',
    'asset_title': 'Наименование / реквизиты',
    'form_of_asset': 'Форма имущества',
    'units': 'Количество',
    'unit_cost': 'Стоимость Единицы, {0}',
    'total_cost': 'Стоимость Всего, {0}',
    'form_of_asset_type': 'Материальная',
    'decision_number_one': 'Утвердить форму и стоимость паевого взноса согласно поданному заявлению и принять их по актам приема-передачи имущества.',
  },
  // ... другие переводы
}
