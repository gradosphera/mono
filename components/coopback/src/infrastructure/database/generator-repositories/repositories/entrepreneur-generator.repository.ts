// infrastructure/repositories/organization.repository.ts
import { Injectable } from '@nestjs/common';
import type { EntrepreneurDomainInterface } from '~/domain/common/interfaces/entrepreneur-domain.interface';
import type { EntrepreneurRepository } from '~/domain/common/repositories/entrepreneur.repository';
import { HttpApiError } from '~/errors/http-api-error';
import httpStatus from 'http-status';
import { EntrepreneurDomainEntity } from '~/domain/branch/entities/entrepreneur-domain.entity';
import { generator } from '~/services/document.service';
import type { Cooperative } from 'cooptypes';

@Injectable()
export class EntrepreneurRepositoryImplementation implements EntrepreneurRepository {
  async findByUsername(username: string): Promise<EntrepreneurDomainEntity> {
    // Используем генератор для извлечения данных из базы
    const entrepreneur = (await generator.get('entrepreneur', { username })) as Cooperative.Users.IEntrepreneurData;
    if (!entrepreneur) {
      throw new HttpApiError(httpStatus.BAD_REQUEST, `Предприниматель ${username} не найден`);
    }
    return new EntrepreneurDomainEntity(entrepreneur);
  }

  async create(data: EntrepreneurDomainInterface): Promise<void> {
    await generator.save('entrepreneur', data);
  }
}
