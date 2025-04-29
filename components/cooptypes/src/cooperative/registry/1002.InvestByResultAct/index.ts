import type { IDecisionData, IGenerate, IIntellectualResult, IMetaDocument, IUHDContract } from '../../document'
import type { ICommonProgram, ICommonRequest, ICommonUser, ICooperativeData, IFirstLastMiddleName, IVars } from '../../model'
import type { IBankAccount } from '../../payments'
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from '../../users'

export const registry_id = 1002

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  result_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  result: IIntellectualResult
  uhdContract: IUHDContract
  user: ICommonUser
  decision: IDecisionData
  act: { number: string }
}

export const title = 'Акт приёма-передачи результата интеллектуальной деятельности'
export const description = 'Форма акта приёма-передачи результата интеллектуальной деятельности'
export const context = '<div class="digital-document"><p style="text-align: right;">\n    {% trans \'TO_COOP\', coop.full_name %}<br>\n    {% trans \'FROM_PARTICIPANT\', user.full_name %}\n  </p>\n  <!-- Заголовок ЗАЯВЛЕНИЯ -->\n  <div style="text-align: center"><h3>{% trans \'APPLICATION_TITLE\' %}</h3></div><p>{% trans \'APPLICATION_INTRO\', contribution.amount, contribution.currency, uhdContract.number, uhdContract.date %}</p>\n{% trans \'PARTICIPANT_LABEL\', user.full_name %}<br>{% trans \'SIGNED_ELECTRONICALLY\' %}</p>\n</div>\n\n<style>\n  .digital-document {\n    padding: 20px;\n    white-space: pre-wrap;\n  }\n</style>\n'

export const translations = {
  ru: {
    APPENDIX_NUMBER_2: 'Приложение № 2',
    TO_JOINT_CONTRACT: 'к ДОГОВОРУ о совместной хозяйственной деятельности № {0}',
    ACT_NUMBER: 'АКТ № АППИ-{0}',
    ACCEPTANCE_OF_PROPERTY: 'приема-передачи Имущества в соответствии с условиями Договора об участии в хозяйственной деятельности № {0} от {1} г.',
    CITY_LABEL: 'г. {0}',
    DATE_LABEL: 'Дата: {0} г.',
    TABLE_HEADER_NUM: '№ п/п',
    TABLE_HEADER_NAME: 'Наименование/Реквизиты',
    TABLE_HEADER_FORM: 'Форма имущества',
    TABLE_HEADER_UNIT: 'Ед изм.',
    TABLE_HEADER_QTY: 'Количество',
    TABLE_HEADER_UNIT_PRICE: 'Стоимость единицы, {0}',
    TABLE_HEADER_TOTAL_PRICE: 'Стоимость Всего, {0}',
    OBJECT_RESULT_TEXT: 'Результат интеллектуальной деятельности и работ Пайщика, а именно: исключительное право на долю в РИД {0}.',
    OBJECT_RESULT_FORM_TEXT: 'Исключительное право на долю в РИД в соответствии с пунктом 2.1. Договора об участии в хозяйственной деятельности № {0}',
    NO_CLAIMS: 'Претензий по качеству Имущества Общество не имеет.',
    TRANSFERRED: 'ПЕРЕДАНО:',
    TRANSFERRED_SIGNATURE: 'Подписано электронной подписью.',
    RECEIVED: 'ПОЛУЧЕНО:',
    CHAIRMAN_POST: 'Председатель Совета {0}',
    RECEIVED_SIGNATURE: 'Подписано электронной подписью.',
    COOP_ACT_INTRO: '{0} (далее “Общество”) в лице Председателя Совета Общества {1}, и Пайщик {2}, составили настоящий Акт о том, что Пайщик передал, а Кооператив получил от Пайщика, в соответствии с условиями Договора об участии в хозяйственной деятельности № {3} от {4} г. и Протоколом Совета № {5} от {6} г., следующее Имущество:',
  },
  // ... другие переводы
}
