import type { IGenerate, IMetaDocument } from '../../document'
import type { ICommonUser, ICooperativeData, IVars } from '../../model'
import type { IMeet, IMeetPoint } from '../../../interfaces/meet'

export const registry_id = 303

/**
 * Интерфейс генерации заявления с бюллетенем для голосования
 */
export interface Action extends IGenerate {
  meet_hash: string
  username: string
}

export type Meta = IMetaDocument & Action

// Модель данных
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  meet: IMeet
  user: ICommonUser
  questions: IMeetPoint[]
  vars: IVars
}

export const title = 'Заявление с бюллетенем для голосования на общем собрании'
export const description = 'Форма заявления пайщика с бюллетенем для голосования на очередном/внеочередном общем собрании пайщиков потребительского кооператива'
export const context = '<div class="digital-document"><p style="text-align: right; font-weight: bold;">{% if meet.type == \'regular\' %}{% trans \'annual_regular_label\' %}{% else %}{% trans \'annual_extraordinary_label\' %}{% endif %} {% if coop.is_branched %}{% trans \'GENERAL_MEETING_LABEL_BRANCHED\' %}{% else %}{% trans \'GENERAL_MEETING_LABEL\' %}{% endif %}</p><p style="text-align: right; font-weight: bold;">{{vars.full_abbr_genitive}} «{{vars.name}}»</p><p style="text-align: right;">{% trans \'FROM_PARTICIPANT_LABEL\' %} {{ user.full_name_or_short_name }}</p><h3 style="text-align: center;">{% trans \'APPLICATION_TITLE\' %}</h3><p>{% trans \'REQUEST_VOTE_COUNT\', meet.open_at_date %} {% if meet.type == \'regular\' %}{% trans \'annual_regular\' %}{% else %}{% trans \'annual_extraordinary\' %}{% endif %} {% if coop.is_branched %}{% trans \'GENERAL_MEETING_LABEL_LOWER_BRANCHED\' %}{% else %}{% trans \'GENERAL_MEETING_LABEL_LOWER\' %}{% endif %} {{vars.full_abbr_genitive}} «{{vars.name}}» {% trans \'namely\' %}:</p>{% for question in questions %}<p><strong>{% trans \'DECISION_BY_QUESTION\', question.number %}:</strong></p><p>{{ question.decision }}</p>{% if question.context %}<p><em>{{ question.context }}</em></p>{% endif %}<ul><li>● "{% trans \'vote_for\' %}"</li><li>● "{% trans \'vote_against\' %}"</li><li>● "{% trans \'vote_abstained\' %}"</li></ul>{% endfor %}<p>{% if coop.is_branched %}{% trans \'AUTHORIZED_SIGNATURE_LABEL\' %}{% else %}{% trans \'PARTICIPANT_SIGNATURE_LABEL\' %}{% endif %} {{ user.full_name_or_short_name }}</p></div>\n\n<style>\n  .digital-document {\n    padding: 20px;\n    white-space: pre-wrap;\n  }\n  ul {\n    list-style: none;\n    padding: 0;\n  }\n  li {\n    margin: 5px 0;\n  }\n</style>'

export const translations = {
  ru: {
    annual_regular_label: 'Очередному',
    annual_extraordinary_label: 'Внеочередному',
    annual_regular: 'очередного',
    annual_extraordinary: 'внеочередного',
    GENERAL_MEETING_LABEL: 'Общему Собранию Пайщиков',
    GENERAL_MEETING_LABEL_BRANCHED: 'Общему Собранию Уполномоченных',
    GENERAL_MEETING_LABEL_LOWER: 'Общего Собрания Пайщиков',
    GENERAL_MEETING_LABEL_LOWER_BRANCHED: 'Общего Собрания Уполномоченных',
    FROM_PARTICIPANT_LABEL: 'От Пайщика',
    APPLICATION_TITLE: 'ЗАЯВЛЕНИЕ',
    REQUEST_VOTE_COUNT: 'Прошу учесть мой голос при голосовании по Повестке дня {0} г.',
    namely: 'а именно',
    DECISION_BY_QUESTION: 'РЕШЕНИЕ по {0} вопросу',
    vote_for: 'За',
    vote_against: 'Против',
    vote_abstained: 'Воздержался',
    PARTICIPANT_SIGNATURE_LABEL: 'Пайщик',
    AUTHORIZED_SIGNATURE_LABEL: 'Уполномоченный',
  },
}
