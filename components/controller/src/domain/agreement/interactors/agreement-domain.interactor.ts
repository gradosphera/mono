import { Cooperative, SovietContract } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { Injectable, Inject } from '@nestjs/common';
import { SOVIET_BLOCKCHAIN_PORT, SovietBlockchainPort } from '~/domain/common/ports/soviet-blockchain.port';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import type { TransactResult } from '@wharfkit/session';
import type {
  SendAgreementDomainInterface,
  ConfirmAgreementDomainInterface,
  DeclineAgreementDomainInterface,
} from '../interfaces/agreement-domain.interface';

@Injectable()
export class AgreementDomainInteractor {
  constructor(
    private readonly documentDomainService: DocumentDomainService,
    @Inject(SOVIET_BLOCKCHAIN_PORT) private readonly sovietBlockchainPort: SovietBlockchainPort,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  async generateWalletAgreement(
    data: Cooperative.Registry.WalletAgreement.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.WalletAgreement.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generatePrivacyAgreement(
    data: Cooperative.Registry.PrivacyPolicy.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.PrivacyPolicy.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateSignatureAgreement(
    data: Cooperative.Registry.RegulationElectronicSignature.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.RegulationElectronicSignature.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateUserAgreement(
    data: Cooperative.Registry.UserAgreement.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.UserAgreement.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async sendAgreement(data: SendAgreementDomainInterface): Promise<TransactResult> {
    // Преобразуем доменный интерфейс в формат блокчейна
    const blockchainData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
      coopname: data.coopname,
      administrator: data.administrator,
      username: data.username,
      agreement_type: data.agreement_type,
      document: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.document),
    };

    return await this.sovietBlockchainPort.sendAgreement(blockchainData);
  }

  async confirmAgreement(data: ConfirmAgreementDomainInterface): Promise<TransactResult> {
    // Преобразуем доменный интерфейс в формат блокчейна
    const blockchainData: SovietContract.Actions.Agreements.ConfirmAgreement.IConfirmAgreement = {
      coopname: data.coopname,
      administrator: data.administrator,
      username: data.username,
      agreement_id: data.agreement_id,
    };

    return await this.sovietBlockchainPort.confirmAgreement(blockchainData);
  }

  async declineAgreement(data: DeclineAgreementDomainInterface): Promise<TransactResult> {
    // Преобразуем доменный интерфейс в формат блокчейна
    const blockchainData: SovietContract.Actions.Agreements.DeclineAgreement.IDeclineAgreement = {
      coopname: data.coopname,
      administrator: data.administrator,
      username: data.username,
      agreement_id: data.agreement_id,
      comment: data.comment,
    };

    return await this.sovietBlockchainPort.declineAgreement(blockchainData);
  }
}
