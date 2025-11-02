import type { CreateDepositPaymentInputDomainInterface } from '~/domain/gateway/interfaces/create-deposit-payment-input-domain.interface';
import type { CreateWithdrawInputDomainInterface } from '~/domain/wallet/interfaces/create-withdraw-input-domain.interface';
import type { SetPaymentStatusInputDomainInterface } from '~/domain/gateway/interfaces/set-payment-status-domain-input.interface';
import { PaymentDomainEntity } from '~/domain/gateway/entities/payment-domain.entity';

export interface GatewayInteractorPort {
  createDeposit(data: CreateDepositPaymentInputDomainInterface): Promise<PaymentDomainEntity>;
  createWithdraw(data: CreateWithdrawInputDomainInterface): Promise<PaymentDomainEntity>;
  setPaymentStatus(data: SetPaymentStatusInputDomainInterface): Promise<PaymentDomainEntity>;
}

export const GATEWAY_INTERACTOR_PORT = Symbol('GatewayInteractorPort');
