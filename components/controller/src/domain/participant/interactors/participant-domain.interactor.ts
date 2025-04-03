import { Cooperative } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { Injectable } from '@nestjs/common';
import type { AddParticipantDomainInterface } from '../interfaces/add-participant-domain.interface';
import type { RegisterAccountDomainInterface } from '~/domain/account/interfaces/register-account-input.interface';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import type { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import config from '~/config/config';
import { emailService, participantService, tokenService } from '~/services';
import type { RegisterParticipantDomainInterface } from '../interfaces/register-participant-domain.interface';

@Injectable()
export class ParticipantDomainInteractor {
  constructor(
    private readonly documentDomainService: DocumentDomainService,
    private readonly accountDomainService: AccountDomainService
  ) {}

  async generateParticipantApplication(
    data: Cooperative.Registry.ParticipantApplication.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.ParticipantApplication.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateParticipantApplicationDecision(
    data: Cooperative.Registry.DecisionOfParticipantApplication.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.DecisionOfParticipantApplication.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async registerParticipant(data: RegisterParticipantDomainInterface): Promise<AccountDomainEntity> {
    await participantService.joinCooperative(data);
    return await this.accountDomainService.getAccount(data.username);
  }

  async addParticipant(data: AddParticipantDomainInterface): Promise<AccountDomainEntity> {
    const newAccount: RegisterAccountDomainInterface = {
      ...data,
      public_key: '',
      username: data.username,
    };

    await this.accountDomainService.addProviderAccount(newAccount);

    await this.accountDomainService.addParticipantAccount({
      referer: data.referer ? data.referer : '',
      coopname: config.coopname,
      meta: '',
      username: data.username,
      type: data.type,
      created_at: data.created_at,
      initial: data.initial,
      minimum: data.minimum,
      spread_initial: data.spread_initial,
    });

    //TODO move it to hexagon services
    const token = await tokenService.generateInviteToken(data.email);
    await emailService.sendInviteEmail(data.email, token);

    return this.accountDomainService.getAccount(data.username);
  }
}
