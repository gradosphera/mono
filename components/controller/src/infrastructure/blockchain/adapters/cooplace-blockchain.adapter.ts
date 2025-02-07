import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { MarketContract } from 'cooptypes';
import { TransactResult } from '@wharfkit/session';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';
import type { CooplaceBlockchainPort } from '~/domain/cooplace/interfaces/cooplace-blockchain.port';

@Injectable()
export class CooplaceBlockchainAdapter implements CooplaceBlockchainPort {
  constructor(private readonly blockchainService: BlockchainService) {}

  async updateRequest(data: MarketContract.Actions.UpdateRequest.IUpdateRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.UpdateRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async acceptRequest(data: MarketContract.Actions.AcceptRequest.IAcceptRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.AcceptRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }
  async cancelRequest(data: MarketContract.Actions.CancelRequest.ICancelRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.CancelRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async completeRequest(data: MarketContract.Actions.CompleteRequest.ICompleteRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.CompleteRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async confirmOnReceive(data: MarketContract.Actions.ConfirmReceive.IConfirmReceive): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.ConfirmReceive.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async confirmOnSupply(data: MarketContract.Actions.ConfirmSupply.IConfirmSupply): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.ConfirmSupply.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async createChildOrder(data: MarketContract.Actions.CreateOrder.ICreateOrder): Promise<TransactResult> {
    const wif = await Vault.getWif(data.params.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.params.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.CreateOrder.actionName,
      authorization: [
        {
          actor: data.params.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async createParentOffer(data: MarketContract.Actions.CreateOffer.ICreateOffer): Promise<TransactResult> {
    const wif = await Vault.getWif(data.params.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.params.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.CreateOffer.actionName,
      authorization: [
        {
          actor: data.params.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async declineRequest(data: MarketContract.Actions.DeclineRequest.IDeclineRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.DeclineRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async deliverOnRequest(data: MarketContract.Actions.DeliverOnRequest.IDeliverOnRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.DeliverOnRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async openDispute(data: MarketContract.Actions.OpenDispute.IOpenDispute): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.OpenDispute.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async moderateRequest(data: MarketContract.Actions.ModerateRequest.IModerateRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.ModerateRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async prohibitRequest(data: MarketContract.Actions.ProhibitRequest.IProhibitRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.ProhibitRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async publishRequest(data: MarketContract.Actions.PublishRequest.IPublishRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.PublishRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async receiveOnRequest(data: MarketContract.Actions.ReceiveOnRequest.IReceiveOnRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.ReceiveOnRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async supplyOnRequest(data: MarketContract.Actions.SupplyOnRequest.ISupplyOnRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.SupplyOnRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }

  async unpublishRequest(data: MarketContract.Actions.UnpublishRequest.IUnpublishRequest): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    return await this.blockchainService.transact({
      account: MarketContract.contractName.production,
      name: MarketContract.Actions.UnpublishRequest.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data,
    });
  }
}
