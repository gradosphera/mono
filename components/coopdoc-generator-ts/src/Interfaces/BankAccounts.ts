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

export interface ISbpDetails {
  phone: string
}

export interface PaymentData {
  username: string
  method_id: number
  user_type: 'individual' | 'entrepreneur' | 'organization'
  method_type: 'sbp' | 'bank_transfer'
  is_default: boolean
  data: ISbpDetails | IBankAccount
}
