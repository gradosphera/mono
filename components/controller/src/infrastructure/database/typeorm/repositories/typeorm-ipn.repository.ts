import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IpnEntity } from '../entities/ipn.entity';
import type { IpnRepository, IIpn } from '~/domain/gateway/repositories/ipn.repository';

@Injectable()
export class TypeormIpnRepository implements IpnRepository {
  constructor(
    @InjectRepository(IpnEntity)
    private readonly ipnRepository: Repository<IpnEntity>
  ) {}

  async findOne(criteria: Partial<IIpn>): Promise<IIpn | null> {
    const queryBuilder = this.ipnRepository.createQueryBuilder('ipn');

    if (criteria.provider) {
      queryBuilder.andWhere('ipn.provider = :provider', { provider: criteria.provider });
    }

    // Для поиска по data.object.id нужно использовать JSON path
    if (criteria.data && typeof criteria.data === 'object') {
      const dataCriteria = criteria.data as any;
      if (dataCriteria.object?.id) {
        queryBuilder.andWhere("ipn.data -> 'object' ->> 'id' = :objectId", {
          objectId: dataCriteria.object.id,
        });
      }
    }

    const entity = await queryBuilder.getOne();
    return entity ? this.mapToInterface(entity) : null;
  }

  async create(data: Omit<IIpn, 'id' | 'created_at' | 'updated_at'>): Promise<IIpn> {
    const entity = new IpnEntity(data);
    const savedEntity = await this.ipnRepository.save(entity);
    return this.mapToInterface(savedEntity);
  }

  private mapToInterface(entity: IpnEntity): IIpn {
    return {
      id: entity.id,
      provider: entity.provider,
      data: entity.data,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
}
