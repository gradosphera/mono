import type { JSONSchemaType } from 'ajv'
import type { IVars } from '../Models'

export const VarsSchema: JSONSchemaType<IVars> = {
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
    passport_request: { type: 'string' },
    wallet_agreement: {
      type: 'object',
      nullable: true,
      properties: {
        protocol_number: { type: 'string' },
        protocol_day_month_year: { type: 'string' },
      },
      required: ['protocol_day_month_year', 'protocol_number'],
      additionalProperties: true,
    },
    privacy_agreement: {
      type: 'object',
      nullable: true,
      properties: {
        protocol_number: { type: 'string' },
        protocol_day_month_year: { type: 'string' },
      },
      required: ['protocol_day_month_year', 'protocol_number'],
      additionalProperties: true,
    },
    signature_agreement: {
      type: 'object',
      nullable: true,
      properties: {
        protocol_number: { type: 'string' },
        protocol_day_month_year: { type: 'string' },
      },
      required: ['protocol_day_month_year', 'protocol_number'],
      additionalProperties: true,
    },
    user_agreement: {
      type: 'object',
      nullable: true,
      properties: {
        protocol_number: { type: 'string' },
        protocol_day_month_year: { type: 'string' },
      },
      required: ['protocol_day_month_year', 'protocol_number'],
      additionalProperties: true,
    },
    participant_application: {
      type: 'object',
      nullable: true,
      properties: {
        protocol_number: { type: 'string' },
        protocol_day_month_year: { type: 'string' },
      },
      required: ['protocol_day_month_year', 'protocol_number'],
      additionalProperties: true,
    },
    coopenomics_agreement: {
      type: 'object',
      properties: {
        protocol_number: { type: 'string' },
        protocol_day_month_year: { type: 'string' },
      },
      required: ['protocol_day_month_year', 'protocol_number'],
      additionalProperties: true,
      nullable: true,
    },
    investment_agreement: {
      type: 'object',
      properties: {
        protocol_number: { type: 'string' },
        protocol_day_month_year: { type: 'string' },
        subject: { type: 'string' },
        terms: { type: 'string' },
      },
      required: ['protocol_day_month_year', 'protocol_number'],
      additionalProperties: true,
      nullable: true,
    },
    blagorost_provision: {
      type: 'object',
      nullable: true,
      properties: {
        protocol_number: { type: 'string' },
        protocol_day_month_year: { type: 'string' },
      },
      required: ['protocol_number', 'protocol_day_month_year'],
      additionalProperties: true,
    },
    blagorost_offer_template: {
      type: 'object',
      nullable: true,
      properties: {
        protocol_number: { type: 'string' },
        protocol_day_month_year: { type: 'string' },
      },
      required: ['protocol_number', 'protocol_day_month_year'],
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
  ],
  additionalProperties: true,
}
