import type { IContributionAmount, IDecisionData, IGenerate, IIntellectualResult, IMetaDocument, IUHDContract } from '../../document'
import type { ICommonProgram, ICommonRequest, ICommonUser, ICooperativeData, IFirstLastMiddleName, IVars } from '../../model'
import type { IBankAccount } from '../../payments'
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from '../../users'

export const registry_id = 1005

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  contribution: IContributionAmount
}

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  uhdContract: IUHDContract
  user: ICommonUser
  contribution: IContributionAmount
}

export const title = 'Заявление на зачёт части целевого паевого взноса с ЦПП "ЦИФРОВОЙ КОШЕЛЁК" по договору УХД'
export const description = 'Форма заявления на зачёт части целевого паевого взноса с ЦПП "ЦИФРОВОЙ КОШЕЛЁК" по договору УХД'
export const context = '<div class="digital-document"><p style="text-align: right;">\n    {% trans \'TO_COOP\', coop.full_name %}<br>\n    {% trans \'FROM_PARTICIPANT\', user.full_name %}\n  </p>\n  <!-- Заголовок ЗАЯВЛЕНИЯ -->\n  <div style="text-align: center"><h3>{% trans \'APPLICATION_TITLE\' %}</h3></div><p>{% trans \'APPLICATION_INTRO\', contribution.amount, contribution.currency, uhdContract.number, uhdContract.date %}</p>\n{% trans \'PARTICIPANT_LABEL\', user.full_name %}<br>{% trans \'SIGNED_ELECTRONICALLY\' %}</p>\n</div>\n\n<style>\n  .digital-document {\n    padding: 20px;\n    white-space: pre-wrap;\n  }\n</style>\n'

export const translations = {
  ru: {
    TO_COOP: 'В Совет {0}',
    FROM_PARTICIPANT: 'от Пайщика {0}',
    APPLICATION_TITLE: 'ЗАЯВЛЕНИЕ',
    APPLICATION_INTRO: 'Прошу зачесть часть моего целевого паевого взноса по Целевой Потребительской Программе “ЦИФРОВОЙ КОШЕЛЕК” в размере {0} {1} в качестве паевого взноса по Договору участия в хозяйственной деятельности № {2} от {3} г.',
    PARTICIPANT_LABEL: 'Пайщик {0}',
    SIGNED_ELECTRONICALLY: 'Подписано электронной подписью.',
  },
  // ... другие переводы
}
