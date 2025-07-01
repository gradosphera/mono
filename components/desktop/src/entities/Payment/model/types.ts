import type { Queries, Zeus } from '@coopenomics/sdk';

export type IPaymentPaginationResult =
  Queries.Gateway.GetPayments.IOutput[typeof Queries.Gateway.GetPayments.name];
export type IPayment = IPaymentPaginationResult['items'][number];

export type IGetPaymentsInputData = Queries.Gateway.GetPayments.IInput['data'];
export type IGetPaymentsInputOptions =
  Queries.Gateway.GetPayments.IInput['options'];

export type IPaymentDetails = Zeus.ModelTypes['PaymentDetails'];
export type IGatewayPayment = Zeus.ModelTypes['GatewayPayment'];

// Типы для данных внутри payment_details.data
export type IPaymentMethodData = Zeus.ModelTypes['PaymentMethodData']; // BankAccount | SbpAccount
export type IBankAccount = Zeus.ModelTypes['BankAccount'];
export type ISbpAccount = Zeus.ModelTypes['SbpAccount'];
export type IBankAccountDetails = Zeus.ModelTypes['BankAccountDetails'];
