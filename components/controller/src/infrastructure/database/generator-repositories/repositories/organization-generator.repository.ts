// infrastructure/repositories/organization.repository.ts
import { Injectable } from '@nestjs/common';
import type { Cooperative } from 'cooptypes';
import httpStatus from 'http-status';
import { OrganizationDomainEntity } from '~/domain/branch/entities/organization-domain.entity';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';
import { OrganizationRepository } from '~/domain/common/repositories/organization.repository';
import { HttpApiError } from '~/errors/http-api-error';
import { generator } from '~/services/document.service';

@Injectable()
export class OrganizationRepositoryImplementation implements OrganizationRepository {
  async findByUsername(coopname: string): Promise<OrganizationDomainEntity> {
    // Используем генератор для извлечения данных из базы
    const organization = (await generator.get('organization', {
      username: coopname,
    })) as Cooperative.Users.IOrganizationData;
    if (!organization) throw new HttpApiError(httpStatus.BAD_REQUEST, `Организация ${coopname} не найдена`);

    return new OrganizationDomainEntity(organization);
  }

  async create(data: OrganizationDomainInterface): Promise<void> {
    await generator.save('organization', data);
  }
}
