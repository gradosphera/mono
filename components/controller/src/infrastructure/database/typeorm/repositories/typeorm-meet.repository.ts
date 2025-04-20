import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetPreEntity } from '../entities/meet-pre.entity';
import { MeetRepository } from '~/domain/meet/repositories/meet.repository';
import { MeetPreProcessingDomainEntity } from '~/domain/meet/entities/meet-pre-domain.entity';
import { HttpApiError } from '~/errors/http-api-error';
import httpStatus from 'http-status';

@Injectable()
export class TypeOrmMeetRepository implements MeetRepository {
  constructor(
    @InjectRepository(MeetPreEntity)
    private readonly meetPreRepo: Repository<MeetPreEntity>
  ) {}

  async findByHash(hash: string): Promise<MeetPreProcessingDomainEntity> {
    const ormEntity = await this.meetPreRepo.findOne({ where: { hash } });

    if (!ormEntity) {
      throw new HttpApiError(httpStatus.BAD_REQUEST, `Собрание с хешем ${hash} не найдено`);
    }

    return ormEntity.toDomainEntity();
  }

  async create(data: MeetPreProcessingDomainEntity): Promise<void> {
    const ormEntity = MeetPreEntity.fromDomainEntity(data);
    await this.meetPreRepo.save(ormEntity);
  }
}
