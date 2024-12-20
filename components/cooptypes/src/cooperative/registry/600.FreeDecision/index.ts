import type { IDecisionData, IGenerate, IMetaDocument, IProjectData } from '../../document'
import type { ICooperativeData } from '../../model'

export const registry_id = 600

/**
 * Интерфейс генерации решения совета
 */
export interface Action extends IGenerate {
  decision_id: number
  project_id: string
}

// Модель данных
export interface Model {
  coop: ICooperativeData
  meta: IMetaDocument
  decision: IDecisionData
  project: IProjectData
}

export const title = 'Протокола решения совета'
export const description = 'Форма протокола решения совета'
export const context = '<style> \nh1 {\nmargin: 0px; \ntext-align:center;\n}\nh3{\nmargin: 0px;\npadding-top: 15px;\n}\n.about {\npadding: 20px;\n}\n.about p{\nmargin: 0px;\n}\n.signature {\npadding-top: 20px;\n}\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n}\n.subheader {\npadding-bottom: 20px; \n}\n</style>\n\n<div class="digital-document"><h1 class="header">{% trans \'protocol_number\', decision.id %}</h1>\n<p style="text-align:center" class="subheader">{% trans \'council_meeting_name\' %}\n{{ coop.full_name }}</p>\n<p style="text-align: right"> {{ meta.created_at }}, {{ coop.city }}</p>\n<div class="about">\n<p>{% trans \'meeting_format\' %}</p>\n<p>{% trans \'meeting_place\', coop.full_address %}</p>\n<p>{% trans \'meeting_date\', decision.date %}</p>\n<p>{% trans \'opening_time\', decision.time %}</p>\n</div>\n<h3>{% trans \'council_members\' %}</h3>\n<ol>{% for member in coop.members %}\n<li>{{ member.last_name }} {{ member.first_name }} {{ member.middle_name }}{% if member.is_chairman %} {% trans \'chairman_of_the_council\' %}{% endif %}</li>\n{% endfor %}\n</ol>\n<h3>{% trans \'meeting_legality\' %} </h3>\n<p>{% trans \'voting_results\', decision.voters_percent %} {% trans \'quorum\' %} {% trans \'chairman_of_the_meeting\', coop.chairman.last_name, coop.chairman.first_name, coop.chairman.middle_name %}.</p>\n<h3>{% trans \'agenda\' %}</h3>\n<ol><li> {{project.question}}\n</li></ol>\n<h3>{% trans \'voting\' %}</h3>\n<p>{% trans \'vote_results\', decision.votes_for, decision.votes_against, decision.votes_abstained %} </p>\n<h3>{% trans \'decision_made\' %}</h3>\n<p>{{project.decision}}</p>\n<hr>\n<p>{% trans \'closing_time\', decision.time %}</p>\n\n<div class="signature"> \n<p>{% trans \'signature\' %}<p>\n<p style="text-align: right;">{% trans \'chairman\' %} {{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}</p></div></div>'

export const translations = {
  ru: {
    meeting_format: 'Форма проведения собрания совета: заочная',
    meeting_date: 'Дата проведения собрания совета: {0}',
    meeting_place: 'Место проведения собрания совета: {0}',
    opening_time: 'Время открытия собрания совета: {0}',
    council_members: 'Члены Совета',
    voting_results: 'Количество голосов составляет {0}% от общего числа членов Совета.',
    meeting_legality: 'Собрание правомочно',
    chairman_of_the_meeting: 'Председатель собрания совета: {0} {1} {2}',
    agenda: 'Повестка дня',
    vote_results: 'По первому вопросу повестки дня проголосовали: «За» – {0}; «Против» - {1}; «Воздержался» - {2}.',
    decision_made: 'Решили',
    closing_time: 'Время закрытия собрания совета: {0}.',
    protocol_number: 'Протокол № {0}',
    council_meeting_name: 'Собрания Совета',
    chairman_of_the_council: '(председатель совета)',
    signature: 'Документ подписан электронной подписью.',
    chairman: 'Председатель',
    quorum: 'Кворум для решения поставленных на повестку дня вопросов имеется.',
    voting: 'Голосование',
  },
  // ... другие переводы
}
