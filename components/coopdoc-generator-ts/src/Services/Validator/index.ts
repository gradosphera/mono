import type { JSONSchemaType } from 'ajv'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import localize_ru from 'ajv-i18n/localize/ru'
import type { IMetaDocument } from '../../Interfaces'

const ajv = new Ajv()
addFormats(ajv)

ajv.addFormat('phone', {
  type: 'string',
  validate: () => true,
})
// ajv.addFormat('phone', {
//   type: 'string',
//   validate: str => /^[+]?[(]?[0-9]{1,4}[)]?[-\\s\\.0-9]*$/.test(str),
// })

export const IMetaJSONSchema: JSONSchemaType<IMetaDocument> = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    action: { type: 'string' },
    title: { type: 'string' },
    registry_id: { type: 'number' },
    lang: { type: 'string', enum: ['ru'] },
    generator: { type: 'string' },
    version: { type: 'string' },
    coopname: { type: 'string' },
    username: { type: 'string' },
    created_at: { type: 'string' },
    block_num: { type: 'number' },
    timezone: { type: 'string' },
  },
  required: [
    'code',
    'action',
    'title',
    'registry_id',
    'lang',
    'generator',
    'version',
    'coopname',
    'username',
    'created_at',
    'block_num',
    'timezone',
  ],
  additionalProperties: true,
}

export interface ValidateResult {
  valid: boolean
  error: string
}

interface Validatable {
  validate: () => ValidateResult
}

export class Validator implements Validatable {
  private schema: any
  private data: any

  constructor(schema: any, data: any) {
    this.schema = schema
    this.data = data
  }

  validate(): ValidateResult {
    const validateFn: ReturnType<typeof ajv.compile> = ajv.compile(this.schema)

    const valid = validateFn(this.data)
    let error = ''

    if (!valid) {
      localize_ru(validateFn.errors)
      error = validateFn.errors ? validateFn.errors.map(error => `${error.instancePath} ${error.message}`).join(', ') : 'неизвестная ошибка'
      console.error(validateFn.errors)
      throw new Error(`Ошибка при валидации данных: ${error}`)
    }

    return { valid, error } as ValidateResult
  }
}
