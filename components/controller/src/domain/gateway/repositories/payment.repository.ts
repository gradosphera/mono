import type { PaymentDomainInterface } from '../interfaces/payment-domain.interface';
import type { OutgoingPaymentDomainInterface } from '../interfaces/outgoing-payment-domain.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { GetOutgoingPaymentsInputDomainInterface } from '../interfaces/get-outgoing-payments-input-domain.interface';

export interface PaymentRepository {
  findByHash(hash: string): Promise<PaymentDomainInterface | null>;
  create(data: PaymentDomainInterface): Promise<PaymentDomainInterface>;
  updatePaymentStatus(hash: string, status: string, reason?: string): Promise<PaymentDomainInterface | null>;
  updatePaymentWithBlockchainData(hash: string, blockchain_data: any): Promise<PaymentDomainInterface | null>;
  getOutgoingPayments(
    filters: GetOutgoingPaymentsInputDomainInterface,
    options: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<OutgoingPaymentDomainInterface>>;
}

export const PAYMENT_REPOSITORY = Symbol('PaymentRepository');
