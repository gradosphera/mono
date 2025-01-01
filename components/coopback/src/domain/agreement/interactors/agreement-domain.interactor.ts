import { Cooperative } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AgreementDomainInteractor {
  constructor(private readonly documentDomainService: DocumentDomainService) {}

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
}
