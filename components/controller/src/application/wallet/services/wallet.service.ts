import { Injectable } from '@nestjs/common';
import { WalletDomainInteractor } from '~/domain/wallet/interactors/wallet.interactor';
import { UserCertificateInteractor } from '~/domain/user-certificate/interactors/user-certificate.interactor';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { ReturnByMoneyGenerateDocumentInputDTO } from '~/application/document/documents-dto/return-by-money-statement.dto';
import { ReturnByMoneyDecisionGenerateDocumentInputDTO } from '~/application/document/documents-dto/return-by-money-decision.dto';
import { CreateWithdrawInputDTO } from '../dto/create-withdraw-input.dto';
import { CreateWithdrawResponseDTO } from '../dto/create-withdraw-response.dto';
import { Cooperative } from 'cooptypes';
import type { CreateDepositPaymentInputDTO } from '../../gateway/dto/create-deposit-payment-input.dto';
import type { GatewayPaymentDTO } from '../../gateway/dto/gateway-payment.dto';

/**
 * Сервис для работы с wallet модулем
 */
@Injectable()
export class WalletService {
  constructor(
    private readonly walletDomainInteractor: WalletDomainInteractor,
    private readonly userCertificateInteractor: UserCertificateInteractor
  ) {}

  /**
   * Создать депозитный платеж
   */
  public async createDepositPayment(data: CreateDepositPaymentInputDTO): Promise<GatewayPaymentDTO> {
    const result = await this.walletDomainInteractor.createDepositPayment(data);
    const usernameCertificate = await this.userCertificateInteractor.getCertificateByUsername(result.username);
    return result.toDTO(usernameCertificate);
  }

  /**
   * Генерация документа заявления на возврат паевого взноса (900)
   */
  public async generateReturnByMoneyStatementDocument(
    data: ReturnByMoneyGenerateDocumentInputDTO,
    options?: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    // Устанавливаем registry_id для документа заявления
    data.registry_id = Cooperative.Registry.ReturnByMoney.registry_id;

    const document = await this.walletDomainInteractor.generateReturnByMoneyStatementDocument(data, options || {});
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  /**
   * Генерация документа решения совета о возврате паевого взноса (901)
   */
  public async generateReturnByMoneyDecisionDocument(
    data: ReturnByMoneyDecisionGenerateDocumentInputDTO,
    options?: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    // Устанавливаем registry_id для документа решения
    data.registry_id = Cooperative.Registry.ReturnByMoneyDecision.registry_id;

    const document = await this.walletDomainInteractor.generateReturnByMoneyDecisionDocument(data, options || {});
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  /**
   * Создание заявки на вывод средств
   */
  public async createWithdraw(data: CreateWithdrawInputDTO): Promise<CreateWithdrawResponseDTO> {
    const result = await this.walletDomainInteractor.createWithdraw(data);

    const response = new CreateWithdrawResponseDTO();
    response.withdraw_hash = result.withdraw_hash;

    return response;
  }
}
