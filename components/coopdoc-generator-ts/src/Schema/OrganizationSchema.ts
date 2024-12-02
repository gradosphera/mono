import type { JSONSchemaType } from 'ajv'
import type { ExternalOrganizationData } from '../Models/Organization'
import { BankAccountSchema } from './BankAccountSchema'

export const organizationSchema: JSONSchemaType<ExternalOrganizationData> = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    type: { type: 'string', enum: ['coop', 'ooo', 'oao', 'zao', 'pao', 'ao'] },
    short_name: { type: 'string' },
    full_name: { type: 'string' },
    represented_by: {
      type: 'object',
      required: ['first_name', 'last_name', 'position', 'based_on'],
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        middle_name: { type: 'string' },
        position: { type: 'string' },
        based_on: { type: 'string' },
      },
      additionalProperties: true,
    },
    country: { type: 'string' },
    city: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    full_address: { type: 'string' },
    fact_address: { type: 'string' },
    details: {
      type: 'object',
      required: ['inn', 'ogrn', 'kpp'],
      properties: {
        inn: { type: 'string' },
        ogrn: { type: 'string' },
        kpp: { type: 'string' },
      },
      additionalProperties: true,
    },
    // bank_account: {
    //   type: 'object',
    //   required: BankAccountSchema.required,
    //   properties: BankAccountSchema.properties,
    // },
    deleted: { type: 'boolean', nullable: true },
    block_num: { type: 'number', nullable: true },
  },
  required: ['username', 'type', 'short_name', 'full_name', 'represented_by', 'country', 'city', 'full_address', 'fact_address', 'email', 'phone', 'details'],
  additionalProperties: true,
}
