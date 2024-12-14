import type { IGenerate, IMetaDocument } from '../../document'
import type { ICooperativeData, IVars } from '../../model'
import type { IBankAccount } from '../../payments'
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from '../../users'

export const registry_id = 101

/**
 * Интерфейс генерации заявления на выбор кооперативного участка
 */
export interface Action extends IGenerate {
  braname: string
}

// Модель данных
export interface Model {
  type: string
  meta: IMetaDocument
  vars: IVars
  participant_name: string
  branch: IOrganizationData
  individual?: IIndividualData
  organization?: IOrganizationData
  entrepreneur?: IEntrepreneurData
}

export const title = 'Заявление о выборе кооперативного участка'
export const description = 'Форма заявления на выбор кооперативного участка'
export const context = '<div class="digital-document">\n<div style="text-align: center">\n<h1 class="header"> {% trans \'STATEMENT\' %}</h1>\n<p class="subheader">{{vars.full_abbr}} "{{vars.name}}"</p>\n</div>\n{% if type == \'organization\' %}\n<p>{{organization.full_name}} {% trans \'authorize_chairman_branch_organization\', branch.short_name %}</p>\n\n{% else %}\n<p>{% trans \'authorize_chairman_branch\', branch.short_name %}</p>\n {% endif %}\n\n\n<p>{{ participant_name }}</p>\n<div style="text-align: left"><p>{{meta.created_at}}</p></div>\n</div>\n<style>.digital-document {\npadding: 20px;\nwhite-space: pre-wrap;\n}\n.subheader {padding-bottom: 20px;}\n</style>'

export const translations = {
  ru: {
    STATEMENT: 'Заявление',
    authorize_chairman_branch: 'Уполномочиваю Председателя кооперативного участка {0} принимать участие с правом голоса в Общих собраниях уполномоченных Общества на период моего членства в Обществе при указанном кооперативном участке.',
    authorize_chairman_branch_organization: 'уполномочивает Председателя кооперативного участка {0} принимать участие с правом голоса в Общих собраниях уполномоченных Общества на период моего членства в Обществе при указанном кооперативном участке.',
  },
}
