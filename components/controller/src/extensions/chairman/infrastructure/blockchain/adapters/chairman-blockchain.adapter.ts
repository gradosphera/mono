import { Injectable } from '@nestjs/common';
import { SovietContract } from 'cooptypes';
import { ChairmanBlockchainPort } from '../../../domain/interfaces/chairman-blockchain.port';
import { type TransactResult } from '@wharfkit/session';
import { BlockchainService } from '~/infrastructure/blockchain/blockchain.service';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';
import { ConfirmApproveInputDTO } from '../../../application/dto/confirm-approve-input.dto';
import { DeclineApproveInputDTO } from '../../../application/dto/decline-approve-input.dto';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';

/**
 * Инфраструктурный сервис для реализации блокчейн порта CHAIRMAN
 * Осуществляет взаимодействие с блокчейном через BlockchainService
 */
@Injectable()
export class ChairmanBlockchainAdapter implements ChairmanBlockchainPort {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  /**
   * Подтвердить одобрение документа
   */
  async confirmApprove(data: ConfirmApproveInputDTO): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем данные для блокчейна
    const blockchainData: SovietContract.Actions.Approves.ConfirmApprove.IConfirmApprove = {
      coopname: data.coopname,
      approval_hash: data.approval_hash,
      approved_document: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.approved_document),
    };

    return await this.blockchainService.transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Approves.ConfirmApprove.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    });
  }

  /**
   * Отклонить одобрение документа
   */
  async declineApprove(data: DeclineApproveInputDTO): Promise<TransactResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем данные для блокчейна
    const blockchainData: SovietContract.Actions.Approves.DeclineApprove.IDeclineApprove = {
      coopname: data.coopname,
      approval_hash: data.approval_hash,
      reason: data.reason,
    };

    return await this.blockchainService.transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Approves.DeclineApprove.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    });
  }
}
