import type { IBankAccount } from '../payments'

export interface IPassportData {
  series: number
  number: number
  issued_by: string
  issued_at: string
  code: string
}

export interface IIndividualData {
  username: string
  first_name: string
  last_name: string
  middle_name: string
  birthdate: string
  full_address: string
  phone: string
  email: string
  passport?: IPassportData
  block_num?: number
  deleted?: boolean
}

export interface IOrganizationData {
  username: string
  type: string
  short_name: string
  full_name: string
  represented_by: {
    first_name: string
    last_name: string
    middle_name: string
    position: string
    based_on: string
  }
  country: string
  city: string
  full_address: string
  fact_address: string
  phone: string
  email: string
  details: { inn: string, ogrn: string, kpp: string }
  // bank_account: IBankAccount
  block_num?: number
  deleted?: boolean
}

export interface IEntrepreneurData {
  username: string
  first_name: string
  last_name: string
  middle_name: string
  birthdate: string
  phone: string
  email: string
  country: string
  city: string
  full_address: string
  details: { inn: string, ogrn: string }
  // bank_account: IBankAccount
  block_num?: number
  deleted?: boolean
}

export type IUserData = IIndividualData | IOrganizationData | IEntrepreneurData

export interface IAccountMeta {
  phone: string
  email: string
}
