export type Country = 'Russia' | 'Other'

export interface Details {
  inn: string
  ogrn: string
}
export type Currency = 'RUB' | 'Other'

export interface IBankAccount {
  currency: Currency
  card_number?: string // < номер карты
  bank_name: string // < наименование банка
  account_number: string // < номер счёта
  details: {
    bik: string // < бик
    corr: string // < корр счёт
    kpp: string // < кпп
  }
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
}

export interface IOrganizationData {
  username: string
  type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao'
  is_cooperative: boolean
  short_name: string
  full_name: string
  represented_by: {
    first_name: string
    last_name: string
    middle_name: string
    position: string
    based_on: string
  }
  country: Country
  city: string
  full_address: string
  phone: string
  email: string
  details: Details
  bank_account: IBankAccount
}

export interface IEntrepreneurData {
  username: string
  first_name: string
  last_name: string
  middle_name: string
  birthdate: string
  phone: string
  email: string
  country: Country
  city: string
  full_address: string
  details: Details
  bank_account: IBankAccount
}

export type IUserData = IIndividualData | IOrganizationData | IEntrepreneurData
