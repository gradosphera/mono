import type { IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData, IVars } from '../../model'
import type { IMeet, IMeetPoint } from '../../../interfaces/meet'

export const registry_id = 302

/**
 * Интерфейс генерации уведомления о проведении общего собрания
 */
export interface Action extends IGenerate {
  meet_hash: string
}

export type Meta = IMetaDocument & Action

// Модель данных
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  meet: IMeet
  questions: IMeetPoint[]
  vars: IVars
}

export const title = 'Уведомление о проведении общего собрания пайщиков'
export const description = 'Форма уведомления о проведении очередного/внеочередного общего собрания пайщиков потребительского кооператива'
export const context = '<div class="digital-document"><h3 style="text-align: center;">{% trans \'NOTIFICATION_TITLE\' %}</h3><p style="text-align: center;">{% trans \'MEETING_ABOUT\' %} {% if meet.type == \'regular\' %}{% trans \'annual_regular\' %}{% else %}{% trans \'annual_extraordinary\' %}{% endif %} {% if coop.is_branched %}{% trans \'GENERAL_MEETING_LABEL_BRANCHED\' %}{% else %}{% trans \'GENERAL_MEETING_LABEL\' %}{% endif %}</p><p style="text-align: center;">{{vars.full_abbr_genitive}} «{{vars.name}}»</p><p style="text-align: right;">{{ coop.city }}, {{ meet.created_at_day }} {{ meet.created_at_month }} {{ meet.created_at_year }} г</p>\n<p>{% trans \'MEETING_DATE_LABEL\' %}: {{ meet.open_at_date }}</p><p>{% trans \'MEETING_TIME_LABEL\' %}: {{ meet.open_at_time }}</p><p>{% trans \'MEETING_FORMAT_LABEL\' %}: {% trans \'MEETING_FORMAT_VALUE\' %}</p><p>{% trans \'REGISTRATION_DATETIME_LABEL\' %}: {{ meet.registration_datetime }}</p><p>{% trans \'VOTING_DEADLINE_LABEL\' %}: {% trans \'NO_LATER_THAN\' %} {{ meet.close_at_datetime }}</p><h3>{% trans \'AGENDA_QUESTIONS_LABEL\' %}:</h3>{% for question in questions %}<p>{{ question.number }}. {{ question.title }}</p>{% if question.context %}<p>{{ question.context }}</p>{% endif %}{% endfor %}<h3>{% trans \'PROJECT_DECISIONS_LABEL\' %}:</h3>{% for question in questions %}<p>{% trans \'PROJECT_DECISION_BY_QUESTION\', question.number %}:</p><p>{{ question.decision }}</p>{% endfor %}<p>{{ meet.presider_last_name }} {{ meet.presider_first_name }} {{ meet.presider_middle_name }}</p></div>\n\n<style>\n  .digital-document {\n    padding: 20px;\n    white-space: pre-wrap;\n  }\n</style>'

export const translations = {
  ru: {
    NOTIFICATION_TITLE: 'УВЕДОМЛЕНИЕ',
    MEETING_ABOUT: 'О проведении',
    annual_regular: 'очередного',
    annual_extraordinary: 'внеочередного',
    GENERAL_MEETING_LABEL: 'Общего Собрания Пайщиков',
    GENERAL_MEETING_LABEL_BRANCHED: 'Общего Собрания Уполномоченных',
    MEETING_DATE_LABEL: 'Дата проведения Собрания',
    MEETING_TIME_LABEL: 'Время проведения Собрания',
    MEETING_FORMAT_LABEL: 'Форма проведения собрания',
    MEETING_FORMAT_VALUE: 'заочное',
    REGISTRATION_DATETIME_LABEL: 'Дата и время регистрации участников Собрания',
    VOTING_DEADLINE_LABEL: 'Дата и время сбора заявлений пайщиков с результатом голосования',
    NO_LATER_THAN: 'не позднее',
    AGENDA_QUESTIONS_LABEL: 'ВОПРОСЫ ПОВЕСТКИ ДНЯ',
    PROJECT_DECISIONS_LABEL: 'ПРОЕКТЫ РЕШЕНИЙ',
    PROJECT_DECISION_BY_QUESTION: 'ПРОЕКТ РЕШЕНИЯ по {0} вопросу',
  },
}

export const exampleData = {
  coop: {
    is_branched: false,
  },
  meet: {
    type: 'regular',
    open_at_date: '15.03.2024',
  },
  user: {
    full_name_or_short_name: 'Сидоров Иван Петрович',
    last_name: 'Сидоров',
    first_name: 'Иван',
    middle_name: 'Петрович',
  },
  questions: [
    {
      number: 'первому',
      decision: 'Принять Отчет Председателя Совета Потребительского Кооператива и признать результаты деятельности удовлетворительными',
      context: 'Подробная информация о вопросе...',
    },
    {
      number: 'второму',
      decision: 'Утвердить Заключение Ревизионной Комиссии о ревизии деятельности',
      context: 'Дополнительная информация о ревизии...',
    },
  ],
  vars: {
    full_abbr_genitive: 'Потребительского Кооператива',
    name: 'ВОСХОД',
  },
}
