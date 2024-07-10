// Определение унифицированного типа для деталей платежа
export interface PaymentDetails {
  url: string // URL для перенаправления пользователя
  token: string // Токен для создания встроенной формы оплаты
}

export interface ICreatedPayment {
  provider: string
  order_id: string | number
  details: PaymentDetails
}

export interface ICreateInitialPayment {
  provider: string
}
