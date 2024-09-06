import type { IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData } from '../../model'
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from '../../users'

export const registry_id = 100

/**
 * Интерфейс генерации заявления на вступление в кооператив
 */
export interface Action extends IGenerate {
  signature: string
  skip_save: boolean
}

// Модель данных
export interface Model {
  type: string
  individual?: IIndividualData
  organization?: IOrganizationData
  entrepreneur?: IEntrepreneurData
  coop: ICooperativeData
  meta: IMetaDocument
  signature: string
}

export const title = 'Заявление на вступление в кооператив'
export const description = 'Форма заявления на вступление в потребительский кооператив'
export const context = `<style>\nh1 {\nmargin: 0px;\ntext-align:center;\n}\n</style>\n{% if type == 'individual' %}\n<h1 class=\"header\">{% trans 'application_individual' %}</h1>\n<p style=\"text-align: center\">{% trans 'in' %} {{ coop.full_name }}<p>\n<p style=\"text-align: right\">{{ meta.created_at }}, {{coop.city}}</p>\n<p>{% trans 'to_council_of' %} {{ coop.short_name }} {% trans 'from' %} {{ individual.last_name }} {{ individual.first_name }} {{ individual.middle_name }}, {% trans 'birthdate' %} {{ individual.birthdate }}, {% trans 'registration_address' %} {{ individual.full_address }}, {% trans 'phone_and_email_notice', individual.phone, individual.email %}</p>\n<p>{% trans 'request_to_join' %} {{ coop.full_name }}. {% trans 'acknowledge_documents_individual' %} {% if coop.is_branched %}</p> \n<p>{% trans 'authorize_chairman_branch', individual.branch_name %} {% endif %} </p>\n<p>{% trans 'obligation_to_pay_individual', coop.initial, coop.minimum %}</p>\n<p>{% trans 'agreement_on_sms_email_notice_individual' %}</p>\n<div class=\"signature\">\n<img style=\"max-width: 150px;\" src=\"{{ signature }}\"/>\n<p>{% trans 'signature' %} </p>\n<p style=\"text-align: right;\">{{ individual.last_name }} {{ individual.first_name }} {{ individual.middle_name }}</p>\n</div>\n\n{% elif type == 'entrepreneur' %}\n<h1 class=\"header\">{% trans 'application_entrepreneur' %}</h1>\n<p style=\"text-align: center\">{% trans 'in' %} {{ coop.full_name }}<p>\n<p style=\"text-align: right\">{{ meta.created_at }}, {{coop.city}}</p>  <p>{% trans 'to_council_of' %} {{ coop.short_name }} {% trans 'from_entrepreneur' %} {{ entrepreneur.last_name }} {{ entrepreneur.first_name }} {{ entrepreneur.middle_name }}, {% trans 'birthdate' %} {{ entrepreneur.birthdate }}, {% trans 'registration_address' %} {{ entrepreneur.full_address }}, {% trans 'entrepreneur_details', entrepreneur.details.inn, entrepreneur.details.ogrn, entrepreneur.bank_account.account_number, entrepreneur.bank_account.details.kpp, entrepreneur.bank_account.details.corr, entrepreneur.bank_account.details.bik, entrepreneur.bank_account.bank_name %}, {% trans 'phone_and_email_notice', entrepreneur.phone, entrepreneur.email %}</p>\n<p>{% trans 'request_to_join' %} {{ coop.full_name }}. {% trans 'acknowledge_documents_entrepreneur' %}</p> \n<p>{% if coop.is_branched %}{% trans 'authorize_chairman_branch', entrepreneur.branch_name %} {% endif %} </p>\n<p>{% trans 'obligation_to_pay_entrepreneur', coop.initial, coop.minimum %} </p>\n<p>{% trans 'agreement_on_sms_email_notice_entrepreneur' %}</p>\n<div class=\"signature\">\n<img style=\"max-width: 150px;\" src=\"{{ signature }}\"/>\n<p>{% trans 'signature' %} </p>\n<p style=\"text-align: right;\">{{ entrepreneur.last_name }} {{ entrepreneur.first_name }} {{ entrepreneur.middle_name }}</p>\n</div>\n\n{% elif type == 'organization' %}\n<h1 class=\"header\">{% trans 'application_legal_entity' %}</h1>\n<p style=\"text-align: center\">{% trans 'in' %} {{ coop.full_name }}<p>\n<p style=\"text-align: right\">{{ meta.created_at }}, {{coop.city}}</p>\n<p>{% trans 'to_council_of' %} «{{ coop.full_name }}» {% trans 'from_legal_entity' %} {{ organization.full_name }}, {% trans 'legal_address' %} {{ organization.full_address }}, {% trans 'legal_entity_details', organization.details.inn, organization.details.ogrn, organization.bank_account.account_number, organization.bank_account.details.kpp, organization.bank_account.details.corr, organization.bank_account.details.bik, organization.bank_account.bank_name %}, {% trans 'phone_and_email_notice', organization.phone, organization.email %}</p>\n<p>{% trans 'request_to_join_legal_entity', organization.represented_by.position, organization.represented_by.last_name, organization.represented_by.first_name, organization.represented_by.middle_name, organization.represented_by.based_on %} {{ coop.full_name }}.</p>\n<p>{% trans 'acknowledge_documents_legal_entity' %}</p> \n<p>{% if coop.is_branched %}{% trans 'authorize_chairman_branch_organization', organization.branch_name %} {% endif %}</p>\n<p>{% trans 'obligation_to_pay_legal_entity', coop.initial, coop.minimum %}</p>\n<p>{% trans 'agreement_on_sms_email_notice_legal_entity' %}</p>\n<div class=\"signature\">\n<img style=\"max-width: 150px;\" src=\"{{ signature }}\"/>\n<p>{% trans 'signature' %} </p>\n<p style=\"text-align: right;\">{{ organization.represented_by.last_name }} {{ organization.represented_by.first_name }} {{ organization.represented_by.middle_name }}</p>\n</div>\n\n{% endif %}\n\n`

export const translations = {
  ru: {
    from: 'от',
    application_individual: 'Заявление физического лица о приеме в пайщики',
    to_council_of: 'В Совет',
    birthdate: 'дата рождения',
    registration_address: 'адрес регистрации (как в паспорте): ',
    phone_and_email_notice: 'номер телефона с активированной функцией получения sms: {0}, адрес электронной почты: {1}.',
    acknowledge_documents_individual: 'Подтверждаю, что с Уставом и иными нормативными документами Общества ознакомлен(а).',
    agreement_on_sms_email_notice_individual: 'Выражаю свое согласие с тем, что информация, отправляемая Обществом в sms-сообщениях на указанный мной номер телефона, в сообщениях на указанный мной адрес электронной почты, или в PUSH уведомлениях с сайта, приравнивается к уведомлению меня Обществом в письменной форме.',
    application_entrepreneur: 'Заявление индивидуального предпринимателя о приеме в пайщики',
    from_entrepreneur: 'от индивидуального предпринимателя',
    acknowledge_documents_entrepreneur: 'Подтверждаю, что с Уставом и иными нормативными документами Общества ознакомлен(а).',
    agreement_on_sms_email_notice_entrepreneur: 'Выражаю свое согласие с тем, что информация, отправляемая Обществом в sms-сообщениях на указанный мной номер телефона, в сообщениях на указанный мной адрес электронной почты, или в PUSH уведомлениях с сайта, приравнивается к уведомлению меня Обществом в письменной форме.',
    application_legal_entity: 'Заявление юридического лица о приеме в пайщики',
    from_legal_entity: 'от юридического лица',
    legal_address: 'юридический адрес организации',
    legal_entity_details: 'ИНН {0}, ОГРН {1}, Р/с {2}, КПП {3}, К/с {4}, БИК {5}, банк получателя {6}',
    acknowledge_documents_legal_entity: 'Подтверждает, что с Уставом и иными нормативными документами Общества ознакомлен.',
    agreement_on_sms_email_notice_legal_entity: 'Выражает свое согласие с тем, что информация, отправляемая Обществом в sms-сообщениях на указанный номер телефона, в сообщениях на указанный адрес электронной почты, или в PUSH уведомлениях с сайта, приравнивается к уведомлению Заявителя Обществом в письменной форме.',
    obligation_to_pay_individual: 'Обязуюсь своевременно внести в Общество вступительный {0} и минимальный паевой {1} взносы в порядке, предусмотренном Уставом Общества.',
    obligation_to_pay_entrepreneur: 'Обязуюсь своевременно внести в Общество вступительный {0} и минимальный паевой {1} взносы в порядке, предусмотренном Уставом Общества.',
    obligation_to_pay_legal_entity: 'Обязуется своевременно внести в Общество вступительный {0} и минимальный паевой {1} взносы в порядке, предусмотренном Уставом Общества.',
    entrepreneur_details: 'ИНН {0}, ОГРНИП {1}, Р/с {2}, КПП {3}, К/с {4}, БИК {5}, банк получателя {6}',
    authorize_chairman_branch: 'Уполномочиваю Председателя кооперативного участка {0} принимать участие с правом голоса в Общих собраниях уполномоченных Общества, на период моего членства в Обществе при указанном кооперативном участке.',
    request_to_join_legal_entity: 'Заявитель, в лице представителя юридического лица - {0} {1} {2} {3}, действующий на основании {4}, просит принять в пайщики ',
    authorize_chairman_branch_organization: 'Уполномочивает Председателя кооперативного участка {0} принимать участие с правом голоса в Общих собраниях уполномоченных Общества, на период моего членства в Обществе при указанном кооперативном участке.',
    signature: 'подпись',
    in: 'в',
    request_to_join: 'Прошу принять меня в пайщики',
  },
  // ... другие переводы
}
