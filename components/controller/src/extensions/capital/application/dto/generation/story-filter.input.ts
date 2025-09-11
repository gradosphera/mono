import { InputType, Field } from '@nestjs/graphql';
import { StoryStatus } from '../../../domain/enums/story-status.enum';

/**
 * Input DTO для фильтрации историй
 */
@InputType('CapitalStoryFilter', {
  description: 'Параметры фильтрации для запросов историй CAPITAL',
})
export class StoryFilterInputDTO {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по названию истории',
  })
  title?: string;

  @Field(() => StoryStatus, {
    nullable: true,
    description: 'Фильтр по статусу истории',
  })
  status?: StoryStatus;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по хешу проекта',
  })
  project_hash?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по ID задачи',
  })
  issue_id?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по ID создателя',
  })
  created_by?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по названию кооператива',
  })
  coopname?: string;
}
