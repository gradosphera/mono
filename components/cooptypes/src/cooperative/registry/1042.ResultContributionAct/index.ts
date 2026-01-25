import type { ICommonUser, ICooperativeData, IVars } from '../../model'
import type { IDecisionData, IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1042

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  contributor_hash: string
  contributor_created_at: string
  blagorost_agreement_hash: string
  blagorost_agreement_created_at: string
  result_act_hash: string
  percent_of_result: string
  total_amount: string
  decision_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  decision: IDecisionData
  common_user: ICommonUser
  contributor_hash: string
  contributor_short_hash: string
  contributor_created_at: string
  blagorost_agreement_hash: string
  blagorost_agreement_short_hash: string
  blagorost_agreement_created_at: string
  result_act_hash: string
  result_act_short_hash: string
  result_hash: string
  percent_of_result: string
  total_amount: string
}

export const title = 'Акт приема-передачи результата интеллектуальной деятельности'
export const description = 'Форма акта приема-передачи результата интеллектуальной деятельности'

export const context = `<div class="digital-document"><div style="text-align: right"><p>{% trans 'appendix_number' %} {{ result_act_short_hash }}</p><p>{% trans 'appendix_to_agreement' %} № {{ contributor_short_hash }}</p></div><div style="text-align: center"><h2>{% trans 'act_title' %} № АППИ-{{ result_act_short_hash }}</h2></div><div style="display: flex; justify-content: space-between;"><p>{% trans 'city_label' %} {{ coop.city }}</p><p>{% trans 'date_label' %} {{ meta.created_at }}</p></div><p>{{ vars.full_abbr }} "{{ vars.name }}" {% trans 'hereinafter_society' %} {% trans 'in_face_of_chairman' %} {{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}, {% trans 'and_shareholder' %} {{ common_user.full_name_or_short_name }}, {% trans 'act_text' %} № {{ contributor_short_hash }} {% trans 'from_date' %} {{ contributor_created_at }} {% trans 'and_appendix' %} №{{ blagorost_agreement_short_hash }} {% trans 'from_date' %} {{ blagorost_agreement_created_at }} {% trans 'blagorost_program_text' %} {% trans 'and_protocol' %} № {{ decision.id }} {% trans 'from_date' %} {{ decision.date }} {% trans 'following_property' %}:</p><table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;"><tr><td style="font-weight: bold;">{% trans 'number_pp' %}</td><td style="font-weight: bold;">{% trans 'name_details' %}</td><td style="font-weight: bold;">{% trans 'property_form' %}</td><td style="font-weight: bold;">{% trans 'unit' %}</td><td style="font-weight: bold;">{% trans 'quantity' %}</td><td style="font-weight: bold;">{% trans 'total_cost' %}</td></tr><tr><td>1</td><td>{% trans 'copyright_object_description' %} {{ percent_of_result }}% {% trans 'in_copyright_object_short' %}, {% trans 'namely' %} №{{ result_hash }}.</td><td>{% trans 'copyright_right_description', percent_of_result, contributor_hash %}</td><td>{% trans 'share' %}</td><td>{{ percent_of_result }}%</td><td>{{ total_amount }}</td></tr><tr><td></td><td style="font-weight: bold;">{% trans 'total' %}</td><td></td><td></td><td>{{ percent_of_result }}%</td><td>{{ total_amount }}</td></tr></table><p>{% trans 'no_claims_quality' %}.</p><div style="margin-top: 40px;"><p><strong>{% trans 'transferred' %}:</strong></p><p>{% trans 'shareholder' %}: {{ common_user.full_name_or_short_name }}</p><p>{% trans 'signed_by_digital_signature' %}</p></div><div style="margin-top: 40px;"><p><strong>{% trans 'received' %}:</strong></p><p>{% trans 'chairman_title' %}</p><p>{{ vars.short_abbr }} "{{ vars.name }}"</p><p>{{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}</p><p>{% trans 'signed_by_digital_signature' %}</p></div></div><style>.digital-document {padding: 20px;white-space: pre-wrap;}</style>`

export const translations = {
  ru: {
    act_title: 'АКТ',
    appendix_number: 'Приложение №',
    appendix_to_agreement: 'к ДОГОВОРУ об участии в хозяйственной деятельности',
    city_label: 'г.',
    date_label: 'Дата:',
    hereinafter_society: '(далее "Общество")',
    in_face_of_chairman: 'в лице Председателя Совета Общества',
    and_shareholder: 'и Пайщик',
    act_text: 'составили настоящий Акт о том, что Пайщик передал, а Кооператив получил от Пайщика, в соответствии с условиями Договора об участии в хозяйственной деятельности',
    from_date: 'от',
    and_appendix: 'и его Приложением',
    blagorost_program_text: 'о соглашении по присоединению к целевой потребительской программе "БЛАГОРОСТ"',
    and_protocol: 'и Протоколом Совета',
    following_property: 'следующее Имущество',
    number_pp: '№ п/п',
    name_details: 'Наименование/Реквизиты',
    property_form: 'Форма имущества',
    unit: 'Ед. изм.',
    quantity: 'Количество',
    total_cost: 'Стоимость Всего',
    copyright_object_description: 'Объект Авторских Прав (ОАП) Пайщика, а именно: исключительное право на долю',
    in_copyright_object_short: 'в ОАП',
    namely: 'запись на электронном носителе (репозитории Общества)',
    copyright_right_description: 'исключительное право на долю {0}% в ОАП в соответствии с пунктом 2.1. Договора об участии в хозяйственной деятельности №{1}',
    share: 'доля',
    total: 'ИТОГО',
    no_claims_quality: 'Претензий по качеству Имущества Общество не имеет',
    transferred: 'ПЕРЕДАНО',
    shareholder: 'Пайщик',
    signed_by_digital_signature: 'Подписано электронной подписью',
    received: 'ПОЛУЧЕНО',
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
  result_act_hash: 'ACT1234567890ABCDEF',
  result_act_short_hash: 'ACT1234567890ABCDEF',
  result_hash: 'R3S4ULT5678901234567890',
  percent_of_result: '25.00000000',
  total_amount: '50000.00 RUB',
  vars: {
    name: 'ВОСХОД',
    full_abbr: 'Потребительский кооператив',
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
    city: 'Москва',
    chairman: {
      first_name: 'Алексей',
      last_name: 'Муравьев',
      middle_name: 'Николаевич',
    },
  },
  decision: {
    date: '11.04.2024',
    id: '1',
  },
}
