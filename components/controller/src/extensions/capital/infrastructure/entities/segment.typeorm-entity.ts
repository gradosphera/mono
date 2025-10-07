import { Entity, Column, Index, JoinColumn, OneToOne } from 'typeorm';
import { SegmentStatus } from '../../domain/enums/segment-status.enum';
import { BaseTypeormEntity } from '~/shared/sync/entities/base-typeorm.entity';
import { ContributorTypeormEntity } from './contributor.typeorm-entity';

export const EntityName = 'capital_segments';
@Entity(EntityName)
@Index(`idx_${EntityName}_id`, ['id'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_coopname`, ['coopname'])
@Index(`idx_${EntityName}_status`, ['status'])
@Index(`idx_${EntityName}_composite_key`, ['project_hash', 'username']) // Составной индекс для быстрого поиска
export class SegmentTypeormEntity extends BaseTypeormEntity {
  static getTableName(): string {
    return EntityName;
  }

  @Column({ type: 'integer', nullable: true, unique: true })
  id?: number;

  // Поля из блокчейна (segments.hpp)
  @Column({ type: 'varchar' })
  project_hash!: string;

  @Column({ type: 'varchar' })
  coopname!: string;

  @Column({ type: 'varchar' })
  username!: string;

  // Связь с вкладчиком для получения display_name
  @OneToOne(() => ContributorTypeormEntity, { nullable: true })
  @JoinColumn([
    { name: 'coopname', referencedColumnName: 'coopname' },
    { name: 'username', referencedColumnName: 'username' },
  ])
  contributor?: ContributorTypeormEntity;

  // Роли участника в проекте
  @Column({ type: 'boolean', default: false })
  is_author!: boolean;

  @Column({ type: 'boolean', default: false })
  is_creator!: boolean;

  @Column({ type: 'boolean', default: false })
  is_coordinator!: boolean;

  @Column({ type: 'boolean', default: false })
  is_investor!: boolean;

  @Column({ type: 'boolean', default: false })
  is_propertor!: boolean;

  @Column({ type: 'boolean', default: false })
  is_contributor!: boolean;

  @Column({ type: 'boolean', default: false })
  has_vote!: boolean;

  // Вклады инвестора
  @Column({ type: 'varchar', nullable: true })
  investor_amount?: string;

  @Column({ type: 'varchar', nullable: true })
  investor_base?: string;

  // Вклады создателя
  @Column({ type: 'varchar', nullable: true })
  creator_base?: string;

  @Column({ type: 'varchar', nullable: true })
  creator_bonus?: string;

  // Вклады автора
  @Column({ type: 'varchar', nullable: true })
  author_base?: string;

  @Column({ type: 'varchar', nullable: true })
  author_bonus?: string;

  // Вклады координатора
  @Column({ type: 'varchar', nullable: true })
  coordinator_investments?: string;

  @Column({ type: 'varchar', nullable: true })
  coordinator_base?: string;

  // Вклады вкладчика
  @Column({ type: 'varchar', nullable: true })
  contributor_bonus?: string;

  // Имущественные взносы
  @Column({ type: 'varchar', nullable: true })
  property_base?: string;

  // CRPS поля для масштабируемого распределения наград
  @Column({ type: 'float', default: 0.0 })
  last_author_base_reward_per_share!: number;

  @Column({ type: 'float', default: 0.0 })
  last_author_bonus_reward_per_share!: number;

  @Column({ type: 'float', default: 0.0 })
  last_contributor_reward_per_share!: number;

  // Доли в программе и проекте
  @Column({ type: 'varchar', nullable: true })
  capital_contributor_shares?: string;

  // Последняя известная сумма инвестиций в проекте для расчета provisional_amount
  @Column({ type: 'varchar', nullable: true })
  last_known_invest_pool?: string;

  // Последняя известная сумма базового пула создателей для расчета использования инвестиций
  @Column({ type: 'varchar', nullable: true })
  last_known_creators_base_pool?: string;

  // Последняя известная сумма инвестиций координаторов для отслеживания изменений
  @Column({ type: 'varchar', nullable: true })
  last_known_coordinators_investment_pool?: string;

  // Финансовые данные для ссуд
  @Column({ type: 'varchar', nullable: true })
  provisional_amount?: string;

  @Column({ type: 'varchar', nullable: true })
  debt_amount?: string;

  @Column({ type: 'varchar', nullable: true })
  debt_settled?: string;

  // Пулы равных премий авторов и прямых премий создателей
  @Column({ type: 'varchar', nullable: true })
  equal_author_bonus?: string;

  @Column({ type: 'varchar', nullable: true })
  direct_creator_bonus?: string;

  // Результаты голосования по методу Водянова
  @Column({ type: 'varchar', nullable: true })
  voting_bonus?: string;

  // Общая стоимость сегмента (рассчитывается автоматически)
  @Column({ type: 'varchar', nullable: true })
  total_segment_base_cost?: string;

  @Column({ type: 'varchar', nullable: true })
  total_segment_bonus_cost?: string;

  @Column({ type: 'varchar', nullable: true })
  total_segment_cost?: string;

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: SegmentStatus,
    default: SegmentStatus.GENERATION,
  })
  status!: SegmentStatus;
}
