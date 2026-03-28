import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  ChatCoopCalendarIcsSubscriptionDomainEntity,
  ChatCoopCalendarIcsSubscriptionRepository,
} from '../../domain/repositories/calendar-ics-subscription.repository';
import { CalendarIcsSubscriptionTypeormEntity } from '../entities/calendar-ics-subscription.typeorm-entity';

@Injectable()
export class CalendarIcsSubscriptionTypeormRepository implements ChatCoopCalendarIcsSubscriptionRepository {
  constructor(
    @InjectRepository(CalendarIcsSubscriptionTypeormEntity)
    private readonly repo: Repository<CalendarIcsSubscriptionTypeormEntity>
  ) {}

  async create(
    coopUsername: string,
    secretSha256Hex: string
  ): Promise<ChatCoopCalendarIcsSubscriptionDomainEntity> {
    const row = this.repo.create({
      coopUsername: coopUsername.toLowerCase(),
      secretSha256Hex,
    });
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<ChatCoopCalendarIcsSubscriptionDomainEntity | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByUsername(coopUsername: string): Promise<ChatCoopCalendarIcsSubscriptionDomainEntity | null> {
    const row = await this.repo.findOne({ where: { coopUsername: coopUsername.toLowerCase() } });
    return row ? this.toDomain(row) : null;
  }

  async rotateSecretForUser(
    coopUsername: string,
    secretSha256Hex: string
  ): Promise<ChatCoopCalendarIcsSubscriptionDomainEntity> {
    const u = coopUsername.toLowerCase();
    const existing = await this.repo.findOne({ where: { coopUsername: u } });
    if (!existing) {
      return this.create(coopUsername, secretSha256Hex);
    }
    await this.repo.update({ id: existing.id }, { secretSha256Hex });
    const refreshed = await this.repo.findOneOrFail({ where: { id: existing.id } });
    return this.toDomain(refreshed);
  }

  private toDomain(row: CalendarIcsSubscriptionTypeormEntity): ChatCoopCalendarIcsSubscriptionDomainEntity {
    return {
      id: row.id,
      coopUsername: row.coopUsername,
      secretSha256Hex: row.secretSha256Hex,
      createdAt: row.createdAt,
    };
  }
}
