import { Injectable, Inject } from '@nestjs/common';
import { GatewayInteractor } from '../interactors/gateway.interactor';
import { GatewayPort } from '../ports/gateway.port';
import { GatewayBlockchainPort, GATEWAY_BLOCKCHAIN_PORT } from '../ports/gateway-blockchain.port';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import type { GatewayContract } from 'cooptypes';
import type { CompleteIncomeDomainInterface } from '../interfaces/complete-income-domain.interface';
import type { CompleteOutcomeDomainInterface } from '../interfaces/complete-outcome-domain.interface';
import type { DeclineOutcomeDomainInterface } from '../interfaces/decline-outcome-domain.interface';
import { PaymentStatusEnum } from '../enums/payment-status.enum';

@Injectable()
export class GatewayAdapter implements GatewayPort {
  constructor(
    @Inject(GATEWAY_BLOCKCHAIN_PORT)
    private readonly gatewayBlockchainPort: GatewayBlockchainPort,
    private readonly gatewayInteractor: GatewayInteractor
  ) {}

  // Блокчейн операции - делегируем существующему порту
  async completeOutcome(data: CompleteOutcomeDomainInterface): Promise<TransactionResult> {
    return await this.gatewayBlockchainPort.completeOutcome(data);
  }

  async declineOutcome(data: DeclineOutcomeDomainInterface): Promise<TransactionResult> {
    return await this.gatewayBlockchainPort.declineOutcome(data);
  }

  async getOutcomes(coopname: string): Promise<GatewayContract.Tables.Outcomes.IOutcome[]> {
    return await this.gatewayBlockchainPort.getOutcomes(coopname);
  }

  async getOutcome(coopname: string, outcome_hash: string): Promise<GatewayContract.Tables.Outcomes.IOutcome | null> {
    return await this.gatewayBlockchainPort.getOutcome(coopname, outcome_hash);
  }

  async completeIncome(data: CompleteIncomeDomainInterface): Promise<TransactionResult> {
    return await this.gatewayBlockchainPort.completeIncome(data);
  }

  // Доменные операции - делегируем GatewayInteractor
  async executeIncomePayment(id: string, status: PaymentStatusEnum): Promise<void> {
    return await this.gatewayInteractor.executeIncomePayment(id, status);
  }

  async expireOutdatedPayments(): Promise<number> {
    return await this.gatewayInteractor.expireOutdatedPayments();
  }
}
