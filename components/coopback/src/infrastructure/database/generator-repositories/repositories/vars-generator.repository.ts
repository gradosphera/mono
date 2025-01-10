// infrastructure/repositories/organization.repository.ts
import { Injectable } from '@nestjs/common';
import type { VarsRepository } from '~/domain/common/repositories/vars.repository';
import type { VarsDomainInterface } from '~/domain/system/interfaces/vars-domain.interface';
import { generator } from '~/services/document.service';
import type { ISetVars } from '~/types';

@Injectable()
export class VarsRepositoryImplementation implements VarsRepository {
  async get(): Promise<VarsDomainInterface | null> {
    // Используем генератор для извлечения данных из базы
    const vars = await generator.get('vars', {});
    return vars as VarsDomainInterface;
  }

  async create(data: VarsDomainInterface): Promise<void> {
    //TODO исключить приведение типов здесь после нормальной типизации генератора
    await generator.save('vars', data as ISetVars);
  }
}
