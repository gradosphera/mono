import type { IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData, IVars } from '../../model'

export const registry_id = 300

// Локальные интерфейсы для данных собрания (берутся из ICreateMeet)
interface IAgendaMeet {
  type: 'regular' | 'extraordinary'
  created_at_day: string
  created_at_month: string
  created_at_year: string
  open_at_date: string
  open_at_time: string
  registration_datetime: string
  close_at_datetime: string
  presider_last_name: string
  presider_first_name: string
  presider_middle_name: string
}

interface IAgendaQuestion {
  number: string
  title: string
  context?: string
  decision: string
}

/**
 * Интерфейс генерации предложения повестки дня
 */
export interface Action extends IGenerate {
  meet: IAgendaMeet
  questions: IAgendaQuestion[]
}

export type Meta = IMetaDocument & Action

// Модель данных
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  meet: IAgendaMeet
  questions: IAgendaQuestion[]
  vars: IVars
}

export const title = 'Предложение повестки дня общего собрания пайщиков'
export const description = 'Форма предложения повестки дня очередного/внеочередного общего собрания пайщиков потребительского кооператива'
export const context = '<div class="digital-document"><p style="text-align: center;"><h3>{% trans \'AGENDA_PROPOSAL_TITLE\' %}</h3></p><p style="text-align: center;">{% if meet.type == \'regular\' %}{% trans \'ANNUAL_REGULAR\' %}{% else %}{% trans \'ANNUAL_EXTRAORDINARY\' %}{% endif %} {% trans \'GENERAL_MEETING_SHAREHOLDERS\' %}</p><p style="text-align: center;">{{vars.full_abbr_genitive}} «{{vars.name}}»</p><p style="text-align: right;">{{ coop.city }}, {{ meet.created_at_day }} {{ meet.created_at_month }} {{ meet.created_at_year }} г.</p><p>{% trans \'MEETING_DATE_LABEL\' %}: {{ meet.open_at_date }}</p><p>{% trans \'MEETING_TIME_LABEL\' %}: {{ meet.open_at_time }}</p><p>{% trans \'MEETING_FORMAT_LABEL\' %}: {% trans \'MEETING_FORMAT_VALUE\' %}</p><p>{% trans \'REGISTRATION_DATETIME\' %}: {{ meet.registration_datetime }}</p><p>{% trans \'VOTING_DEADLINE\' %}: {% trans \'NO_LATER_THAN\' %} {{ meet.close_at_datetime }}</p><h3>{% trans \'AGENDA_QUESTIONS\' %}:</h3>{% for question in questions %}<p>{{ question.number }}. {{ question.title }}</p>{% if question.context %}<p>{{ question.context }}</p>{% endif %}{% endfor %}<h3>{% trans \'PROJECT_DECISIONS\' %}:</h3>{% for question in questions %}<p>{% trans \'PROJECT_DECISION_LABEL\' %} {{ question.number }}: {{ question.decision }}</p>{% endfor %}<p>{{ meet.presider_last_name }} {{ meet.presider_first_name }} {{ meet.presider_middle_name }}</p></div>\n\n<style>\n  .digital-document {\n    padding: 20px;\n    white-space: pre-wrap;\n  }\n</style>'

export const translations = {
  ru: {
    AGENDA_PROPOSAL_TITLE: 'ПРЕДЛОЖЕНИЕ ПОВЕСТКИ',
    ANNUAL_REGULAR: 'ОЧЕРЕДНОГО',
    ANNUAL_EXTRAORDINARY: 'ВНЕОЧЕРЕДНОГО',
    GENERAL_MEETING_SHAREHOLDERS: 'СОБРАНИЯ ПАЙЩИКОВ',
    MEETING_DATE_LABEL: 'Дата проведения Собрания',
    MEETING_TIME_LABEL: 'Время проведения Собрания',
    MEETING_FORMAT_LABEL: 'Форма проведения собрания',
    MEETING_FORMAT_VALUE: 'заочное',
    REGISTRATION_DATETIME: 'Дата и время регистрации участников Собрания',
    VOTING_DEADLINE: 'Дата и время сбора заявлений пайщиков с результатом голосования',
    NO_LATER_THAN: 'не позднее',
    AGENDA_QUESTIONS: 'ВОПРОСЫ ПОВЕСТКИ ДНЯ',
    PROJECT_DECISIONS: 'ПРОЕКТЫ РЕШЕНИЙ',
    PROJECT_DECISION_LABEL: 'ПРОЕКТ РЕШЕНИЯ по вопросу',
  },
}

// Пример данных для редактора шаблонов
export const exampleData = {
  coop: {
    city: 'Москва',
  },
  meet: {
    type: 'regular' as const,
    created_at_day: '12',
    created_at_month: 'февраля',
    created_at_year: '2024',
    open_at_date: '12.03.2024',
    open_at_time: '10:00',
    registration_datetime: '12.03.2024, 09:30',
    close_at_datetime: '15.03.2024',
    presider_last_name: 'Иванов',
    presider_first_name: 'Петр',
    presider_middle_name: 'Сидорович',
  },
  questions: [
    {
      number: '1',
      title: 'Отчет Председателя Потребительского Кооператива о проделанной работе за период с 01.01.2023 г. по 31.12.2023 г.',
      context: 'Подробная информация об отчете приведена в документе...',
      decision: 'Принять Отчет Председателя Совета и признать результаты деятельности удовлетворительными',
    },
    {
      number: '2',
      title: 'Утверждение Заключения Ревизионной Комиссии о ревизии деятельности за период с 01.01.2023 г. по 31.12.2023 г.',
      context: 'Заключение Ревизионной Комиссии содержит...',
      decision: 'Утвердить Заключение Ревизионной Комиссии о ревизии деятельности',
    },
  ],
  vars: {
    full_abbr_genitive: 'Потребительского Кооператива',
    name: 'ВОСХОД',
  },
}
