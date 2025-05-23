import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetProcessedRepository } from '~/domain/meet/repositories/meet-processed.repository';
import { MeetProcessedDomainEntity } from '~/domain/meet/entities/meet-processed-domain.entity';
import { MeetProcessedEntity } from '../entities/meet-processed.entity';

@Injectable()
export class TypeOrmMeetProcessedRepository implements MeetProcessedRepository {
  constructor(
    @InjectRepository(MeetProcessedEntity)
    private readonly meetProcessedRepository: Repository<MeetProcessedEntity>
  ) {}

  async findByHash(hash: string): Promise<MeetProcessedDomainEntity | null> {
    const upperHash = hash.toUpperCase();
    const entity = await this.meetProcessedRepository.findOne({
      where: { hash: upperHash },
    });

    if (!entity) {
      return null;
    }

    return new MeetProcessedDomainEntity({
      hash: entity.hash,
      coopname: entity.coopname,
      presider: entity.presider,
      secretary: entity.secretary,
      results: entity.results,
      signed_ballots: entity.signed_ballots,
      quorum_percent: entity.quorum_percent,
      quorum_passed: entity.quorum_passed,
      decision: entity.decision,
    });
  }

  async save(data: MeetProcessedDomainEntity): Promise<void> {
    // Создаем сущность для сохранения в БД
    const entity = this.meetProcessedRepository.create({
      hash: data.hash.toUpperCase(),
      coopname: data.coopname,
      presider: data.presider,
      secretary: data.secretary,
      results: data.results,
      signed_ballots: data.signed_ballots,
      quorum_percent: data.quorum_percent,
      quorum_passed: data.quorum_passed,
      decision: data.decision,
    });

    // Сохраняем сущность
    await this.meetProcessedRepository.save(entity);
  }
}
