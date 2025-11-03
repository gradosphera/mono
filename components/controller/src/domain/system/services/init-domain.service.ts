import { Injectable, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import config from '~/config/config';
import logger from '~/config/logger';
import { generator } from '~/services/document.service';
import type { InitInputDomainInterface } from '../interfaces/init-input-domain.interface';
import { ORGANIZATION_REPOSITORY, OrganizationRepository } from '~/domain/common/repositories/organization.repository';
import { MONO_STATUS_REPOSITORY, MonoStatusRepository } from '~/domain/common/repositories/mono-status.repository';
import { PaymentMethodDomainEntity } from '~/domain/payment-method/entities/method-domain.entity';
import { randomUUID } from 'crypto';
import { SystemStatus } from '~/application/system/dto/system-status.dto';

@Injectable()
export class InitDomainService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepository: OrganizationRepository,
    @Inject(MONO_STATUS_REPOSITORY) private readonly monoStatusRepository: MonoStatusRepository
  ) {}

  async init(data: InitInputDomainInterface): Promise<void> {
    const status = await this.monoStatusRepository.getStatus();

    if (status !== SystemStatus.maintenance) {
      throw new BadRequestException('MONO уже инициализирован');
    }

    const { bank_account, ...organization } = data.organization_data;

    // Создаем платежный метод
    const paymentMethod = new PaymentMethodDomainEntity({
      username: config.coopname,
      method_id: randomUUID().toString(),
      method_type: 'bank_transfer',
      data: bank_account,
      is_default: true,
    });

    await generator.save('paymentMethod', paymentMethod);

    // Создаем статус системы
    await this.monoStatusRepository.createInstallStatus();

    // Сохраняем данные организации
    await this.organizationRepository.create({ username: config.coopname, ...organization });

    logger.info('Система инициализирована');
  }
}
