// infrastructure/repositories/udata.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import type { UdataRepository } from '~/domain/common/repositories/udata.repository';
import type { UdataDomainInterface } from '~/domain/common/interfaces/udata-domain.interface';
import { GENERATOR_PORT, GeneratorPort } from '~/domain/document/ports/generator.port';

@Injectable()
export class UdataRepositoryImplementation implements UdataRepository {
  constructor(@Inject(GENERATOR_PORT) private readonly generatorPort: GeneratorPort) {}

  async save(data: Omit<UdataDomainInterface, '_id' | 'block_num' | 'deleted'>): Promise<void> {
    await this.generatorPort.save('udata', data);
  }

  async get(coopname: string, username: string, key: string, filters?: Partial<Pick<UdataDomainInterface, 'metadata' | 'block_num' | 'deleted'>>): Promise<UdataDomainInterface | null> {
    const filter = {
      coopname,
      username,
      key,
      ...filters,
    };
    const result = await this.generatorPort.get('udata', filter);
    return result as UdataDomainInterface | null;
  }

  async getHistory(coopname: string, username: string, key: string): Promise<UdataDomainInterface[]> {
    const result = await this.generatorPort.getHistory('udata', {
      coopname,
      username,
      key,
    });
    return result as UdataDomainInterface[];
  }

  async getAll(coopname: string, username?: string): Promise<UdataDomainInterface[]> {
    const filter = username ? { coopname, username } : { coopname };
    const result = await this.generatorPort.list('udata', filter);
    return result.results as UdataDomainInterface[];
  }

  async delete(coopname: string, username: string, key: string): Promise<void> {
    await this.generatorPort.del('udata', {
      coopname,
      username,
      key,
    });
  }
}