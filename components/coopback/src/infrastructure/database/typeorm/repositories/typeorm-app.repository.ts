// infrastructure/database/typeorm/repositories/typeorm-app.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppEntity } from '../entities/app.entity';
import { AppStoreDomainRepository } from '~/domain/appstore/repositories/appstore-domain.repository.interface';
import { AppStoreDomainEntity } from '~/domain/appstore/entities/appstore-domain.entity';

@Injectable()
export class TypeOrmAppStoreDomainRepository<TConfig = any> implements AppStoreDomainRepository<TConfig> {
  constructor(
    @InjectRepository(AppEntity)
    private readonly ormRepo: Repository<AppEntity<TConfig>>
  ) {}

  async findByName(name: string): Promise<AppStoreDomainEntity<TConfig> | null> {
    const ormEntity = await this.ormRepo.findOne({ where: { name } });
    return ormEntity ? ormEntity.toDomainEntity() : null;
  }

  async create(data: Partial<AppStoreDomainEntity<TConfig>>): Promise<AppStoreDomainEntity<TConfig>> {
    const ormEntity = this.ormRepo.create(AppEntity.fromDomainEntity(data as AppStoreDomainEntity<TConfig>));
    const savedEntity = await this.ormRepo.save(ormEntity);
    return savedEntity.toDomainEntity();
  }

  async findAll(): Promise<AppStoreDomainEntity<TConfig>[]> {
    const ormEntities = await this.ormRepo.find();
    return ormEntities.map((ormEntity) => ormEntity.toDomainEntity());
  }
}
