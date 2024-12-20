import type { IDecisionData, IGenerate, IMetaDocument, IProjectData } from '../../document'
import type { ICooperativeData } from '../../model'

export const registry_id = 599

/**
 * Интерфейс генерации решения совета
 */
export interface Action extends IGenerate {
  project_id: string
}

// Модель данных
export interface Model {
  coop: ICooperativeData
  meta: IMetaDocument
  project: IProjectData
  suggester_name: string /// < кто предложил
}

export const title = 'Проект протокола решения'
export const description = 'Форма проекта протокола решения'
export const context = '<style> \nh1 {\nmargin: 0px; \ntext-align:center;\n}\nh3{\nmargin: 0px;\npadding-top: 15px;\n}\n.about {\npadding: 20px;\n}\n.about p{\nmargin: 0px;\n}\n.signature {\npadding-top: 20px;\n}\n.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n}\n.subheader {\npadding-bottom: 20px; \n}\n</style>\n\n<div class="digital-document"><h1 class="header">{% trans \'protocol_number\' %}</h1>\n<p style="text-align:center" class="subheader">{% trans \'council_meeting_name\' %}\n{{ coop.full_name }}</p>\n<p style="text-align: right"> {{ meta.created_at }}, {{ coop.city }}</p>\n<h3>{% trans \'agenda\' %}</h3>\n<ol><li> {{project.question}}</li></ol>\n<h3>{% trans \'decision_made\' %}</h3>\n<ol><li>{{project.decision}}</li></ol>\n<hr>\n\n<div class="signature"> \n<p>{% trans \'signature\' %}<p>\n<p style="text-align: right;">{% trans \'member\' %} {{ suggester_name}} </p></div></div>'

export const translations = {
  ru: {
    agenda: 'Повестка дня',
    decision_made: 'Решение',
    protocol_number: 'Проект решения',
    council_meeting_name: 'Собрания Совета',
    signature: 'Документ подписан электронной подписью',
    member: 'Предложил',
  },
  // ... другие переводы
}
