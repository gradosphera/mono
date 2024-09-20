export interface PaymentDetails {
  data: any
}

export interface ICreatedPayment {
  details: PaymentDetails
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICreateInitialPayment {

}

export interface ICreateDeposit {
  quantity: string;
}

export interface IPaymentOrder {
  provider: string; // Идентификатор банковского процессинга
  details: {
    data: string;
  };
}
