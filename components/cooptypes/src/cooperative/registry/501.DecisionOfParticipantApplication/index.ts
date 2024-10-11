import type { IDecisionData, IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData } from '../../model'
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from '../../users'

export const registry_id = 501

/**
 * Интерфейс генерации решения совета
 */
export interface Action extends IGenerate {
  decision_id: number
}

// Модель данных
export interface Model {
  type: string

  individual?: IIndividualData
  organization?: IOrganizationData
  entrepreneur?: IEntrepreneurData
  coop: ICooperativeData
  meta: IMetaDocument
  decision: IDecisionData
}

export const title = 'Решение совета о приёме пайщика в кооператив'
export const description = 'Форма решения совета о приёме пайщика в потребительский кооператив'
export const context = '<style> \nh1 {\nmargin: 0px; \ntext-align:center;\n}\nh3{\nmargin: 0px;\npadding-top: 15px;\n}\n.about {\npadding: 20px;\n}\n.about p{\nmargin: 0px;\n}\n.signature {\npadding-top: 20px;\n}\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n}\n.subheader {\npadding-bottom: 20px; \n}\n</style>\n\n<div class="digital-document"><h1 class="header">{% trans \'protocol_number\', decision.id %}</h1>\n<p style="text-align:center" class="subheader">{% trans \'council_meeting_name\' %}\n{{ coop.full_name }}</p>\n<p style="text-align: right"> {{ meta.created_at }}, {{ coop.city }}</p>\n\n<div class="about">\n<p>{% trans \'meeting_format\' %}</p>\n<p>{% trans \'meeting_place\', coop.full_address %}</p>\n<p>{% trans \'meeting_date\', decision.date %}</p>\n<p>{% trans \'opening_time\', decision.time %}</p>\n</div>\n\n<h3>{% trans \'council_members\' %}</h3>\n<ol>{% for member in coop.members %}\n<li>{{ member.last_name }} {{ member.first_name }} {{ member.middle_name }}{% if member.is_chairman %} {% trans \'chairman_of_the_council\' %}{% endif %}</li>\n{% endfor %}\n</ol>\n\n<h3>{% trans \'meeting_legality\' %} </h3>\n<p>{% trans \'voting_results\', decision.voters_percent %} {% trans \'quorum\' %} {% trans \'chairman_of_the_meeting\', coop.chairman.last_name, coop.chairman.first_name, coop.chairman.middle_name %}.</p>\n\n<h3>{% trans \'agenda\' %}</h3>\n<ol><li> {% trans \'decision_joincoop1\' %}{% if type == \'individual\' %} {{individual.last_name}} {{individual.first_name}} {{individual.middle.name}} ({{individual.birthdate}} {% trans \'birthdate\' %}) {% endif %}{% if type == \'entrepreneur\' %} {% trans \'entrepreneur\' %} {{entrepreneur.last_name}} {{entrepreneur.first_name}} {{entrepreneur.middle.name}} ({% trans \'ogrnip\' %} {{entrepreneur.details.ogrn}}) {% endif %}{% if type == \'organization\' %} {{organization.short_name}} ({% trans \'ogrn\' %} {{organization.details.ogrn}}) {% endif %}{% trans \'in_participants\' %} {{ coop.short_name }}.\n</li></ol>\n\n<h3>{% trans \'voting\' %}</h3>\n<p>{% trans \'vote_results\', decision.votes_for, decision.votes_against, decision.votes_abstained %} </p>\n\n<h3>{% trans \'decision_made\' %}</h3>\n<p>{% trans \'decision_joincoop2\' %}{% if type == \'individual\' %} {{individual.last_name}} {{individual.first_name}} {{individual.middle.name}} {{individual.birthdate}} {% trans \'birthdate\' %}{% endif %} {% if type == \'entrepreneur\' %}{% trans \'entrepreneur\' %} {{entrepreneur.last_name}} {{entrepreneur.first_name}} {{entrepreneur.middle.name}}, {% trans \'ogrnip\' %} {{entrepreneur.details.ogrn}}{% endif %} {% if type == \'organization\' %} {{organization.short_name}}, {% trans \'ogrn\' %} {{organization.details.ogrn}} {% endif %}</p>\n<hr>\n<p>{% trans \'closing_time\', decision.time %}</p>\n\n<div class="signature"> \n<p>{% trans \'signature\' %}<p>\n<p style="text-align: right;">{% trans \'chairman\' %} {{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}</p></div></div>'

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
    birthdate: 'г.р.',
    ogrnip: 'ОГРНИП',
    entrepreneur: 'ИП',
    ogrn: 'ОГРН',
    quorum: 'Кворум для решения поставленных на повестку дня вопросов имеется.',
    voting: 'Голосование',
    in_participants: 'о приёме в пайщики',
    decision_joincoop1: 'Рассмотреть заявление',
    decision_joincoop2: 'Принять нового пайщика',
  },
  // ... другие переводы
}
