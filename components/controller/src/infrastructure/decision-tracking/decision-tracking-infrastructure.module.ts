import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecisionTrackingAdapter } from './adapters/decision-tracking.adapter';
import { TrackingRuleRepository } from './repositories/tracking-rule.repository';
import { TrackingRuleTypeormRepository } from './repositories/tracking-rule.typeorm-repository';
import { TrackingRuleEntity } from './entities/tracking-rule.entity';
import { DECISION_TRACKING_PORT } from '~/domain/decision-tracking/ports/decision-tracking.port';
import { SystemInfrastructureModule } from '~/infrastructure/system/system-infrastructure.module';

/**
 * Модуль инфраструктуры для отслеживания решений
 *
 * Примечание: TrackingRuleEntity регистрируется в общем TypeOrmModule (дефолтное подключение)
 * и переиспользуется здесь через forFeature для работы репозитория
 */
@Module({
  imports: [SystemInfrastructureModule, TypeOrmModule.forFeature([TrackingRuleEntity])],
  providers: [
    TrackingRuleTypeormRepository,
    {
      provide: TrackingRuleRepository,
      useClass: TrackingRuleTypeormRepository,
    },
    DecisionTrackingAdapter, // Единственная регистрация адаптера
    {
      provide: DECISION_TRACKING_PORT,
      useExisting: DecisionTrackingAdapter, // Используем useExisting вместо useClass
    },
  ],
  exports: [DECISION_TRACKING_PORT],
})
export class DecisionTrackingInfrastructureModule {}
