// infrastructure/repositories/organization.repository.ts
import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '~/domain/common/repositories/organization.repository';
import { generator } from '~/services/document.service';

@Injectable()
export class OrganizationRepositoryImplementation implements OrganizationRepository {
  async findByUsername(coopname: string): Promise<any> {
    // Используем генератор для извлечения данных из базы
    return generator.get('organization', { username: coopname });
  }
}
