import type { Cooperative } from 'cooptypes'

export type Currency = 'RUB' | 'Other'

export type IBankAccount = Cooperative.Users.IBankAccount

export interface ISbpDetails {
  phone: string
}

export interface IPaymentData {
  username: string
  method_id: number
  user_type: 'individual' | 'entrepreneur' | 'organization'
  method_type: 'sbp' | 'bank_transfer'
  is_default: boolean
  data: ISbpDetails | IBankAccount
}
