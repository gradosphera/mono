import { Injectable } from '@nestjs/common';
import type { AssetContributionStatementGenerateDocumentInputDTO } from '../../document/documents-dto/asset-contribution-statement-document.dto';
import type { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import type { AssetContributionActGenerateDocumentInputDTO } from '../../document/documents-dto/asset-contribution-act-document.dto';
import type { AssetContributionDecisionGenerateDocumentInputDTO } from '../../document/documents-dto/asset-contribution-decision-document.dto';
import type { ReturnByAssetActGenerateDocumentInputDTO } from '../../document/documents-dto/return-by-asset-act-document.dto';
import type { ReturnByAssetDecisionGenerateDocumentInputDTO } from '../../document/documents-dto/return-by-asset-decision-document.dto';
import type { ReturnByAssetStatementGenerateDocumentInputDTO } from '../../document/documents-dto/return-by-asset-statement-document.dto';
import { CooplaceDomainInteractor } from '~/domain/cooplace/interactors/cooplace.interactor';
import type { AcceptChildOrderInputDTO } from '../dto/accept-child-order-input.dto';
import type { CancelRequestInputDTO } from '../dto/cancel-request-input.dto';
import type { CompleteRequestInputDTO } from '../dto/complete-request-input.dto';
import type { ConfirmReceiveOnRequestInputDTO } from '../dto/confirm-receive-on-request.dto';
import type { ConfirmSupplyOnRequestInputDTO } from '../dto/confirm-supply-on-request.dto';
import type { CreateChildOrderInputDTO } from '../dto/create-child-order-input.dto';
import type { DeliverOnRequestInputDTO } from '../dto/deliver-on-request-input.dto';
import type { CreateParentOfferInputDTO } from '../dto/create-parent-offer-input.dto';
import type { DeclineRequestInputDTO } from '../dto/decline-request-input.dto';
import type { DisputeOnRequestInputDTO } from '../dto/dispute-on-request-input.dto';
import type { PublishRequestInputDTO } from '../dto/publish-request-input.dto';
import type { ModerateRequestInputDTO } from '../dto/moderate-request-input.dto';
import type { ProhibitRequestInputDTO } from '../dto/prohibit-request-input.dto';
import type { ReceiveOnRequestInputDTO } from '../dto/receive-on-request-input.dto';
import type { SupplyOnRequestInputDTO } from '../dto/supply-on-request-input.dto';
import type { UnpublishRequestInputDTO } from '../dto/unpublish-request-input.dto';
import type { UpdateRequestInputDTO } from '../dto/update-request-input.dto';
import type { TransactionDTO } from '~/modules/common/dto/transaction-result-response.dto';
import type { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';

@Injectable()
export class CooplaceService {
  constructor(private readonly cooplaceDomainInteractor: CooplaceDomainInteractor) {}

  public async generateAssetContributionStatement(
    data: AssetContributionStatementGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.cooplaceDomainInteractor.generateAssetContributionStatementDocument(data, options);
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateAssetContributionDecision(
    data: AssetContributionDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.cooplaceDomainInteractor.generateAssetContributionDecisionDocument(data, options);
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateAssetContributionAct(
    data: AssetContributionActGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.cooplaceDomainInteractor.generateAssetContributionActDocument(data, options);
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateReturnByAssetStatement(
    data: ReturnByAssetStatementGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.cooplaceDomainInteractor.generateReturnByAssetStatementDocument(data, options);
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateReturnByAssetDecision(
    data: ReturnByAssetDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.cooplaceDomainInteractor.generateReturnByAssetDecisionDocument(data, options);
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateReturnByAssetAct(
    data: ReturnByAssetActGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.cooplaceDomainInteractor.generateReturnByAssetActDocument(data, options);
    return document as unknown as GeneratedDocumentDTO;
  }

  public async acceptChildOrder(data: AcceptChildOrderInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.acceptChildOrder(data);
    return result;
  }

  public async cancelRequest(data: CancelRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.cancelRequest(data);
    return result;
  }

  public async completeRequest(data: CompleteRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.completeRequest(data);
    return result;
  }

  public async confirmReceiveOnRequest(data: ConfirmReceiveOnRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.confirmReceiveOnRequest(data);
    return result;
  }

  public async confirmSupplyOnRequest(data: ConfirmSupplyOnRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.confirmSupplyOnRequest(data);
    return result;
  }

  public async createChildOrder(data: CreateChildOrderInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.createChildOrder({ params: data });
    return result;
  }

  public async createParentOffer(data: CreateParentOfferInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.createParentOffer({ params: data });
    return result;
  }

  public async declineRequest(data: DeclineRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.declineRequest(data);
    return result;
  }

  public async deliverOnRequest(data: DeliverOnRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.deliverOnRequest(data);
    return result;
  }

  public async disputeOnRequest(data: DisputeOnRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.disputeOnRequest(data);
    return result;
  }

  public async moderateRequest(data: ModerateRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.moderateRequest(data);
    return result;
  }

  public async prohibitRequest(data: ProhibitRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.prohibitRequest(data);
    return result;
  }

  public async publishRequest(data: PublishRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.publishRequest(data);
    return result;
  }

  public async receiveOnRequest(data: ReceiveOnRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.receiveOnRequest(data);
    return result;
  }

  public async supplyOnRequest(data: SupplyOnRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.supplyOnRequest(data);
    return result;
  }

  public async unpublishRequest(data: UnpublishRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.unpublishRequest(data);
    return result;
  }

  public async updateRequest(data: UpdateRequestInputDTO): Promise<TransactionDTO> {
    const result = await this.cooplaceDomainInteractor.updateRequest(data);
    return result;
  }
}
