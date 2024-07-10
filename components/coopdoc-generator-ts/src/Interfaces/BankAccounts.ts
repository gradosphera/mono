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
