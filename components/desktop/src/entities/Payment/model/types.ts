import type { Queries } from '@coopenomics/sdk';

export type IPaymentPaginationResult = Queries.Payments.GetPayments.IOutput[typeof Queries.Payments.GetPayments.name]
export type IPayment = IPaymentPaginationResult['items'][number]

export type IGetPaymentsInputData = Queries.Payments.GetPayments.IInput['data']
export type IGetPaymentsInputOptions = Queries.Payments.GetPayments.IInput['options']
