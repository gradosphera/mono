import type { ICommonUser, ICooperativeData, IVars } from '../../model'
import type { IGenerate, IMetaDocument } from '../../document'

export const registry_id = 1002

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
  appendix_hash: string
  contributor_hash: string
  contributor_created_at: string
  component_name: string
  component_id: string
  project_name: string
  project_id: string
  is_component: boolean
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
  user: ICommonUser
  appendix_hash: string
  short_appendix_hash: string
  contributor_hash: string
  short_contributor_hash: string
  contributor_created_at: string
  component_name: string
  component_id: string
  project_name: string
  project_id: string
  is_component: boolean
}

export const title = 'Приложение к договору участия'
export const description = 'Приложение к договору участия в хозяйственной деятельности'

export const context = `<div class="digital-document"><div style="text-align: center"><h1>ПРИЛОЖЕНИЕ № {{ short_appendix_hash }}</h1><h2>к Договору об участии в хозяйственной деятельности № УХД-{{ short_contributor_hash }}</h2></div><p style="text-align: right">{{ meta.created_at }}, {{ coop.city }}</p><p>{% trans 'parties_intro' %} "{{ vars.name }}" {% trans 'in_face_of_chairman' %} {{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}, {% trans 'acting_on_basis_of_charter' %}, {% trans 'hereinafter_referred_to_as' %} "{% trans 'society' %}", {% trans 'and_participant' %} {{ user.full_name_or_short_name }}, {% trans 'hereinafter_referred_to_as' %} "{% trans 'participant' %}", {% trans 'jointly_referred_to_as' %} "{% trans 'parties' %}", {% trans 'have_concluded_this_appendix' %} {% trans 'hereinafter_referred_to_as' %} "{% trans 'appendix' %}" {% trans 'to_agreement' %} УХД-{{ short_contributor_hash }} {% trans 'from_date' %} {{ contributor_created_at }} {% trans 'of_the_following' %}:</p><p>{% trans 'according_to_regulations' %} "{{ vars.generation_agreement_template.protocol_number }}" {% trans 'from_date' %} {{ vars.generation_agreement_template.protocol_day_month_year }}), {% if is_component %}{% trans 'participant_commits_component' %} "{{ component_name }}" (№{{ component_id }}) {% trans 'as_part_of_project' %} "{{ project_name }}" (№{{ project_id }}).{% else %}{% trans 'participant_commits_project' %} "{{ project_name }}" (№{{ project_id }}).{% endif %}</p><h2>{% trans 'details_and_signatures_of_parties' %}</h2><p><strong>{% trans 'society' %}/{{ vars.full_abbr }} "{{ vars.name }}"/:</strong></p><p>ИНН {{ coop.details.inn }}, КПП {{ coop.details.kpp }}, ОГРН {{ coop.details.ogrn }}</p><p>{% trans 'legal_address' %}: {{ coop.full_address }}</p><p>{% trans 'contact_phone' %}: {{ coop.phone }}</p><p>{% trans 'email' %}: {{ coop.email }}</p><p>{% trans 'bank_account' %}: {{ coop.defaultBankAccount.account_number }}</p><p>{% trans 'bank_name' %}: {{ coop.defaultBankAccount.bank_name }}</p><p>{% trans 'bik' %}: {{ coop.defaultBankAccount.details.bik }}</p><p>{% trans 'correspondent_account' %}: {{ coop.defaultBankAccount.details.corr }}</p><p>{% trans 'chairman' %} {{ vars.full_abbr_genitive }} "{{ vars.name }}"</p><p>{{ coop.chairman.last_name }} {{ coop.chairman.first_name }} {{ coop.chairman.middle_name }}</p><p>{% trans 'signed_by_digital_signature' %}</p><p><strong>{% trans 'participant' %}:</strong></p><p>{{ user.full_name_or_short_name }}</p><p>{% trans 'contact_phone' %}: {{ user.phone }}</p><p>{% trans 'email' %}: {{ user.email }}</p><p>{% trans 'signed_by_digital_signature' %}</p></div><style>.digital-document {padding: 20px;white-space: pre-wrap;}</style>`

export const translations = {
  ru: {
    parties_intro: 'Потребительский Кооператив',
    in_face_of_chairman: 'в лице Председателя Совета',
    acting_on_basis_of_charter: 'действующего на основании Устава',
    hereinafter_referred_to_as: 'далее именуемый(-ая)',
    society: 'Общество',
    and_participant: 'и',
    participant: 'Пайщик',
    jointly_referred_to_as: 'совместно именуемые',
    parties: 'Стороны',
    have_concluded_this_appendix: 'составили настоящее Приложение',
    appendix: 'Приложение',
    to_agreement: 'к Договору об участии в хозяйственной деятельности №',
    from_date: 'от',
    of_the_following: 'о нижеследующем',
    according_to_regulations: 'Согласно условий и регламента положений целевой потребительской программы "Генерация" (утверждена Протоколом Собрания Совета Общества №',
    participant_commits_component: 'Пайщик принимает на себя обязательства участия в реализации Компонента',
    participant_commits_project: 'Пайщик принимает на себя обязательства участия в реализации Проекта',
    as_part_of_project: 'как составной части Проекта',
    details_and_signatures_of_parties: 'РЕКВИЗИТЫ И ПОДПИСИ СТОРОН',
    legal_address: 'Юр. адрес',
    contact_phone: 'Контактный тел.',
    email: 'Электронная почта',
    bank_account: 'Р/с',
    bank_name: 'Банк',
    bik: 'БИК',
    correspondent_account: 'Корр/счет',
    chairman: 'Председатель Совета',
    signed_by_digital_signature: 'Подписано электронной подписью',
  },
}

export const exampleData = {
  meta: {
    created_at: '11.04.2024 12:00',
  },
  appendix_hash: 'A001ZSA1',
  short_appendix_hash: 'A001ZSA1',
  contributor_hash: 'ED3BCFC5B681AA83D123456789ABCDEF',
  short_contributor_hash: 'ED3BCFC5B681AA83D',
  contributor_created_at: '11.04.2024',
  component_name: 'Компонент разработки',
  component_id: 'A1B2C3D4E5F6789A',
  project_name: 'Проект цифровой платформы',
  project_id: 'B2C3D4E5F6789ABC',
  is_component: true,
  vars: {
    generation_agreement_template: {
      protocol_number: 'СС-11-04-24',
      protocol_day_month_year: '11 апреля 2024 г.',
    },
    name: 'ВОСХОД',
    full_abbr_genitive: 'Потребительского Кооператива',
    full_abbr: 'Потребительский Кооператив',
  },
  user: {
    full_name_or_short_name: 'Иванов Иван Иванович',
    abbr_full_name: 'Иванов И.И.',
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
    city: 'Москва',
  },
}
