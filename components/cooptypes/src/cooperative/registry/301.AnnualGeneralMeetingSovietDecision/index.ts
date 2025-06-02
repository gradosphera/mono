import type { IDecisionData, IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData, IVars } from '../../model'
import type { IMeet, IMeetPoint } from '../../../interfaces/meet'

export const registry_id = 301

/**
 * Интерфейс генерации решения совета о созыве общего собрания
 */
export interface Action extends IGenerate {
  decision_id: number
  meet_hash: string
}

export type Meta = IMetaDocument & Action

// Модель данных
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  decision: IDecisionData
  meet: IMeet
  questions: IMeetPoint[]
  vars: IVars
}

export const title = 'Решение совета о созыве общего собрания пайщиков'
export const description = 'Форма протокола собрания совета о созыве очередного/внеочередного общего собрания пайщиков потребительского кооператива'
export const context = '<style> \nh1 {\nmargin: 0px; \ntext-align:center;\n}\nh3{\nmargin: 0px;\npadding-top: 15px;\n}\n.about {\npadding: 20px;\n}\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n}\n.subheader {\npadding-bottom: 20px; \n}\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\nth, td {\n  border: 1px solid #ccc;\n  padding: 8px;\n  text-align: left;\n  word-wrap: break-word; \n  overflow-wrap: break-word; \n}\nth {\n  background-color: #f4f4f4;\n  width: 30%;\n}\n</style>\n\n<div class="digital-document">\n  <h1 class="header">{% trans \'protocol_number\', decision.id, decision.day, decision.month, decision.year %}</h1>\n  <p style="text-align:center" class="subheader">{% trans \'council_meeting_name\' %}</p>\n  <p style="text-align:center">{{ vars.full_abbr_genitive }} «{{ vars.name }}»</p>\n  <p style="text-align: right"> {{ coop.city }}, {{ decision.day }} {{ decision.month }} {{ decision.year }} г.</p>\n  <table class="about">\n    <tbody>\n      <tr>\n        <th>{% trans \'meeting_format\' %}</th>\n        <td>{% trans \'meeting_format_value\' %}</td>\n      </tr>\n      <tr>\n        <th>{% trans \'meeting_date\' %}</th>\n        <td>{{ decision.day }} {{ decision.month }} {{ decision.year }} г.</td>\n      </tr>\n      <tr>\n        <th>{% trans \'opening_time\' %}</th>\n        <td>{{ decision.open_time }}</td>\n      </tr>\n    </tbody>\n  </table>\n  <h3>{% trans \'council_members\' %}</h3>\n  <table>\n    <tbody>\n      {% for member in coop.members %}\n      <tr>\n        <th>{% if member.is_chairman %}{% trans \'chairman_of_the_council\' %}{% else %}{% trans \'member_of_the_council\' %}{% endif %}</th>\n        <td>{{ member.last_name }} {{ member.first_name }} {{ member.middle_name }}{% if member.is_chairman %} ({% trans \'chairman_council_label\' %}){% endif %}</td>\n      </tr>\n      {% endfor %}\n    </tbody>\n  </table>\n  <p>{% trans \'quorum_description\', decision.quorum_percent %} {% trans \'quorum_available\' %} {% trans \'meeting_legal\' %}</p>\n  <h3>{% trans \'agenda\' %}</h3>\n  <table>\n    <tbody>\n      <tr>\n        <th>№</th>\n        <td></td>\n      </tr>\n      <tr>\n        <th>{% trans \'agenda_item\' %}</th>\n        <td>{% trans \'convene_meeting_description\' %} {% if meet.type == \'regular\' %}{% trans \'annual_regular\' %}{% else %}{% trans \'annual_extraordinary\' %}{% endif %} {% if coop.is_branched %}{% trans \'general_meeting_form_branched\' %}{% else %}{% trans \'general_meeting_form\' %}{% endif %} {{ meet.close_at_date }}:</td>\n      </tr>\n      {% for question in questions %}\n      <tr>\n        <th>{{ question.number }}.</th>\n        <td>{{ question.title }}</td>\n      </tr>\n      {% if question.context %}\n      <tr>\n        <th></th>\n        <td><em>{{ question.context }}</em></td>\n      </tr>\n      {% endif %}\n      {% endfor %}\n    </tbody>\n  </table>\n  <p>{% trans \'voting_results_label\' %}: {% trans \'votes_for_label\' %} – {{ decision.votes_for }}; {% trans \'votes_against_label\' %} - {{ decision.votes_against }}; {% trans \'votes_abstained_label\' %} - {{ decision.votes_abstained }}.</p>\n  <h3>{% trans \'decision_made\' %}</h3>\n  <p>{% trans \'convene_meeting_decision\' %} {% if meet.type == \'regular\' %}{% trans \'annual_regular\' %}{% else %}{% trans \'annual_extraordinary\' %}{% endif %} {% if coop.is_branched %}{% trans \'general_meeting_form_branched\' %}{% else %}{% trans \'general_meeting_form\' %}{% endif %} {{ meet.close_at_date }} {% trans \'with_agenda\' %}:</p>\n  {% for question in questions %}\n  <p>{{ question.number }}. {{ question.title }}</p>\n  {% endfor %}\n  <hr>\n  <p>{% trans \'closing_time\', decision.close_time %}</p>\n  <div class="signature">\n    <p>{% trans \'chairman_council_signature\' %} {{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}</p>\n  </div>\n</div>'

export const translations = {
  ru: {
    protocol_number: 'Протокол № {0}',
    council_meeting_name: 'Собрания Совета',
    meeting_format: 'Форма проведения Собрания Совета',
    meeting_format_value: 'заочное',
    meeting_date: 'Дата проведения Собрания Совета',
    opening_time: 'Время открытия Собрания Совета',
    council_members: 'Члены Совета',
    chairman_of_the_council: 'Председатель Совета',
    member_of_the_council: 'Член совета',
    chairman_council_label: 'Председатель Совета',
    quorum_description: 'Кворум составляет {0}% от общего числа членов Совета',
    quorum_available: 'Кворум для решения поставленных на повестку дня вопросов имеется',
    meeting_legal: 'Собрание правомочно',
    agenda: 'Повестка дня',
    agenda_item: '1',
    convene_meeting_description: 'О созыве',
    annual_regular: 'очередного',
    annual_extraordinary: 'внеочередного',
    general_meeting_form: 'Общего собрания пайщиков в заочной форме с датой завершения голосования',
    general_meeting_form_branched: 'Общего собрания уполномоченных в заочной форме с датой завершения голосования',
    voting_results_label: 'Голосовали',
    votes_for_label: '«За»',
    votes_against_label: '«Против»',
    votes_abstained_label: '«Воздержался»',
    decision_made: 'Решили',
    convene_meeting_decision: 'созвать',
    with_agenda: 'со следующей повесткой дня',
    closing_time: 'Время закрытия Собрания Совета: {0}',
    chairman_council_signature: 'Председатель Совета',
  },
}
