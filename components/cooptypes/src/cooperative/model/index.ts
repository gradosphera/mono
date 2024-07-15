import type { SovietContract } from '../../contracts'
import type { ICooperative } from '../../contracts/registrator/tables/cooperatives'
import type { Details, IIndividualData, IOrganizationData } from '../users'

export interface ICooperativeData extends IOrganizationData, ICooperative {
  members: MembersData[]
  chairman: IIndividualData
  totalMembers: number
}

export interface MembersData extends SovietContract.Interfaces.IBoardMember, IIndividualData {
  is_chairman: boolean
}

export interface IAnnounce {
  phone: string
  email: string
}

export interface IContacts {
  full_name: string
  full_address: string
  details: Details
  phone: string
  email: string
  chairman: {
    first_name: string
    last_name: string
    middle_name: string
  }
}
