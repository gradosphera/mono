// infrastructure/repositories/organization.repository.ts
import { Injectable } from '@nestjs/common';
import type { Cooperative } from 'cooptypes';
import httpStatus from 'http-status';
import { IndividualDomainEntity } from '~/domain/branch/entities/individual-domain.entity';
import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';
import type { IndividualRepository } from '~/domain/common/repositories/individual.repository';
import { HttpApiError } from '~/errors/http-api-error';
import { generator } from '~/services/document.service';

@Injectable()
export class IndividualRepositoryImplementation implements IndividualRepository {
  async findByUsername(username: string): Promise<IndividualDomainEntity> {
    // Используем генератор для извлечения данных из базы
    const individual = (await generator.get('individual', { username })) as Cooperative.Users.IIndividualData;
    if (!individual) throw new HttpApiError(httpStatus.BAD_REQUEST, `Пользователь ${username} не найден`);
    else return new IndividualDomainEntity(individual);
  }

  async create(data: IndividualDomainInterface): Promise<void> {
    await generator.save('individual', data);
  }
}
