import { Injectable } from '@nestjs/common';
import type { TrackingRuleDomainInterface } from '~/domain/decision-tracking/interfaces/tracking-rule-domain.interface';

/**
 * Абстрактный репозиторий для правил отслеживания решений
 * Интерфейс для работы с правилами отслеживания независимо от реализации
 */
@Injectable()
export abstract class TrackingRuleRepository {
  abstract save(rule: TrackingRuleDomainInterface): Promise<TrackingRuleDomainInterface>;
  abstract findById(id: string): Promise<TrackingRuleDomainInterface | null>;
  abstract findByHash(hash: string): Promise<TrackingRuleDomainInterface | null>;
  abstract findAllActive(): Promise<TrackingRuleDomainInterface[]>;
  abstract update(rule: TrackingRuleDomainInterface): Promise<TrackingRuleDomainInterface>;
  abstract delete(id: string): Promise<void>;
}
