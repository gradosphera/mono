import type { ICommonUser, ICooperativeData, IVars } from '../../model'
import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1004

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  common_user: ICommonUser
  blagorost_storage_agreement_number: string
  blagorost_storage_agreement_created_at: string
  contributor_contract_number: string
  generator_agreement_number: string
  generator_agreement_created_at: string
}

export const title = 'Дополнительные условия по ответственному хранению Имущества'
export const description = 'Дополнительные условия по ответственному хранению имущества с правом пользования'

export const context = `<div class="digital-document"><p style="text-align: right; font-size: 14px">{% trans 'appendix_number' %}{{ blagorost_storage_agreement_number }}</p><p style="text-align: right; font-size: 14px">{% trans 'to_agreement' %} № {{ contributor_contract_number }}</p><div style="text-align: center"><h1>{% trans 'storage_title' %}</h1><p>{% trans 'storage_subtitle' %}</p></div><p>{{ coop.city }}</p><p style="text-align: right">{{ blagorost_storage_agreement_created_at }}</p><p>{% trans 'additional_conditions_intro' %} "{{ vars.name }}" {% trans 'in_face_of_chairman' %} {{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}, {% trans 'acting_on_basis_of_charter' %}, {% trans 'hereinafter_referred_to_as' %} "{% trans 'society' %}", {% trans 'and_participant' %} {{ common_user.full_name_or_short_name }}, {% trans 'hereinafter_referred_to_as' %} "{% trans 'participant' %}", {% trans 'jointly_referred_to_as' %} "{% trans 'parties' %}", {% trans 'have_concluded_this_appendix' %} {% trans 'hereinafter_referred_to_as' %} "{% trans 'additional_conditions' %}" {% trans 'to_agreement_full' %}{{ generator_agreement_number }} {% trans 'from_date' %} {{ generator_agreement_created_at }} {% trans 'hereinafter_referred_to_as_agreement' %}.</p><p><strong>1.</strong> {% trans 'additional_conditions_use_terms' %}.</p><p><strong>2.</strong> {% trans 'property_transfer_confirmation' %}.</p><p><strong>3.</strong> {% trans 'society_stores_property' %}.</p><p><strong>4.</strong> {% trans 'property_storage_free' %}.</p><p><strong>5.</strong> {% trans 'society_takes_measures' %}.</p><p><strong>6.</strong> {% trans 'society_right_to_use' %}.</p><p><strong>7.</strong> {% trans 'society_no_right_to_third_parties' %}.</p><p><strong>8.</strong> {% trans 'storage_conditions_change' %}.</p><p><strong>9.</strong> {% trans 'participant_pickup_obligation' %}.</p><p><strong>10.</strong> {% trans 'society_return_obligation' %}.</p><p><strong>11.</strong> {% trans 'property_return_condition' %}.</p><p><strong>12.</strong> {% trans 'society_liability' %}.</p><p><strong>13.</strong> {% trans 'conditions_effective_date' %}.</p><p><strong>{% trans 'society' %}/{{ vars.full_abbr }} "{{ vars.name }}"/:</strong></p><p>{% trans 'inn' %} {{ coop.details.inn }}, {% trans 'kpp' %} {{ coop.details.kpp }}, {% trans 'ogrn' %} {{ coop.details.ogrn }}</p><p>{% trans 'legal_address' %}: {{ coop.full_address }}</p><p>{% trans 'contact_phone' %}: {{ coop.phone }}</p><p>{% trans 'email' %}: {{ coop.email }}</p><p>{% trans 'bank_account' %}: {{ coop.defaultBankAccount.account_number }}</p><p>{% trans 'in_bank' %} {{ coop.defaultBankAccount.bank_name }}</p><p>{% trans 'bik' %}: {{ coop.defaultBankAccount.details.bik }}</p><p>{% trans 'correspondent_account' %}: {{ coop.defaultBankAccount.details.corr }}</p><p>{% trans 'chairman' %} {{ vars.full_abbr_genitive }} "{{ vars.name }}"</p><p>{{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}</p><p>{% trans 'signed_by_digital_signature' %}</p><p><strong>{% trans 'participant' %}:</strong></p><p>{{ common_user.full_name_or_short_name }}</p><p>{% trans 'contact_phone' %}: {{ common_user.phone }}</p><p>{% trans 'email' %}: {{ common_user.email }}</p><p>{{ common_user.full_name_or_short_name }}</p><p>{% trans 'signed_by_digital_signature' %}</p></div><style>.digital-document {padding: 20px;white-space: pre-wrap;}</style>`

export const translations = {
  ru: {
    appendix_number: 'ПРИЛОЖЕНИЕ №',
    to_agreement: 'к Договору об участии в хозяйственной деятельности',
    storage_title: 'Дополнительные условия',
    storage_subtitle: 'по ответственному хранению Имущества с правом пользования',
    additional_conditions_intro: 'Настоящие Дополнительные условия по ответственному хранению Имущества (далее "Дополнительные Условия") определяют взаимодействие Пайщика и Общества по исполнению условий Пользовательского Соглашения',
    in_face_of_chairman: 'в лице Председателя Совета',
    acting_on_basis_of_charter: 'действующего на основании Устава',
    hereinafter_referred_to_as: 'далее именуемый(-ая)',
    society: 'Общество',
    and_participant: 'и',
    participant: 'Пайщик',
    jointly_referred_to_as: 'совместно именуемые',
    parties: 'Стороны',
    have_concluded_this_appendix: 'составили настоящие',
    additional_conditions: 'Дополнительные Условия',
    to_agreement_full: 'к Договору об участии в хозяйственной деятельности №',
    from_date: 'от',
    hereinafter_referred_to_as_agreement: '(далее - "Соглашение")',
    additional_conditions_use_terms: 'Настоящие Дополнительные Условия используют термины и определения Соглашения (Раздел 1)',
    property_transfer_confirmation: 'Передача Имущества Пайщиком на хранение Обществу удостоверяется подтвержденной записью в электронной базе Общества, учитываемой на ЛК Пайщика в соответствии с условиями, изложенными в пп. 5.4., 8.1.5., 8.1.14., 8.2.4. и 8.3.5. Соглашения',
    society_stores_property: 'Общество хранит Имущество, передаваемое ему Пайщиком в соответствии с условиями Соглашения, и возвращает Имущество Пайщику в соответствии с условиями, изложенными в пп. 8.1.10., 8.1.20., 8.1.21.(б), 8.2.12.(а) и 8.2.12.(в) Соглашения',
    property_storage_free: 'Общество хранит Имущества Пайщика безвозмездно',
    society_takes_measures: 'Общество принимает для сохранности переданного ему Имущества меры, обязательность которых предусмотрена законодательством РФ, а также меры, соответствующие обычаям делового оборота и существу Соглашения',
    society_right_to_use: 'Общество вправе использовать переданное на хранение Имущество строго в соответствии с условиями, изложенными в пп. 9.6. и 9.7. Соглашения',
    society_no_right_to_third_parties: 'Общество не вправе предоставлять возможность пользования Имуществом третьим лицам, за исключением случаев, когда такое пользование хранимого Имущества необходимо для обеспечения его сохранности',
    storage_conditions_change: 'Если изменение условий хранения необходимо для устранения опасности утраты или повреждения Имущества, Общество вправе изменить способ, место и иные условия хранения, не дожидаясь ответа Пайщика',
    participant_pickup_obligation: 'По истечении хранения Имущества в соответствии с п. 3 настоящих Дополнительных Условий хранения Пайщик обязуется немедленно забрать переданное на хранение Имущество',
    society_return_obligation: 'Общество обязано возвратить Пайщику Имущество, которое было передано им на хранение в соответствии с п. 3 настоящих Дополнительных Условий',
    property_return_condition: 'Имущество должно быть возвращено Обществом в том состоянии, в каком оно было принято на хранение',
    society_liability: 'Общество отвечает за утрату или повреждение Имущества, если не докажет, что утрата или повреждение произошли вследствие обстоятельств непреодолимой силы',
    conditions_effective_date: 'Настоящие Дополнительные Условия вступают в силу с момента передачи Имущества Пайщиком Обществу по Акту приема-передачи Имущества, являющегося неотъемлемым приложением к настоящим Дополнительным Условиям, и действует до полного исполнения всех его условий',
    inn: 'ИНН',
    kpp: 'КПП',
    ogrn: 'ОГРН',
    legal_address: 'Юр. адрес',
    contact_phone: 'Контактный тел.',
    email: 'Электронная почта',
    bank_account: 'Р/с',
    in_bank: 'В',
    bik: 'БИК',
    correspondent_account: 'Корр/счет',
    chairman: 'Председатель Совета',
    signed_by_digital_signature: 'Подписано электронной подписью',
  },
}

export const exampleData = {
  blagorost_storage_agreement_number: 'SA001ABC123',
  blagorost_storage_agreement_created_at: '11.04.2024',
  contributor_contract_number: 'ED3BCFC5B681AA83D',
  generator_agreement_number: 'ed3bcfd5b681aa83d',
  generator_agreement_created_at: '11.04.2024',
  vars: {
    name: 'ВОСХОД',
    full_abbr_genitive: 'Потребительского Кооператива',
    full_abbr: 'Потребительский Кооператив',
  },
  common_user: {
    full_name_or_short_name: 'Иванов Иван Иванович',
    email: 'ivanov@example.com',
    phone: '+7 999 123-45-67',
  },
  coop: {
    details: {
      inn: '9728130611',
      kpp: '772801001',
      ogrn: '1247700283346',
    },
    full_address: '117593, г. МОСКВА, ВН.ТЕР.Г. МУНИЦИПАЛЬНЫЙ ОКРУГ ЯСЕНЕВО, ПРОЕЗД СОЛОВЬИНЫЙ, Д. 1, ПОМЕЩ. 1/1',
    phone: '+7 900 000-00-01',
    email: 'chairman@example.com',
    defaultBankAccount: {
      bank_name: 'ПАО Сбербанк',
      account_number: '40703810038000110117',
      details: {
        bik: '044525225',
        corr: '30101810400000000225',
      },
    },
    chairman: {
      first_name: 'Алексей',
      last_name: 'Николаевич',
      middle_name: 'Муравьев',
    },
    city: 'г. Москва',
  },
}
