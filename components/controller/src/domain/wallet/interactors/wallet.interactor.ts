import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cooperative } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { WalletBlockchainPort, WALLET_BLOCKCHAIN_PORT } from '../ports/wallet-blockchain.port';
import type { CreateWithdrawInputDomainInterface } from '../interfaces/create-withdraw-input-domain.interface';
import { GatewayInteractor } from '~/domain/gateway/interactors/gateway.interactor';
import type { CreateDepositPaymentInputDomainInterface } from '~/domain/gateway/interfaces/create-deposit-payment-input-domain.interface';
import { PaymentDomainEntity } from '~/domain/gateway/entities/payment-domain.entity';
import { PaymentStatusEnum } from '~/domain/gateway/enums/payment-status.enum';

/**
 * Интерактор домена wallet для управления паевыми взносами, их возвратами, и генерацией документов
 */
@Injectable()
export class WalletDomainInteractor {
  private readonly logger = new Logger(WalletDomainInteractor.name);

  constructor(
    private readonly documentDomainService: DocumentDomainService,
    @Inject(WALLET_BLOCKCHAIN_PORT)
    private readonly walletBlockchainPort: WalletBlockchainPort,
    private readonly gatewayInteractor: GatewayInteractor
  ) {}

  /**
   * Создать депозитный платеж
   */
  async createDepositPayment(data: CreateDepositPaymentInputDomainInterface): Promise<PaymentDomainEntity> {
    return await this.gatewayInteractor.createDeposit(data);
  }

  /**
   * Генерация документа заявления на возврат паевого взноса (900)
   */
  async generateReturnByMoneyStatementDocument(
    data: Cooperative.Registry.ReturnByMoney.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    // Устанавливаем registry_id для документа заявления
    data.registry_id = Cooperative.Registry.ReturnByMoney.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  /**
   * Генерация документа решения совета о возврате паевого взноса (901)
   */
  async generateReturnByMoneyDecisionDocument(
    data: Cooperative.Registry.ReturnByMoneyDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    // Устанавливаем registry_id для документа решения
    data.registry_id = Cooperative.Registry.ReturnByMoneyDecision.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  /**
   * Создание заявки на вывод средств (createWithdraw)
   * Данный метод создает платеж в gateway и withdraw в blockchain
   */
  async createWithdraw(data: CreateWithdrawInputDomainInterface): Promise<{ withdraw_hash: string }> {
    // Используем payment_hash из параметров вместо генерации нового
    const withdraw_hash = data.payment_hash;

    let createdPayment: PaymentDomainEntity | null = null;

    try {
      // 1. Создаем исходящий платеж в gateway для отслеживания
      createdPayment = await this.gatewayInteractor.createWithdraw({
        coopname: data.coopname,
        username: data.username,
        quantity: data.quantity,
        symbol: data.symbol,
        method_id: data.method_id,
        statement: data.statement,
        payment_hash: data.payment_hash,
      });

      // 2. Создаем withdraw в wallet контракте
      // wallet контракт автоматически создаст outcome в gateway контракте
      await this.walletBlockchainPort.createWithdraw({
        coopname: data.coopname,
        username: data.username,
        withdraw_hash,
        quantity: `${data.quantity} ${data.symbol}`,
        statement: data.statement,
      });

      this.logger.log(`Создан withdraw в wallet: ${withdraw_hash}, outcome будет создан автоматически в gateway`);

      return { withdraw_hash };
    } catch (error: any) {
      this.logger.error(`Ошибка при создании withdraw: ${error.message}`, error);

      // Если платеж был создан, но произошла ошибка при создании withdraw в блокчейне
      if (createdPayment?.id) {
        try {
          // Обновляем статус платежа на FAILED с сообщением об ошибке
          await this.gatewayInteractor.setPaymentStatus({
            id: createdPayment.id,
            status: PaymentStatusEnum.FAILED,
          });

          this.logger.log(`Платеж ${createdPayment.id} помечен как FAILED из-за ошибки создания withdraw`);
        } catch (updateError: any) {
          this.logger.error(`Ошибка при обновлении статуса платежа: ${updateError.message}`, updateError);
        }
      }

      throw error;
    }
  }
}
