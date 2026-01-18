import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  TrackingRuleDomainInterface,
  DecisionEventType,
} from '~/domain/decision-tracking/interfaces/tracking-rule-domain.interface';
import { TrackingRuleEntity } from '../entities/tracking-rule.entity';

/**
 * TypeORM репозиторий для правил отслеживания решений
 */
@Injectable()
export class TrackingRuleTypeormRepository {
  constructor(
    @InjectRepository(TrackingRuleEntity)
    private readonly repository: Repository<TrackingRuleEntity>
  ) {}

  async save(rule: TrackingRuleDomainInterface): Promise<TrackingRuleDomainInterface> {
    const entity = this.toEntity(rule);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async findById(id: string): Promise<TrackingRuleDomainInterface | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByHash(hash: string): Promise<TrackingRuleDomainInterface | null> {
    const entity = await this.repository.findOne({
      where: { hash, active: true },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAllActive(): Promise<TrackingRuleDomainInterface[]> {
    const entities = await this.repository.find({
      where: { active: true },
      order: { created_at: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async update(rule: TrackingRuleDomainInterface): Promise<TrackingRuleDomainInterface> {
    const entity = this.toEntity(rule);
    await this.repository.update(rule.id, entity);
    const updatedEntity = await this.repository.findOne({ where: { id: rule.id } });
    if (!updatedEntity) {
      throw new Error(`Tracking rule with id ${rule.id} not found after update`);
    }
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toEntity(domain: TrackingRuleDomainInterface): TrackingRuleEntity {
    const entity = new TrackingRuleEntity();
    entity.id = domain.id;
    entity.hash = domain.hash;
    entity.event_type = domain.event_type;
    entity.vars_field = domain.vars_field;
    entity.metadata = domain.metadata;
    entity.active = domain.active;
    entity.created_at = domain.created_at;
    return entity;
  }

  private toDomain(entity: TrackingRuleEntity): TrackingRuleDomainInterface {
    return {
      id: entity.id,
      hash: entity.hash,
      event_type: entity.event_type as DecisionEventType,
      vars_field: entity.vars_field,
      metadata: entity.metadata ?? {},
      active: entity.active,
      created_at: entity.created_at,
    };
  }
}
