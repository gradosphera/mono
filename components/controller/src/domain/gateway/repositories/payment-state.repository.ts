export interface IPaymentState {
  accountNumber: string;
  statementDate: string;
  lastProcessedPage: number;
}

export interface PaymentStateRepository {
  findOne(accountNumber: string, statementDate: string): Promise<IPaymentState | null>;
  save(data: IPaymentState): Promise<IPaymentState>;
}

export const PAYMENT_STATE_REPOSITORY = Symbol('PaymentStateRepository');
