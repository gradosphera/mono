import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes } from '../../zeus/index'
import { rawBlockchainAccountSelector } from '../common/blockchainAccountSelector'
import { rawBlockchainInfoSelector } from './blockchainInfoSelector'
import { rawCooperatorAccountSelector } from './cooperatorAccountSelector'

export const rawContactsSelector = {
  chairman: {
    first_name: true,
    last_name: true,
    middle_name: true,
  },
  details: {
    inn: true,
    kpp: true,
    ogrn: true,
  },
  email: true,
  full_address: true,
  full_name: true,
  phone: true,
}

export const rawVarsSelector = {
  confidential_email: true,
  confidential_link: true,
  contact_email: true,
  coopenomics_agreement: {
    protocol_day_month_year: true,
    protocol_number: true,
  },
  coopname: true,
  full_abbr: true,
  full_abbr_dative: true,
  full_abbr_genitive: true,
  name: true,
  participant_application: {
    protocol_day_month_year: true,
    protocol_number: true,
  },
  passport_request: true,
  privacy_agreement: {
    protocol_day_month_year: true,
    protocol_number: true,
  },
  short_abbr: true,
  signature_agreement: {
    protocol_day_month_year: true,
    protocol_number: true,
  },
  user_agreement: {
    protocol_day_month_year: true,
    protocol_number: true,
  },
  wallet_agreement: {
    protocol_day_month_year: true,
    protocol_number: true,
  },
  website: true,
}

const rawSystemInfoSelector = {
  blockchain_info: rawBlockchainInfoSelector,
  cooperator_account: rawCooperatorAccountSelector,
  coopname: true,
  blockchain_account: rawBlockchainAccountSelector,
  system_status: true,
  contacts: rawContactsSelector,
  vars: rawVarsSelector,
}

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['SystemInfo']> = rawSystemInfoSelector

export const systemInfoSelector = Selector('SystemInfo')(rawSystemInfoSelector)
