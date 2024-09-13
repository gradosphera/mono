import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'
import type { IMetaDocument } from '../Interfaces'
import { PrivacyPolicy, RegulationElectronicSignature, UserAgreement, WalletAgreement } from '../templates'
import type { CooperativeData, ICovars } from '../Models'
import { CooperativeSchema } from './CooperativeSchema'

const properties: { [K in keyof ICovars]: JSONSchemaType<ICovars[K]> } = {
  coopname: { type: 'string' },
  full_abbr: { type: 'string' },
  full_abbr_genitive: { type: 'string' },
  full_abbr_dative: { type: 'string' },

  short_abbr: { type: 'string' },
  website: { type: 'string' },
  name: { type: 'string' },

  confidential_link: { type: 'string' },
  confidential_email: { type: 'string' },
  contact_email: { type: 'string' },

  wallet_agreement: {
    type: 'object',
    properties: {
      protocol_number: { type: 'string' },
      protocol_day_month_year: { type: 'string' },
    },
    required: ['protocol_day_month_year', 'protocol_number'],
    additionalProperties: true,
  },
  privacy_agreement: {
    type: 'object',
    properties: {
      protocol_number: { type: 'string' },
      protocol_day_month_year: { type: 'string' },
    },
    required: ['protocol_day_month_year', 'protocol_number'],
    additionalProperties: true,
  },
  signature_agreement: {
    type: 'object',
    properties: {
      protocol_number: { type: 'string' },
      protocol_day_month_year: { type: 'string' },
    },
    required: ['protocol_day_month_year', 'protocol_number'],
    additionalProperties: true,
  },
  user_agreement: {
    type: 'object',
    properties: {
      protocol_number: { type: 'string' },
      protocol_day_month_year: { type: 'string' },
    },
    required: ['protocol_day_month_year', 'protocol_number'],
    additionalProperties: true,
  },
}

const requiredFields = Object.keys(properties) as (keyof ICovars)[]

export const CovarsSchema: JSONSchemaType<ICovars> = {
  type: 'object',
  properties,
  required: requiredFields,
  additionalProperties: true,
}
