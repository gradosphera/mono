import type { JSONSchemaType } from 'ajv'
import { RegistratorContract, SovietContract } from 'cooptypes'
import type { Cooperative as CooperativeApi } from 'cooptypes'
import { type ValidateResult, Validator } from '../Services/Validator'
import DataService from '../Services/Databazor/DataService'
import type { MongoDBConnector } from '../Services/Databazor'
import { individualSchema } from '../Schema/IndividualSchema'
import { getFetch } from '../Utils/getFetch'
import { getEnvVar } from '../config'
import { organizationSchema } from './Organization'
import { Organization, type OrganizationData } from './Organization'
import type { IndividualData } from './Individual'
import { Individual } from './Individual'

export type CooperativeData = CooperativeApi.Model.ICooperativeData
export type MembersData = CooperativeApi.Model.MembersData

export const CooperativeSchema: JSONSchemaType<CooperativeData> = {
  type: 'object',
  properties: {
    is_branched: { type: 'boolean' },
    registration: { type: 'string' },
    initial: { type: 'string' },
    minimum: { type: 'string' },
    totalMembers: { type: 'number' },
    members: {
      type: 'array',
      items: individualSchema,
    },
    ...organizationSchema.properties,
  },
  required: [...organizationSchema.required, 'is_branched', 'registration', 'initial', 'minimum', 'members', 'totalMembers'],
  additionalProperties: true,
}

export class Cooperative {
  cooperative: CooperativeData | null
  storage: MongoDBConnector

  private data_service: DataService<CooperativeData>

  constructor(storage: MongoDBConnector) {
    this.storage = storage
    this.cooperative = null
    this.data_service = new DataService<CooperativeData>(storage, 'IndividualData')
  }

  async getOne(username: string, block_num?: number): Promise<CooperativeData> {
    const block_filter = block_num ? { block_num: { $lte: block_num } } : {}

    const organization = await new Organization(this.storage).getOne({ username, ...block_filter })

    if (!organization)
      throw new Error('Информация о организации не обнаружена в базе данных.')

    const cooperative_response = await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-tables`, new URLSearchParams({
      filter: JSON.stringify({
        code: RegistratorContract.contractName.production,
        scope: RegistratorContract.contractName.production,
        table: RegistratorContract.Tables.Organizations.tableName,
      }),
    }))

    const cooperative = cooperative_response.results[0]?.value as RegistratorContract.Tables.Organizations.IOrganization

    if (!cooperative)
      throw new Error('Информация о кооперативе не обнаружена в базе данных.')

    const soviet_response = await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-tables`, new URLSearchParams({
      filter: JSON.stringify({
        'code': SovietContract.contractName.production,
        'scope': username,
        'table': SovietContract.Tables.Boards.tableName,
        'value.type': 'soviet',
      }),
    }))

    const soviet = soviet_response.results[0]?.value as SovietContract.Tables.Boards.IBoards

    if (!soviet)
      throw new Error('Совет кооператива не обранужен в базе данных.')

    const userModel = new Individual(this.storage)

    const members = [] as MembersData[]
    let chairman = {} as IndividualData

    for (const member of soviet.members) {
      const userData = await userModel.getOne({ username: member.username, ...block_filter }) as IndividualData
      if (!userData)
        throw new Error(`Пользователь ${member.username} не найден в базе данных.`)

      members.push({ ...member, ...userData, is_chairman: member.position === 'chairman' })

      if (member.position === 'chairman')
        chairman = { ...member, ...userData }
    }

    this.cooperative = {
      ...organization as OrganizationData,
      announce: cooperative?.announce,
      description: cooperative?.description,
      is_branched: cooperative?.is_branched,
      is_enrolled: cooperative?.is_enrolled,
      initial: cooperative?.initial,
      registration: cooperative?.registration,
      minimum: cooperative?.minimum,
      chairman,
      members,
      totalMembers: members.length,
    }

    this.validate()

    return this.cooperative
  }

  validate(): ValidateResult {
    return new Validator(CooperativeSchema, this.cooperative as CooperativeData).validate()
  }
}
