import { Injectable } from '@nestjs/common';
import { GatewayInteractor } from '../interactors/gateway.interactor';
import { GatewayInteractorPort } from '~/domain/wallet/ports/gateway-interactor.port';
import type { CreateDepositPaymentInputDomainInterface } from '../interfaces/create-deposit-payment-input-domain.interface';
import type { CreateWithdrawInputDomainInterface } from '~/domain/wallet/interfaces/create-withdraw-input-domain.interface';
import type { SetPaymentStatusInputDomainInterface } from '../interfaces/set-payment-status-domain-input.interface';
import { PaymentDomainEntity } from '../entities/payment-domain.entity';

@Injectable()
export class GatewayInteractorAdapter implements GatewayInteractorPort {
  constructor(private readonly gatewayInteractor: GatewayInteractor) {}

  async createDeposit(data: CreateDepositPaymentInputDomainInterface): Promise<PaymentDomainEntity> {
    return await this.gatewayInteractor.createDeposit(data);
  }

  async createWithdraw(data: CreateWithdrawInputDomainInterface): Promise<PaymentDomainEntity> {
    return await this.gatewayInteractor.createWithdraw(data);
  }

  async setPaymentStatus(data: SetPaymentStatusInputDomainInterface): Promise<PaymentDomainEntity> {
    return await this.gatewayInteractor.setPaymentStatus(data);
  }
}
