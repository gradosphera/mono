import type { JSONSchemaType } from 'ajv'
import type { IPaymentData } from '../Interfaces'
import { BankAccountSchema } from './BankAccountSchema'

export const paymentMethodSchema: JSONSchemaType<IPaymentData> = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    method_id: { type: 'number' },
    user_type: { type: 'string', enum: ['individual', 'entrepreneur', 'organization'] },
    method_type: { type: 'string', enum: ['sbp', 'bank_transfer'] },
    is_default: { type: 'boolean' },
    data: {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          properties: {
            phone: { type: 'string' },
          },
          required: ['phone'],
        },
        {
          type: 'object',
          properties: BankAccountSchema.properties,
          required: BankAccountSchema.required,
          additionalProperties: false,
        },
      ],
    },
  },
  required: ['username', 'method_id', 'user_type', 'method_type', 'is_default', 'data'],
  additionalProperties: true,
}
