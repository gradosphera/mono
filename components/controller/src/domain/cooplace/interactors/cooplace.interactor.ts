import { Cooperative, type MarketContract } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { COOPLACE_BLOCKCHAIN_PORT, CooplaceBlockchainPort } from '../interfaces/cooplace-blockchain.port';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { Inject, Injectable } from '@nestjs/common';
import type { TransactResult } from '@wharfkit/session';
import type { AcceptChildOrderInputDomainInterface } from '../interfaces/accept-child-order-input.interface';

@Injectable()
export class CooplaceDomainInteractor {
  constructor(
    private readonly documentDomainService: DocumentDomainService,
    @Inject(COOPLACE_BLOCKCHAIN_PORT) private readonly cooplaceBlockchainPort: CooplaceBlockchainPort
  ) {}

  async generateAssetContributionStatementDocument(
    data: Cooperative.Registry.AssetContributionStatement.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AssetContributionStatement.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateAssetContributionDecisionDocument(
    data: Cooperative.Registry.AssetContributionDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AssetContributionDecision.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateAssetContributionActDocument(
    data: Cooperative.Registry.AssetContributionAct.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AssetContributionAct.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateReturnByAssetStatementDocument(
    data: Cooperative.Registry.ReturnByAssetStatement.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.ReturnByAssetStatement.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateReturnByAssetDecisionDocument(
    data: Cooperative.Registry.ReturnByAssetDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.ReturnByAssetDecision.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateReturnByAssetActDocument(
    data: Cooperative.Registry.ReturnByAssetAct.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.ReturnByAssetAct.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  public async acceptChildOrder(data: AcceptChildOrderInputDomainInterface): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.acceptRequest({
      ...data,
      document: { ...data.document, meta: JSON.stringify(data.document.meta) },
    });
    return result;
  }

  public async cancelRequest(data: MarketContract.Actions.CancelRequest.ICancelRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.cancelRequest(data);
    return result;
  }

  public async completeRequest(data: MarketContract.Actions.CompleteRequest.ICompleteRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.completeRequest(data);
    return result;
  }

  public async confirmReceiveOnRequest(
    data: MarketContract.Actions.ConfirmReceive.IConfirmReceive
  ): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.confirmOnReceive(data);
    return result;
  }

  public async confirmSupplyOnRequest(data: MarketContract.Actions.ConfirmSupply.IConfirmSupply): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.confirmOnSupply(data);
    return result;
  }

  public async createChildOrder(data: MarketContract.Actions.CreateOrder.ICreateOrder): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.createChildOrder(data);
    return result;
  }

  public async createParentOrder(data: MarketContract.Actions.CreateOffer.ICreateOffer): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.createParentOffer(data);
    return result;
  }

  public async declineRequest(data: MarketContract.Actions.DeclineRequest.IDeclineRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.declineRequest(data);
    return result;
  }

  public async deliverOnRequest(data: MarketContract.Actions.DeliverOnRequest.IDeliverOnRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.deliverOnRequest(data);
    return result;
  }

  public async disputeOnRequest(data: MarketContract.Actions.OpenDispute.IOpenDispute): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.openDispute(data);
    return result;
  }

  public async moderateRequest(data: MarketContract.Actions.ModerateRequest.IModerateRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.moderateRequest(data);
    return result;
  }

  public async prohibitRequest(data: MarketContract.Actions.ProhibitRequest.IProhibitRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.prohibitRequest(data);
    return result;
  }

  public async publishRequest(data: MarketContract.Actions.PublishRequest.IPublishRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.publishRequest(data);
    return result;
  }

  public async receiveOnRequest(data: MarketContract.Actions.ReceiveOnRequest.IRecieveOnRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.receiveOnRequest(data);
    return result;
  }

  public async supplyOnRequest(data: MarketContract.Actions.SupplyOnRequest.ISupplyOnRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.supplyOnRequest(data);
    return result;
  }

  public async unpublishRequest(data: MarketContract.Actions.UnpublishRequest.IUnpublishRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.unpublishRequest(data);
    return result;
  }

  public async updateRequest(data: MarketContract.Actions.UpdateRequest.IUpdateRequest): Promise<TransactResult> {
    const result = await this.cooplaceBlockchainPort.updateRequest(data);
    return result;
  }
}
