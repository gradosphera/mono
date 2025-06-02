import type { IDecisionData, IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData, IVars } from '../../model'
import type { IMeet, IQuestion } from '../../../interfaces/meet'

export const registry_id = 304

/**
 * Интерфейс генерации протокола решения общего собрания
 */
export interface Action extends IGenerate {
  meet_hash: string
}

export type Meta = IMetaDocument & Action

// Модель данных
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  decision: IDecisionData
  meet: IMeet
  questions: IQuestion[]
  vars: IVars
}

export const title = 'Протокол решения общего собрания пайщиков'
export const description = 'Форма протокола решения очередного/внеочередного общего собрания пайщиков потребительского кооператива'
export const context = '<style> \nh1 {\nmargin: 0px; \ntext-align:center;\n}\nh3{\nmargin: 0px;\npadding-top: 15px;\n}\n.about {\npadding: 20px;\n}\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n}\n.subheader {\npadding-bottom: 20px; \n}\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\nth, td {\n  border: 1px solid #ccc;\n  padding: 8px;\n  text-align: left;\n  word-wrap: break-word; \n  overflow-wrap: break-word; \n}\nth {\n  background-color: #f4f4f4;\n  width: 30%;\n}\n</style>\n\n<div class="digital-document">\n  <h1 class="header">{% trans \'protocol_number\', decision.id %}</h1>\n  <p style="text-align:center" class="subheader">{% if meet.type == \'regular\' %}{% trans \'annual_regular\' %}{% else %}{% trans \'annual_extraordinary\' %}{% endif %} {% if coop.is_branched %}{% trans \'general_meeting_name_branched\' %}{% else %}{% trans \'general_meeting_name\' %}{% endif %}</p>\n  <p style="text-align:center">{{vars.full_abbr_genitive}} «{{vars.name}}»</p>\n  <p style="text-align: right"> {{ coop.city }}, {{ decision.day }} {{ decision.month }} {{ decision.year }} г.</p>\n  <table class="about">\n    <tbody>\n      <tr>\n        <th>{% trans \'meeting_date\' %}</th>\n        <td>{{ meet.open_at_date }}</td>\n      </tr>\n      <tr>\n        <th>{% trans \'meeting_time\' %}</th>\n        <td>{{ meet.open_at_time }}</td>\n      </tr>\n      <tr>\n        <th>{% trans \'meeting_format\' %}</th>\n        <td>{% trans \'meeting_format_value\' %}</td>\n      </tr>\n      <tr>\n        <th>{% trans \'registration_datetime\' %}</th>\n        <td>{{ meet.registration_datetime }}</td>\n      </tr>\n      <tr>\n        <th>{% trans \'voting_deadline\' %}</th>\n        <td>{% trans \'no_later_than\' %} {{ meet.close_at_datetime }}</td>\n      </tr>\n    </tbody>\n  </table>\n  <p>{% trans \'quorum_available\' %} {% if coop.is_branched %}{% trans \'meeting_legal_for_decisions_branched\' %}{% else %}{% trans \'meeting_legal_for_decisions\' %}{% endif %}</p>\n  <h3>{% trans \'agenda\' %}</h3>\n  {% for question in questions %}\n  <p>{{ question.number }}. {{ question.title }}</p>\n  {% if question.context %}<p><em>{{ question.context }}</em></p>{% endif %}\n  {% endfor %}\n  {% for question in questions %}\n  <h3>{% trans \'decided_by_question\', question.number %}:</h3>\n  <p>{{ question.decision }}</p>\n  <table>\n    <tbody>\n      <tr>\n        <th>{% trans \'votes_for\' %}</th>\n        <td>{{ question.counter_votes_for }}</td>\n      </tr>\n      <tr>\n        <th>{% trans \'votes_against\' %}</th>\n        <td>{{ question.counter_votes_against }}</td>\n      </tr>\n      <tr>\n        <th>{% trans \'votes_abstained\' %}</th>\n        <td>{{ question.counter_votes_abstained }}</td>\n      </tr>\n    </tbody>\n  </table>\n  {% endfor %}\n  <p>{% trans \'closing_time\', decision.close_time %}</p>\n  <div class="signature">\n    <p>{% trans \'chairman_meeting_signature\' %} {{ meet.presider_last_name }} {{ meet.presider_first_name }} {{ meet.presider_middle_name }}</p>\n    <p>{% trans \'secretary_meeting_signature\' %} {{ meet.secretary_last_name }} {{ meet.secretary_first_name }} {{ meet.secretary_middle_name }}</p>\n  </div>\n</div>'

export const translations = {
  ru: {
    protocol_number: 'Протокол № {0}',
    annual_regular: 'очередного',
    annual_extraordinary: 'внеочередного',
    general_meeting_name: 'Общего собрания пайщиков',
    general_meeting_name_branched: 'Общего собрания уполномоченных',
    meeting_date: 'Дата проведения Собрания',
    meeting_time: 'Время проведения Собрания',
    meeting_format: 'Форма проведения собрания',
    meeting_format_value: 'заочное',
    registration_datetime: 'Дата и время регистрации участников Собрания',
    voting_deadline: 'Дата и время сбора заявлений (бюллетений) пайщиков с результатом голосования',
    no_later_than: 'не позднее',
    quorum_available: 'Кворум имеется.',
    meeting_legal_for_decisions: 'Общее собрание пайщиков правомочно для проведения и принятия решений по вопросам повестки дня.',
    meeting_legal_for_decisions_branched: 'Общее собрание уполномоченных правомочно для проведения и принятия решений по вопросам повестки дня.',
    agenda: 'Повестка дня',
    decided_by_question: 'РЕШИЛИ по {0} вопросу',
    votes_for: '● "За"',
    votes_against: '● "Против"',
    votes_abstained: '● "Воздержался"',
    closing_time: 'Время закрытия собрания: {0}',
    chairman_meeting_signature: 'Председатель Собрания',
    secretary_meeting_signature: 'Секретарь Собрания',
  },
}
