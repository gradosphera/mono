import { BadRequestException, Injectable } from '@nestjs/common';
import type { CooperativeContactsDomainInterface } from '../interfaces/cooperative-contacts-domain.interface';
import { RegistratorContract, type Cooperative } from 'cooptypes';
import { generator } from '~/services/document.service';
import config from '~/config/config';
import logger from '~/config/logger';
import { blockchainService } from '~/services';

@Injectable()
export class SystemDomainService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async loadContacts(): Promise<CooperativeContactsDomainInterface> {
    const cooperative: Cooperative.Model.ICooperativeData | null = await generator.constructCooperative(config.coopname);

    if (!cooperative) throw new BadRequestException('Кооператив не найден');

    const api = await blockchainService.getApi();

    const coopAccount = (
      await blockchainService.lazyFetch(
        api,
        RegistratorContract.contractName.production,
        RegistratorContract.contractName.production,
        RegistratorContract.Tables.Accounts.tableName,
        config.coopname,
        config.coopname,
        1
      )
    )[0];

    if (!coopAccount) throw new BadRequestException('Аккаунт не найден');

    let meta: Cooperative.Users.IAccountMeta = { phone: cooperative?.phone, email: cooperative?.email };

    if (coopAccount.meta) {
      try {
        meta = JSON.parse(coopAccount.meta);
      } catch (e: any) {
        logger.warn(`Ошибка при получении контактов: ${e.message}`);
      }
    }

    return {
      full_name: cooperative?.full_name,
      full_address: cooperative?.full_address,
      details: cooperative?.details,
      phone: meta.phone,
      email: meta.email,
      // description: cooperative?.description,
      chairman: {
        first_name: cooperative?.chairman.first_name,
        last_name: cooperative?.chairman.last_name,
        middle_name: cooperative?.chairman.middle_name,
      },
    };
  }
}
