import type { IDecisionData, IGenerate, IIntellectualResult, IMetaDocument, IUHDContract } from '../../document'
import type { ICommonProgram, ICommonRequest, ICommonUser, ICooperativeData, IFirstLastMiddleName, IVars } from '../../model'
import type { IBankAccount } from '../../payments'
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from '../../users'

export const registry_id = 1001

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  result: IIntellectualResult
}

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  result: IIntellectualResult
  uhdContract: IUHDContract
  user: ICommonUser
}

export const title = 'Заявление на внесение результата интеллектуальной деятельности'
export const description = 'Форма заявления на внесение результата интеллектуальной деятельности'
export const context = '<div class="digital-document">\n  <p style="text-align: right; margin-bottom: 0px;">{% trans \'APPENDIX_NUMBER\' %}</p><p style="text-align: right; margin-top: 0px;">{% trans \'TO_CONTRACT\', uhdContract.number %}</p>\n  <p style="text-align:right;"><strong>{% trans \'TO_COOP\', vars.coop_name %}</strong><br><strong>{% trans \'FROM_PARTICIPANT\', user.full_name %}</strong>\n  </p><div style="text-align: center"><h3>{% trans \'STATEMENT_HEADER\' %}</h3></div>\n  <p>\n    {% trans \'IN_ACCORDANCE\', uhdContract.number, uhdContract.date %}\n  </p>\n  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">\n    <tbody>\n      <tr>\n        <th style="width: 30%; border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4;">{% trans \'NAME_TITLE\' %}</th>\n        <td style="border: 1px solid #ccc; padding: 8px;">{% trans \'SHARE_CONTRIBUTION\', result.name %}</td>\n      </tr>\n      <tr>\n        <th style="width: 30%; border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4;">{% trans \'PROP_FORM\' %}</th>\n        <td style="border: 1px solid #ccc; padding: 8px;">{% trans \'PROP_FORM_TEXT\',  uhdContract.number %}</td>\n      </tr>\n      <tr>\n        <th style="width: 30%; border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4;">{% trans \'DESCRIPTION_TITLE\' %}</th>\n        <td style="border: 1px solid #ccc; padding: 8px;">{% trans \'DESCRIPTION_TEXT\', result.name %}</td>\n      </tr>\n      <tr>\n        <th style="width: 30%; border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4;">{% trans \'PURPOSE_TITLE\' %}</th>\n        <td style="border: 1px solid #ccc; padding: 8px;">{% trans \'PURPOSE_TEXT\', uhdContract.number %}</td>\n      </tr>\n      <tr>\n        <th style="width: 30%; border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4;">{% trans \'OTHER_CHARACTERISTICS_TITLE\' %}</th>\n        <td style="border: 1px solid #ccc; padding: 8px;">{{result.description}}</td>\n      </tr>\n    </tbody>\n  </table>\n  <div style="margin-top: 20px;">\n    <table style="width: 100%; border-collapse: collapse;">\n      <tbody>\n        <tr>\n          <th style="border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4; width: 30%;">{% trans \'NUMBER_ROW\' %}</th>\n          <td style="border: 1px solid #ccc; padding: 8px;">1</td>\n        </tr>\n        <tr>\n          <th style="border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4;">{% trans \'NAME_REQUISITES\' %}</th>\n          <td style="border: 1px solid #ccc; padding: 8px;">{% trans \'ITEM_NAME_TEXT\', result.name %}</td>\n        </tr>\n        <tr>\n          <th style="border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4;">{% trans \'UNIT_TITLE\' %}</th>\n          <td style="border: 1px solid #ccc; padding: 8px;">{% trans \'UNIT_VALUE\' %}</td>\n        </tr>\n        <tr>\n          <th style="border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4;">{% trans \'QUANTITY_TITLE\' %}</th>\n          <td style="border: 1px solid #ccc; padding: 8px;">{{result.quantity}}</td>\n        </tr>\n        <tr>\n          <th style="border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4;">{% trans \'UNIT_PRICE_TITLE\', result.currency %}</th>\n          <td style="border: 1px solid #ccc; padding: 8px;">{{result.unit_price}}</td>\n        </tr>\n        <tr>\n          <th style="border: 1px solid #ccc; padding: 8px; background-color: #f4f4f4;">{% trans \'TOTAL_PRICE_TITLE\', result.currency %}</th>\n          <td style="border: 1px solid #ccc; padding: 8px;">{{result.total_price}}</td>\n        </tr>\n        <tr>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n<p style="margin-top: 20px;">{% trans \'PROPERTY_CONFIRM\' %}</p>\n\n<p>{{meta.created_at}}</p><p>{{ user.full_name }}</p><p>{% trans \'PARTICIPANT_SIGNATURE\' %}</p>\n\n<p>{% trans \'ACCEPTED_LABEL\' %}</p>\n<p>{% trans \'CHAIRMAN\', coop.short_name %}</p><p>{{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}</p><p>{% trans \'PARTICIPANT_SIGNATURE\' %}</p>\n  </p>\n</div>\n<style>\n  .digital-document {\n    padding: 20px;\n    white-space: pre-wrap;\n  }\n  table {\n    width: 100%;\n    border-collapse: collapse;\n  }\n  th, td {\n    border: 1px solid #ccc;\n    padding: 8px;\n    text-align: left;\n    vertical-align: top;\n    word-wrap: break-word;\n    overflow-wrap: break-word;\n  }\n  th {\n    background-color: #f4f4f4;\n  }\n</style>\n'

export const translations = {
  ru: {
    APPENDIX_NUMBER: 'Приложение № 1',
    TO_CONTRACT: 'к ДОГОВОРУ об участии в хозяйственной деятельности № {0}',
    TO_COOP: 'В Совет Потребительского Кооператива «{0}»',
    FROM_PARTICIPANT: 'от Пайщика {0}',
    STATEMENT_HEADER: 'ЗАЯВЛЕНИЕ',
    IN_ACCORDANCE: 'В соответствии с условиями Договора об участии в хозяйственной деятельности № {0} от {1} г., прошу принять от меня Паевой взнос в Общество следующим Имуществом:',
    NAME_TITLE: 'Наименование / название',
    SHARE_CONTRIBUTION: 'Паевой взнос – {0}',
    PROP_FORM: 'Форма Имущества',
    PROP_FORM_TEXT: 'Исключительное право на долю в Результате интеллектуальной деятельности (РИД) в соответствии с пунктом 2.1. Договора об участии в хозяйственной деятельности № {0}',
    DESCRIPTION_TITLE: 'Описание',
    DESCRIPTION_TEXT: 'Овеществленные (на бумажных и/или цифровых носителях) и выраженные в денежной оценке исключительное право на долю в РИД, а именно: {0}',
    PURPOSE_TITLE: 'Назначение',
    PURPOSE_TEXT: 'В целях реализации Предмета Договора об участии в хозяйственной деятельности № {0}',
    OTHER_CHARACTERISTICS_TITLE: 'Прочие характеристики и описание',
    NUMBER_ROW: '№ п/п',
    NAME_REQUISITES: 'Наименование / Реквизиты',
    ITEM_NAME_TEXT: 'Имущество – исключительное право на долю в РИД {0}',
    UNIT_TITLE: 'Ед изм.',
    UNIT_VALUE: 'доля',
    QUANTITY_TITLE: 'Количество',
    UNIT_PRICE_TITLE: 'Стоимость единицы, {0}',
    TOTAL_PRICE_TITLE: 'Стоимость всего, {0}',
    PROPERTY_CONFIRM: 'Я подтверждаю, что Имущество, которое я вношу паевым взносом в Общество, принадлежит мне на праве собственности, в споре и под арестом не состоит.',
    PARTICIPANT_SIGNATURE: 'Подписано электронной подписью',
    ACCEPTED_LABEL: 'ПРИНЯТО',
    CHAIRMAN: 'Председатель Совета {0}',
  },
  // ... другие переводы
}
