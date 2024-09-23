// models/PaymentState.ts

import { Schema, model } from 'mongoose';

interface IPaymentState {
  accountNumber: string;
  statementDate: string;
  lastProcessedPage: number;
}

const PaymentStateSchema = new Schema<IPaymentState>({
  accountNumber: { type: String, required: true },
  statementDate: { type: String, required: true },
  lastProcessedPage: { type: Number, required: true },
});

export const PaymentState = model<IPaymentState>('PaymentState', PaymentStateSchema);
