export interface PaymentDetails {
  data: any
}

export interface ICreatedPayment {
  provider: string
  details: PaymentDetails
}

export interface ICreateInitialPayment {
  provider: string
}

export interface ICreateDeposit {
  quantity: string;
  provider: 'yookassa';
}

export interface IPaymentOrder {
  provider: string; // Идентификатор банковского процессинга
  details: {
    data: string;
  };
}
