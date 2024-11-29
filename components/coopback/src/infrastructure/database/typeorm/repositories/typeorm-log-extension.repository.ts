// infrastructure/database/typeorm/repositories/typeorm-app.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogExtensionEntity } from '../entities/log-extension.entity';
import { LogExtensionDomainRepository } from '~/domain/extension/repositories/log-extension-domain.repository';
import { LogExtensionDomainEntity } from '~/domain/extension/entities/log-extension-domain.entity';

@Injectable()
export class TypeOrmLogExtensionDomainRepository<TLog = any> implements LogExtensionDomainRepository<TLog> {
  constructor(
    @InjectRepository(LogExtensionEntity)
    private readonly ormRepo: Repository<LogExtensionEntity<TLog>>
  ) {}

  async push(name: string, data: TLog): Promise<LogExtensionDomainEntity<TLog>> {
    // Создание сущности напрямую, без использования fromDomainEntity
    const ormEntity = this.ormRepo.create({
      name,
      data,
    });

    const savedEntity = await this.ormRepo.save(ormEntity);
    return savedEntity.toDomainEntity();
  }

  async get(): Promise<LogExtensionDomainEntity<TLog>[]> {
    const ormEntities = await this.ormRepo.find();
    return ormEntities.map((ormEntity) => ormEntity.toDomainEntity());
  }
}
