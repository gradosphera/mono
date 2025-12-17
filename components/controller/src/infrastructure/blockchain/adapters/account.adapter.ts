import { BadGatewayException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { GatewayContract, RegistratorContract, SovietContract } from 'cooptypes';
import type { BlockchainAccountInterface } from '~/types/shared';
import type { AccountBlockchainPort } from '~/domain/account/interfaces/account-blockchain.port';
import Vault from '~/models/vault.model';
import { Name } from '@wharfkit/antelope';
import config from '~/config/config';
import { DomainToBlockchainUtils } from '../../../shared/utils/domain-to-blockchain.utils';
import { CandidateDomainInterface } from '~/domain/account/interfaces/candidate-domain.interface';
import { Classes } from '@coopenomics/sdk';

@Injectable()
export class AccountBlockchainAdapter implements AccountBlockchainPort {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils
  ) {}

  async registerBlockchainAccount(candidate: CandidateDomainInterface): Promise<void> {
    // Проверяем наличие всех необходимых документов
    if (!candidate.documents?.statement) {
      throw new HttpException('Не найдено заявление на вступление', HttpStatus.BAD_REQUEST);
    }
    if (!candidate.documents?.wallet_agreement) {
      throw new HttpException('Не найдено соглашение по кошельку', HttpStatus.BAD_REQUEST);
    }
    if (!candidate.documents?.signature_agreement) {
      throw new HttpException('Не найдено соглашение о правилах использования ЭЦП', HttpStatus.BAD_REQUEST);
    }
    if (!candidate.documents?.privacy_agreement) {
      throw new HttpException('Не найдено соглашение о политике конфиденциальности', HttpStatus.BAD_REQUEST);
    }
    if (!candidate.documents?.user_agreement) {
      throw new HttpException('Не найдено подписанное пользовательское соглашение', HttpStatus.BAD_REQUEST);
    }

    const wif = await Vault.getWif(config.coopname);
    if (!wif) throw new BadGatewayException('Не найден приватный ключ для совершения операции');

    await this.blockchainService.initialize(config.coopname, wif);

    const actions: any[] = [];

    // Создаем объект registerUserData с данными из кандидата
    const registerAccountData: RegistratorContract.Actions.CreateAccount.ICreateAccount = {
      coopname: config.coopname,
      username: candidate.username,
      referer: candidate.referer || '',
      public_key: candidate.public_key,
      meta: candidate.meta || '{}',
    };

    actions.push({
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.CreateAccount.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data: registerAccountData,
    });

    // Создаем объект registerUserData с данными из кандидата
    const registerUserData: RegistratorContract.Actions.RegisterUser.IRegisterUser = {
      coopname: config.coopname,
      username: candidate.username,
      type: candidate.type,
      braname: candidate.braname || '',
      statement: Classes.Document.finalize(candidate.documents.statement),
      registration_hash: candidate.registration_hash,
    };

    actions.push({
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.RegisterUser.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data: registerUserData,
    });

    // Создаем completeDeposit
    const completeDeposit: GatewayContract.Actions.CompleteIncome.ICompleteIncome = {
      coopname: config.coopname,
      income_hash: candidate.registration_hash,
    };

    actions.push({
      account: GatewayContract.contractName.production,
      name: GatewayContract.Actions.CompleteIncome.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data: completeDeposit,
    });

    // Создаем walletAgreementData
    const walletAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
      coopname: config.coopname,
      administrator: config.coopname,
      username: candidate.username,
      agreement_type: 'wallet',
      document: Classes.Document.finalize(candidate.documents.wallet_agreement),
    };
    actions.push({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Agreements.SendAgreement.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data: walletAgreementData,
    });

    // Создаем signatureAgreementData
    const signatureAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
      coopname: config.coopname,
      administrator: config.coopname,
      username: candidate.username,
      agreement_type: 'signature',
      document: Classes.Document.finalize(candidate.documents.signature_agreement),
    };
    actions.push({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Agreements.SendAgreement.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data: signatureAgreementData,
    });

    // Создаем privacyAgreementData
    const privacyAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
      coopname: config.coopname,
      administrator: config.coopname,
      username: candidate.username,
      agreement_type: 'privacy',
      document: Classes.Document.finalize(candidate.documents.privacy_agreement),
    };
    actions.push({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Agreements.SendAgreement.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data: privacyAgreementData,
    });

    // Создаем userAgreementData
    const userAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
      coopname: config.coopname,
      administrator: config.coopname,
      username: candidate.username,
      agreement_type: 'user',
      document: Classes.Document.finalize(candidate.documents.user_agreement),
    };
    actions.push({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Agreements.SendAgreement.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data: userAgreementData,
    });

    await this.blockchainService.transact(actions);
  }

  async addParticipantAccount(data: RegistratorContract.Actions.AddUser.IAddUser): Promise<void> {
    const wif = await Vault.getWif(data.coopname);

    if (!wif) throw new BadGatewayException('Не найден приватный ключ для совершения операции');

    await this.blockchainService.initialize(data.coopname, wif);

    await this.blockchainService.transact({
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.AddUser.actionName,
      authorization: [{ actor: data.coopname, permission: 'active' }],
      data,
    });
  }

  getBlockchainAccount(username: string): Promise<BlockchainAccountInterface | null> {
    return this.blockchainService.getAccount(username);
  }

  getParticipantAccount(
    coopname: string,
    username: string
  ): Promise<SovietContract.Tables.Participants.IParticipants | null> {
    return this.blockchainService.getSingleRow(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Participants.tableName,
      Name.from(username)
    );
  }

  getUserAccount(username: string): Promise<RegistratorContract.Tables.Accounts.IAccount | null> {
    return this.blockchainService.getSingleRow(
      RegistratorContract.contractName.production,
      RegistratorContract.contractName.production,
      RegistratorContract.Tables.Accounts.tableName,
      Name.from(username)
    );
  }

  getCooperatorAccount(coopname: string): Promise<RegistratorContract.Tables.Cooperatives.ICooperative | null> {
    return this.blockchainService.getSingleRow(
      RegistratorContract.contractName.production,
      RegistratorContract.contractName.production,
      RegistratorContract.Tables.Cooperatives.tableName,
      Name.from(coopname)
    );
  }
}
