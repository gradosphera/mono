import { BadGatewayException, HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
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
import {
  AGREEMENT_CONFIGURATION_SERVICE,
  AgreementConfigurationService,
} from '~/domain/registration/services/agreement-configuration.service';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';
import type { AccountType } from '~/application/account/enum/account-type.enum';

@Injectable()
export class AccountBlockchainAdapter implements AccountBlockchainPort {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly domainToBlockchainUtils: DomainToBlockchainUtils,
    @Inject(forwardRef(() => AGREEMENT_CONFIGURATION_SERVICE))
    private readonly agreementConfigService: AgreementConfigurationService
  ) {}

  async registerBlockchainAccount(candidate: CandidateDomainInterface): Promise<void> {
    // Проверяем наличие заявления (обязательно для всех)
    if (!candidate.documents?.statement) {
      throw new HttpException('Не найдено заявление на вступление', HttpStatus.BAD_REQUEST);
    }

    // Получаем конфигурацию соглашений для типа аккаунта кандидата
    const accountType = candidate.type as AccountType;
    const blockchainAgreements = this.agreementConfigService.getBlockchainAgreements(accountType, config.coopname);

    // Проверяем наличие всех требуемых документов на основе конфигурации
    for (const agreementConfig of blockchainAgreements) {
      const documentKey = agreementConfig.id as keyof typeof candidate.documents;
      if (!candidate.documents?.[documentKey]) {
        throw new HttpException(`Не найден документ: ${agreementConfig.title}`, HttpStatus.BAD_REQUEST);
      }
    }

    const wif = await Vault.getWif(config.coopname);
    if (!wif) throw new BadGatewayException('Не найден приватный ключ для совершения операции');

    await this.blockchainService.initialize(config.coopname, wif);

    const actions: any[] = [];

    // Создаем объект registerAccountData с данными из кандидата
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

    // Динамически добавляем соглашения на основе конфигурации
    for (const agreementConfig of blockchainAgreements) {
      const documentKey = agreementConfig.id as keyof typeof candidate.documents;
      const document = candidate.documents?.[documentKey] as ISignedDocumentDomainInterface | undefined;

      if (document) {
        const sendAgreementAction = this.createSendAgreementAction(
          candidate.username,
          agreementConfig.agreement_type,
          document
        );
        actions.push(sendAgreementAction);
      }
    }

    await this.blockchainService.transact(actions);
  }

  /**
   * Создает action для отправки соглашения в блокчейн
   */
  private createSendAgreementAction(username: string, agreementType: string, document: ISignedDocumentDomainInterface): any {
    const agreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
      coopname: config.coopname,
      administrator: config.coopname,
      username,
      agreement_type: agreementType,
      document: Classes.Document.finalize(document),
    };

    return {
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Agreements.SendAgreement.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data: agreementData,
    };
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
