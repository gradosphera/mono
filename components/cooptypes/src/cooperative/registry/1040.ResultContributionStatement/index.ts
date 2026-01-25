import type { ICommonUser, ICooperativeData, IVars } from '../../model'
import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1040

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  contributor_hash: string
  contributor_created_at: string
  blagorost_agreement_hash: string
  blagorost_agreement_created_at: string
  project_name: string
  component_name: string
  result_hash: string
  percent_of_result: string
  total_amount: string
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  common_user: ICommonUser
  contributor_hash: string
  contributor_short_hash: string
  contributor_created_at: string
  blagorost_agreement_hash: string
  blagorost_agreement_short_hash: string
  blagorost_agreement_created_at: string
  project_name: string
  component_name: string
  result_hash: string
  result_short_hash: string
  percent_of_result: string
  total_amount: string
}

export const title = 'Заявление о взносе результатов'
export const description = 'Заявление о внесении паевого взноса результатами интеллектуальной деятельности'

export const context = `<div class="digital-document"><div style="text-align: right"><p>{% trans 'appendix_title' %} № {{ result_short_hash }}</p><p>{% trans 'to_agreement' %} № {{ contributor_short_hash }}</p><p>{% trans 'to_council' %} {{ vars.full_abbr_genitive }} "{{ vars.name }}"</p><p>{% trans 'from_shareholder' %} {{ common_user.full_name_or_short_name }}</p></div><div style="text-align: center"><h2>{% trans 'statement_title' %} № ЗПВИ - {{ result_short_hash }}</h2></div><p>{% trans 'statement_text' %} № {{ contributor_short_hash }} {% trans 'from_date' %} {{ contributor_created_at }} {% trans 'and_appendix' %} №{{ blagorost_agreement_short_hash }} {% trans 'from_date' %} {{ blagorost_agreement_created_at }} {% trans 'blagorost_agreement_text' %}, {% trans 'request_contribution' %}:</p><table border="1" style="width: 100%; border-collapse: collapse;"><tr><td style="font-weight: bold;">{% trans 'property_name' %}</td><td>{% trans 'share_contribution' %} "{{ project_name }}" {% trans 'component' %} "{{ component_name }}"</td></tr><tr><td style="font-weight: bold;">{% trans 'property_form' %}</td><td>{% trans 'property_form_text' %} {{ percent_of_result }}% {% trans 'in_copyright_object' %} № {{ contributor_short_hash }}</td></tr><tr><td style="font-weight: bold;">{% trans 'description' %}</td><td>{% trans 'description_text' %} {{ percent_of_result }}% {% trans 'in_copyright_object_short' %}, {% trans 'namely' %} c9s://{{ result_hash }}</td></tr><tr><td style="font-weight: bold;">{% trans 'purpose' %}</td><td>{% trans 'purpose_text' %} № {{ contributor_short_hash }}</td></tr><tr><td style="font-weight: bold;">{% trans 'other_characteristics' %}</td><td>{% trans 'other_characteristics_text' %} №{{ result_hash }}.</td></tr></table><table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;"><tr><td style="font-weight: bold;">{% trans 'number_pp' %}</td><td style="font-weight: bold;">{% trans 'name_details' %}</td><td style="font-weight: bold;">{% trans 'unit' %}</td><td style="font-weight: bold;">{% trans 'quantity' %}</td><td style="font-weight: bold;">{% trans 'total_cost' %}</td></tr><tr><td>1</td><td>{% trans 'property_description' %} {{ percent_of_result }}% {% trans 'in_copyright_object_short' %}</td><td>{% trans 'share' %}</td><td>{{ percent_of_result }}%</td><td>{{ total_amount }}</td></tr><tr><td></td><td style="font-weight: bold;">{% trans 'total' %}</td><td></td><td>{{ percent_of_result }}%</td><td>{{ total_amount }}</td></tr></table><p>{% trans 'property_confirmation' %}.</p><p>{% trans 'shareholder' %}: {{ common_user.full_name_or_short_name }}</p><p>{{ meta.created_at }}</p><p>{% trans 'signed_by_digital_signature' %}</p><p style="margin-top: 30px;">{% trans 'accepted' %}</p><p>{% trans 'signed_by_digital_signature' %}</p><p>{% trans 'chairman_title' %}</p><p>{{ vars.short_abbr }} "{{ vars.name }}"</p><p>{{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}</p></div><style>.digital-document {padding: 20px;white-space: pre-wrap;}</style>`

export const translations = {
  ru: {
    appendix_title: 'Приложение',
    to_agreement: 'к ДОГОВОРУ об участии в хозяйственной деятельности',
    to_council: 'В Совет',
    from_shareholder: 'от Пайщика',
    statement_title: 'ЗАЯВЛЕНИЕ',
    statement_text: 'В соответствии с условиями Договора об участии в хозяйственной деятельности',
    from_date: 'от',
    and_appendix: 'и его Приложением',
    blagorost_agreement_text: 'о соглашении по присоединению к целевой потребительской программе "БЛАГОРОСТ"',
    request_contribution: 'прошу принять от меня Паевой взнос в Общество следующим Имуществом',
    property_name: 'Наименование/ название',
    share_contribution: 'Паевой взнос - ПО Проект',
    component: 'Компонент',
    property_form: 'Форма Имущества',
    property_form_text: 'Исключительное право на долю',
    in_copyright_object: 'в Объекте Авторских Прав (ОАП) в соответствии с пунктом 2.1. Договора об участии в хозяйственной деятельности',
    description: 'Описание',
    description_text: 'Овеществленные (на бумажных и/или цифровых носителях) и выраженные в денежной исключительное право на долю',
    in_copyright_object_short: 'в ОАП',
    namely: 'а именно',
    purpose: 'Назначение',
    purpose_text: 'В целях реализации Предмета Договора об участии в хозяйственной деятельности',
    other_characteristics: 'Прочие характеристики и описание',
    other_characteristics_text: 'запись на электронном носителе (репозитории Общества)',
    number_pp: '№ п/п',
    name_details: 'Наименование/Реквизиты',
    unit: 'Ед. изм.',
    quantity: 'Количество',
    total_cost: 'Стоимость Всего',
    property_description: 'Имущество - исключительное право на долю',
    share: 'доля',
    total: 'ИТОГО',
    property_confirmation: 'Я подтверждаю, что Имущество, которые я вношу паевым взносом в Общество, принадлежат мне на праве собственности, в споре и под арестом не состоят',
    shareholder: 'Пайщик',
    signed_by_digital_signature: 'Подписано электронной подписью',
    accepted: 'ПРИНЯТО',
    chairman_title: 'Председатель Совета',
  },
}

export const exampleData = {
  meta: {
    created_at: '11.04.2024 12:00',
  },
  contributor_hash: 'ED3BCFC5B681AA83D123456789ABCDEF',
  contributor_short_hash: 'ED3BCFC5B681AA83D',
  contributor_created_at: '11.04.2024',
  blagorost_agreement_hash: 'ed3bcfd5b681aa83d3956642e19320d5036c5a7533ebb4c4bdd81db412c6474301f7561cbe0d61fc666334119c21bffbb955526ee923f5e637d6167af2a903a2',
  blagorost_agreement_short_hash: 'ed3bcfd5b681aa83d',
  blagorost_agreement_created_at: '11.04.2024',
  project_name: 'Проект цифровой платформы',
  component_name: 'Компонент разработки',
  result_hash: 'R3S4ULT5678901234567890',
  result_short_hash: 'R3S4ULT5678901234567890',
  percent_of_result: '25.00000000',
  total_amount: '50000.00 RUB',
  vars: {
    name: 'ВОСХОД',
    full_abbr_genitive: 'Потребительского Кооператива',
    short_abbr: 'ПК',
  },
  common_user: {
    full_name_or_short_name: 'Иванов Иван Иванович',
    email: 'ivanov@example.com',
    phone: '+7 999 123-45-67',
  },
  coop: {
    short_name: 'ПК "ВОСХОД"',
    details: {
      inn: '9728130611',
      kpp: '772801001',
      ogrn: '1247700283346',
    },
    full_address: '117593, г. МОСКВА, ВН.ТЕР.Г. МУНИЦИПАЛЬНЫЙ ОКРУГ ЯСЕНЕВО, ПРОЕЗД СОЛОВЬИНЫЙ, Д. 1, ПОМЕЩ. 1/1',
    phone: '+7 902 895-33-75',
    email: 'chairman.voskhod@gmail.com',
    defaultBankAccount: {
      currency: 'RUB',
      bank_name: 'ПАО Сбербанк',
      account_number: '40703810038000110117',
      details: {
        bik: '044525225',
        corr: '30101810400000000225',
        kpp: '772801001',
      },
    },
    chairman: {
      first_name: 'Алексей',
      last_name: 'Муравьев',
      middle_name: 'Николаевич',
    },
    city: 'г. Москва',
  },
}
