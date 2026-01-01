import { Injectable, Inject } from '@nestjs/common';
import { DocumentInteractor } from '~/application/document/interactors/document.interactor';
import { SOVIET_BLOCKCHAIN_PORT, SovietBlockchainPort } from '~/domain/common/ports/soviet-blockchain.port';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import { Cooperative, SovietContract } from 'cooptypes';
import type { TransactResult } from '@wharfkit/session';
import { SendAgreementInputDTO } from '../dto/send-agreement-input.dto';
import { ConfirmAgreementInputDTO } from '../dto/confirm-agreement-input.dto';
import { DeclineAgreementInputDTO } from '../dto/decline-agreement-input.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';

@Injectable()
export class AgreementInteractor {
  constructor(
    private readonly documentInteractor: DocumentInteractor,
    @Inject(SOVIET_BLOCKCHAIN_PORT) private readonly sovietBlockchainPort: SovietBlockchainPort,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  async generateWalletAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    data.registry_id = Cooperative.Registry.WalletAgreement.registry_id;
    const document = await this.documentInteractor.generateDocument({ data, options });
    return document as GeneratedDocumentDTO;
  }

  async generatePrivacyAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    data.registry_id = Cooperative.Registry.PrivacyPolicy.registry_id;
    const document = await this.documentInteractor.generateDocument({ data, options });
    return document as GeneratedDocumentDTO;
  }

  async generateSignatureAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    data.registry_id = Cooperative.Registry.RegulationElectronicSignature.registry_id;
    const document = await this.documentInteractor.generateDocument({ data, options });
    return document as GeneratedDocumentDTO;
  }

  async generateUserAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    data.registry_id = Cooperative.Registry.UserAgreement.registry_id;
    const document = await this.documentInteractor.generateDocument({ data, options });
    return document as GeneratedDocumentDTO;
  }

  async sendAgreement(data: SendAgreementInputDTO): Promise<TransactResult> {
    // Преобразуем DTO в формат блокчейна
    const blockchainData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
      coopname: data.coopname,
      administrator: data.administrator,
      username: data.username,
      agreement_type: data.agreement_type,
      document: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.document),
    };

    return await this.sovietBlockchainPort.sendAgreement(blockchainData);
  }

  async confirmAgreement(data: ConfirmAgreementInputDTO): Promise<TransactResult> {
    // Преобразуем DTO в формат блокчейна
    const blockchainData: SovietContract.Actions.Agreements.ConfirmAgreement.IConfirmAgreement = {
      coopname: data.coopname,
      administrator: data.administrator,
      username: data.username,
      agreement_id: data.agreement_id,
    };

    return await this.sovietBlockchainPort.confirmAgreement(blockchainData);
  }

  async declineAgreement(data: DeclineAgreementInputDTO): Promise<TransactResult> {
    // Преобразуем DTO в формат блокчейна
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
