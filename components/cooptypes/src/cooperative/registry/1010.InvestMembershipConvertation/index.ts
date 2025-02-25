import type { IContributionAmount, IDecisionData, IGenerate, IIntellectualResult, IMetaDocument, IUHDContract } from '../../document'
import type { ICommonProgram, ICommonRequest, ICommonUser, ICooperativeData, IFirstLastMiddleName, IVars } from '../../model'
import type { IBankAccount } from '../../payments'
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from '../../users'

export const registry_id = 1010

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  subject?: string
  terms?: string
}

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  uhdContract: IUHDContract
  user: ICommonUser
  contribution: IContributionAmount
  appendix: { number: string }
}

export const title = 'Заявление на зачёт части целевого паевого взноса с ЦПП "ЦИФРОВОЙ КОШЕЛЁК" по договору УХД'
export const description = 'Форма заявления на зачёт части целевого паевого взноса с ЦПП "ЦИФРОВОЙ КОШЕЛЁК" по договору УХД'
export const context = '<div class="digital-document"><p style="text-align: right;">{% trans \'APPENDIX_TO_CONTRACT\', appendix.number, uhdContract.number, uhdContract.date %}</p>\n  <!-- Кому и от кого -->\n  <p style="text-align: right;">\n    {% trans \'TO_COOP\', coop.full_name %}<br>\n    {% trans \'FROM_PARTICIPANT\', user.full_name %}\n  </p>\n  <!-- Заголовок ЗАЯВЛЕНИЯ -->\n  <div style="text-align: center"><h3>{% trans \'APPLICATION_TITLE\' %}</h3></div><p>{% trans \'APPLICATION_INTRO\', uhdContract.number, uhdContract.date %} {% trans \'APPLICATION_CONTRIBUTION\', contribution.amount, contribution.currency, contribution.words %}</p>\n<p>{% trans \'DATE_PLACEHOLDER\' %} {% trans \'YEAR_PLACEHOLDER\' %}<br>{% trans \'PARTICIPANT_LABEL\', user.full_name %}<br>{% trans \'SIGNED_ELECTRONICALLY\' %}</p>\n  <!-- Принято -->\n  <p>{% trans \'ACCEPTED_LABEL\' %}<br>{% trans \'CHAIRMAN_POST\', coop.short_name %}<br>{{ coop.chairman_full_name }}<br>{% trans \'SIGNED_ELECTRONICALLY\' %}</p>\n\n</div>\n\n<style>\n  .digital-document {\n    padding: 20px;\n    white-space: pre-wrap;\n  }\n</style>\n'

export const translations = {
  ru: {
    APPENDIX_TO_CONTRACT: 'Приложение № {0} к ДОГОВОРУ об участии в хозяйственной деятельности № {1} от {2}',
    TO_COOP: 'В Совет {0}',
    FROM_PARTICIPANT: 'от Пайщика {0}',
    APPLICATION_TITLE: 'ЗАЯВЛЕНИЕ',
    APPLICATION_INTRO: 'В соответствии с условиями Договора об участии в хозяйственной деятельности № {0} от {1}, прошу принять от меня Целевой Членский взнос в Общество Денежными Средствами в сумме',
    APPLICATION_CONTRIBUTION: '{0} {1} ({2}). ',
    DATE_PLACEHOLDER: '05.03.2025',
    YEAR_PLACEHOLDER: 'г.',
    PARTICIPANT_LABEL: 'Пайщик {0}',
    SIGNED_ELECTRONICALLY: 'Подписано электронной подписью.',
    ACCEPTED_LABEL: '“ПРИНЯТО”',
    CHAIRMAN_POST: 'Председатель Совета {0}',
  },
  // ... другие переводы
}
