import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { SegmentStatus } from '../../../domain/enums/segment-status.enum';
import { ResultOutputDTO } from '../result_submission/result.dto';
import { BaseOutputDTO } from '~/shared/dto/base.dto';

/**
 * GraphQL Output DTO для сегмента участника в проекте CAPITAL
 */
@ObjectType('CapitalSegment', {
  description: 'Сегмент участника в проекте CAPITAL',
})
export class SegmentOutputDTO extends BaseOutputDTO {
  @Field(() => Int, {
    nullable: true,
    description: 'ID в блокчейне',
  })
  id?: number;

  @Field(() => SegmentStatus, {
    description: 'Статус сегмента',
  })
  status!: SegmentStatus;

  @Field(() => String, {
    nullable: true,
    description: 'Хеш проекта',
  })
  project_hash?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Название кооператива',
  })
  coopname?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Имя пользователя',
  })
  username?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Отображаемое имя пользователя',
  })
  display_name?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Статус из блокчейна',
  })
  blockchain_status?: string;

  // Роли участника в проекте
  @Field(() => Boolean, {
    nullable: true,
    description: 'Роль автора',
  })
  is_author?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Роль создателя',
  })
  is_creator?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Роль координатора',
  })
  is_coordinator?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Роль инвестора',
  })
  is_investor?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Роль пропертора',
  })
  is_propertor?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Роль вкладчика',
  })
  is_contributor?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Наличие права голоса',
  })
  has_vote?: boolean;

  // Вклады инвестора
  @Field(() => String, {
    nullable: true,
    description: 'Сумма инвестиций инвестора',
  })
  investor_amount?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Базовый вклад инвестора',
  })
  investor_base?: string;

  // Вклады создателя
  @Field(() => String, {
    nullable: true,
    description: 'Базовый вклад создателя',
  })
  creator_base?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Бонусный вклад создателя',
  })
  creator_bonus?: string;

  // Вклады автора
  @Field(() => String, {
    nullable: true,
    description: 'Базовый вклад автора',
  })
  author_base?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Бонусный вклад автора',
  })
  author_bonus?: string;

  // Вклады координатора
  @Field(() => String, {
    nullable: true,
    description: 'Инвестиции координатора',
  })
  coordinator_investments?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Базовый вклад координатора',
  })
  coordinator_base?: string;

  // Вклады вкладчика
  @Field(() => String, {
    nullable: true,
    description: 'Бонусный вклад вкладчика',
  })
  contributor_bonus?: string;

  // Имущественные взносы
  @Field(() => String, {
    nullable: true,
    description: 'Базовый имущественный вклад',
  })
  property_base?: string;

  // CRPS поля для масштабируемого распределения наград
  @Field(() => Float, {
    nullable: true,
    description: 'Последняя награда за базовый вклад автора на долю в проекте',
  })
  last_author_base_reward_per_share?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Последняя награда за бонусный вклад автора на долю в проекте',
  })
  last_author_bonus_reward_per_share?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Последняя награда вкладчика на акцию',
  })
  last_contributor_reward_per_share?: number;

  // Доли в программе и проекте
  @Field(() => String, {
    nullable: true,
    description: 'Доли вкладчиков капитала',
  })
  capital_contributor_shares?: string;

  // Последняя известная сумма инвестиций в проекте для расчета provisional_amount
  @Field(() => String, {
    nullable: true,
    description: 'Последняя известная сумма инвестиций в проекте',
  })
  last_known_invest_pool?: string;

  // Последняя известная сумма базового пула создателей для расчета использования инвестиций
  @Field(() => String, {
    nullable: true,
    description: 'Последняя известная сумма базового пула создателей',
  })
  last_known_creators_base_pool?: string;

  // Последняя известная сумма инвестиций координаторов для отслеживания изменений
  @Field(() => String, {
    nullable: true,
    description: 'Последняя известная сумма инвестиций координаторов',
  })
  last_known_coordinators_investment_pool?: string;

  // Финансовые данные для ссуд
  @Field(() => String, {
    nullable: true,
    description: 'Предварительная сумма',
  })
  provisional_amount?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Сумма долга',
  })
  debt_amount?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Сумма погашенного долга',
  })
  debt_settled?: string;

  // Пулы равных премий авторов и прямых премий создателей
  @Field(() => String, {
    nullable: true,
    description: 'Равный бонус автора',
  })
  equal_author_bonus?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Прямой бонус создателя',
  })
  direct_creator_bonus?: string;

  // Результаты голосования по методу Водянова
  @Field(() => String, {
    nullable: true,
    description: 'Бонус голосования',
  })
  voting_bonus?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Флаг завершения расчета голосования',
  })
  is_votes_calculated?: boolean;

  // Общая стоимость сегмента (рассчитывается автоматически)
  @Field(() => String, {
    nullable: true,
    description: 'Общая базовая стоимость сегмента',
  })
  total_segment_base_cost?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Общая бонусная стоимость сегмента',
  })
  total_segment_bonus_cost?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Общая стоимость сегмента',
  })
  total_segment_cost?: string;

  @Field(() => ResultOutputDTO, {
    nullable: true,
    description: 'Связанный результат участника в проекте',
  })
  result?: ResultOutputDTO;
}
