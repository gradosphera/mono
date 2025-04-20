import { Injectable } from '@nestjs/common';
import { MeetBlockchainPort } from '~/domain/meet/ports/meet-blockchain.port';
import { BlockchainService } from '../blockchain.service';
import { MeetContract } from 'cooptypes';
import { TransactResult } from '@wharfkit/session';
import Vault from '~/models/vault.model';
import httpStatus from 'http-status';
import { HttpApiError } from '~/errors/http-api-error';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import { VoteOnAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/vote-on-annual-general-meet-input.interface';
import { RestartAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/restart-annual-general-meet-input-domain.interface';
import { CloseAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/close-annual-general-meet-input-domain.interface';
import { CreateAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/create-annual-meet-input-domain.interface';
import { DomainToBlockchainUtils } from '../utils/domain-to-blockchain.utils';

@Injectable()
export class MeetBlockchainAdapter implements MeetBlockchainPort {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  async getMeet(coopname: string, hash: string): Promise<MeetContract.Tables.Meets.IOutput | null> {
    return this.blockchainService.getSingleRow(
      MeetContract.contractName.production,
      coopname,
      MeetContract.Tables.Meets.tableName,
      hash,
      'secondary'
    );
  }

  async getMeets(coopname: string): Promise<MeetContract.Tables.Meets.IOutput[]> {
    return this.blockchainService.getAllRows(
      MeetContract.contractName.production,
      coopname,
      MeetContract.Tables.Meets.tableName
    );
  }

  async getQuestions(coopname: string, hash: string): Promise<MeetContract.Tables.Questions.IOutput[]> {
    const allQuestions = await this.blockchainService.query(
      MeetContract.contractName.production,
      coopname,
      MeetContract.Tables.Questions.tableName,
      {
        indexPosition: 'secondary',
        from: hash,
        to: hash,
      }
    );

    return allQuestions;
  }

  async createMeet(data: CreateAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем доменный объект в инфраструктурный тип
    const blockchainData: MeetContract.Actions.CreateMeet.IInput = {
      ...data,
      proposal: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.proposal),
      open_at: this.domainToBlockchainUtils.convertDateToBlockchainFormat(data.open_at),
      close_at: this.domainToBlockchainUtils.convertDateToBlockchainFormat(data.close_at),
    };

    const result = (await this.blockchainService.transact({
      account: MeetContract.contractName.production,
      name: MeetContract.Actions.CreateMeet.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    return result;
  }

  async vote(data: VoteOnAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем доменный объект в инфраструктурный тип
    const blockchainData: MeetContract.Actions.Vote.IInput = {
      coopname: data.coopname,
      hash: data.hash,
      member: data.member,
      ballot: data.ballot,
    };

    const result = (await this.blockchainService.transact({
      account: MeetContract.contractName.production,
      name: MeetContract.Actions.Vote.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    return result;
  }

  async restartMeet(data: RestartAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем доменный объект в инфраструктурный тип
    const blockchainData: MeetContract.Actions.RestartMeet.IInput = {
      coopname: data.coopname,
      hash: data.hash,
      newproposal: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.newproposal),
      new_open_at: this.domainToBlockchainUtils.convertDateToBlockchainFormat(data.new_open_at),
      new_close_at: this.domainToBlockchainUtils.convertDateToBlockchainFormat(data.new_close_at),
    };

    const result = (await this.blockchainService.transact({
      account: MeetContract.contractName.production,
      name: MeetContract.Actions.RestartMeet.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    return result;
  }

  async closeMeet(data: CloseAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult> {
    const wif = await Vault.getWif(data.coopname);
    if (!wif) throw new HttpApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

    this.blockchainService.initialize(data.coopname, wif);

    // Преобразуем доменный объект в инфраструктурный тип
    const blockchainData: MeetContract.Actions.CloseMeet.IInput = {
      coopname: data.coopname,
      hash: data.hash,
      meet_decision: this.domainToBlockchainUtils.convertSignedDocumentToBlockchainFormat(data.meet_decision),
    };

    const result = (await this.blockchainService.transact({
      account: MeetContract.contractName.production,
      name: MeetContract.Actions.CloseMeet.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data: blockchainData,
    })) as TransactResult;

    return result;
  }
}
