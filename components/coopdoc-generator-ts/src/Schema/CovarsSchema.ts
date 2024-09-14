import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'
import type { IMetaDocument } from '../Interfaces'
import { PrivacyPolicy, RegulationElectronicSignature, UserAgreement, WalletAgreement } from '../templates'
import type { CooperativeData, ICovars } from '../Models'
import { CooperativeSchema } from './CooperativeSchema'

export const CovarsSchema: JSONSchemaType<ICovars> = {
  type: 'object',
  properties: {
    deleted: { type: 'boolean', nullable: true },
    block_num: { type: 'number', nullable: true },
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
  },
  required: [ // соблюдать порядок следования!
    // 'deleted', //not_required
    // 'block_num', //not_required
    'coopname',
    'full_abbr',
    'full_abbr_genitive',
    'full_abbr_dative',
    'short_abbr',
    'website',
    'name',
    'confidential_link',
    'confidential_email',
    'contact_email',
    'wallet_agreement',
    'privacy_agreement',
    'signature_agreement',
    'user_agreement',
  ],
  additionalProperties: true,
}
