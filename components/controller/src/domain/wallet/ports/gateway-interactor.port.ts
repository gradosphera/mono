import type { CreateInitialPaymentInputDomainInterface } from '~/domain/gateway/interfaces/create-initial-payment-input-domain.interface';
import type { CreateDepositPaymentInputDomainInterface } from '~/domain/gateway/interfaces/create-deposit-payment-input-domain.interface';
import type { CreateWithdrawInputDomainInterface } from '~/domain/wallet/interfaces/create-withdraw-input-domain.interface';
import type { SetPaymentStatusInputDomainInterface } from '~/domain/gateway/interfaces/set-payment-status-domain-input.interface';
import type { InternalPaymentFiltersDomainInterface } from '~/domain/gateway/interfaces/payment-filters-domain.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { PaymentDomainEntity } from '~/domain/gateway/entities/payment-domain.entity';

export interface GatewayInteractorPort {
  getPayments(
    filters: InternalPaymentFiltersDomainInterface,
    options: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<PaymentDomainEntity>>;
  createInitialPayment(data: CreateInitialPaymentInputDomainInterface): Promise<PaymentDomainEntity>;
  createDeposit(data: CreateDepositPaymentInputDomainInterface): Promise<PaymentDomainEntity>;
  createWithdraw(data: CreateWithdrawInputDomainInterface): Promise<PaymentDomainEntity>;
  setPaymentStatus(data: SetPaymentStatusInputDomainInterface): Promise<PaymentDomainEntity>;
}

export const GATEWAY_INTERACTOR_PORT = Symbol('GatewayInteractorPort');
