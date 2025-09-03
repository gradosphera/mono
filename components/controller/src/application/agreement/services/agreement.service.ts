import { Injectable } from '@nestjs/common';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { AgreementDomainInteractor } from '~/domain/agreement/interactors/agreement-domain.interactor';

@Injectable()
export class AgreementService {
  constructor(private readonly agreementDomainInteractor: AgreementDomainInteractor) {}

  public async generateWalletAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.agreementDomainInteractor.generateWalletAgreement(data, options);
    return document as GeneratedDocumentDTO;
  }

  public async generatePrivacyAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.agreementDomainInteractor.generatePrivacyAgreement(data, options);
    return document as GeneratedDocumentDTO;
  }

  public async generateSignatureAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.agreementDomainInteractor.generateSignatureAgreement(data, options);
    return document as GeneratedDocumentDTO;
  }

  public async generateUserAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.agreementDomainInteractor.generateUserAgreement(data, options);
    return document as GeneratedDocumentDTO;
  }
}
