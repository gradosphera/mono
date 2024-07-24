import type { JSONSchemaType } from 'ajv'
import { RegistratorContract, SovietContract } from 'cooptypes'
import type { Cooperative as CooperativeApi } from 'cooptypes'
import { type ValidateResult, Validator } from '../Services/Validator'
import DataService from '../Services/Databazor/DataService'
import type { MongoDBConnector } from '../Services/Databazor'
import { individualSchema } from '../Schema/IndividualSchema'
import { getFetch } from '../Utils/getFetch'
import { getEnvVar } from '../config'
import { organizationSchema } from '../Schema'
import { Organization } from './Organization'

import type { ExternalIndividualData } from './Individual'
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
    org_registration: { type: 'string' },
    org_initial: { type: 'string' },
    org_minimum: { type: 'string' },
    totalMembers: { type: 'number' },
    members: {
      type: 'array',
      items: individualSchema,
    },
    ...organizationSchema.properties,
  },
  required: [...organizationSchema.required, 'is_branched', 'registration', 'initial', 'minimum', 'org_registration', 'org_initial', 'org_minimum', 'members', 'totalMembers'],
  additionalProperties: true,
}

export class Cooperative {
  cooperative: CooperativeData | null
  db: MongoDBConnector

  private data_service: DataService<CooperativeData>

  constructor(storage: MongoDBConnector) {
    this.db = storage
    this.cooperative = null
    this.data_service = new DataService<CooperativeData>(storage, 'CooperativeData')
  }

  async getOne(username: string, block_num?: number): Promise<CooperativeData> {
    const block_filter = block_num ? { block_num: { $lte: block_num } } : {}

    const organizationPrivateData = await new Organization(this.db).getOne({ username, ...block_filter })

    if (!organizationPrivateData)
      throw new Error('Информация о организации не обнаружена в базе данных.')

    const cooperative_response = await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-tables`, new URLSearchParams({
      filter: JSON.stringify({
        code: RegistratorContract.contractName.production,
        scope: RegistratorContract.contractName.production,
        table: RegistratorContract.Tables.Cooperatives.tableName,
      }),
    }))

    const cooperativeBlockchainData = cooperative_response.results[0]?.value as RegistratorContract.Tables.Cooperatives.ICooperative

    if (!cooperativeBlockchainData)
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
      throw new Error('Совет кооператива не обнаружен в базе данных.')

    const userModel = new Individual(this.db)

    const members = [] as MembersData[]
    let chairman = {} as ExternalIndividualData

    for (const member of soviet.members) {
      const userData = await userModel.getOne({ username: member.username, ...block_filter }) as ExternalIndividualData
      if (!userData)
        throw new Error(`Пользователь ${member.username} не найден в базе данных.`)

      members.push({ ...member, ...userData, is_chairman: member.position === 'chairman' })

      if (member.position === 'chairman')
        chairman = { ...member, ...userData }
    }

    this.cooperative = {
      ...organizationPrivateData,
      ...cooperativeBlockchainData,
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
