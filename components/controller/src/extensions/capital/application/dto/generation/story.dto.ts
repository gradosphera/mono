import { ObjectType, Field, Int } from '@nestjs/graphql';
import { StoryStatus } from '../../../domain/enums/story-status.enum';

/**
 * GraphQL Output DTO для сущности Story
 */
@ObjectType('CapitalStory', {
  description: 'История (критерий выполнения) в системе CAPITAL',
})
export class StoryOutputDTO {
  @Field(() => String, {
    description: 'Внутренний ID базы данных',
  })
  _id!: string;

  @Field(() => String, {
    description: 'Название истории',
  })
  title!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Описание истории',
  })
  description?: string;

  @Field(() => StoryStatus, {
    description: 'Статус истории',
  })
  status!: StoryStatus;

  @Field(() => String, {
    nullable: true,
    description: 'Хеш проекта (если история привязана к проекту)',
  })
  project_hash?: string;

  @Field(() => String, {
    nullable: true,
    description: 'ID задачи (если история привязана к задаче)',
  })
  issue_id?: string;

  @Field(() => String, {
    description: 'ID создателя (contributor)',
  })
  created_by!: string;

  @Field(() => Int, {
    description: 'Порядок сортировки',
  })
  sort_order!: number;

  @Field(() => Date, {
    nullable: true,
    description: 'Дата создания в базе данных',
  })
  _created_at?: Date;

  @Field(() => Date, {
    nullable: true,
    description: 'Дата последнего обновления в базе данных',
  })
  _updated_at?: Date;
}
