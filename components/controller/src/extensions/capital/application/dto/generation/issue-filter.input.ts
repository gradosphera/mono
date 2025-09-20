import { InputType, Field } from '@nestjs/graphql';
import { IssuePriority } from '../../../domain/enums/issue-priority.enum';
import { IssueStatus } from '../../../domain/enums/issue-status.enum';

/**
 * Input DTO для фильтрации задач
 */
@InputType('CapitalIssueFilter', {
  description: 'Параметры фильтрации для запросов задач CAPITAL',
})
export class IssueFilterInputDTO {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по имени аккаунта кооператива',
  })
  coopname?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по названию задачи',
  })
  title?: string;

  @Field(() => IssuePriority, {
    nullable: true,
    description: 'Фильтр по приоритету задачи',
  })
  priority?: IssuePriority;

  @Field(() => IssueStatus, {
    nullable: true,
    description: 'Фильтр по статусу задачи',
  })
  status?: IssueStatus;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по хешу проекта',
  })
  project_hash?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по ID создателя',
  })
  created_by?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по хэшу подмастерья',
  })
  submaster_hash?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по ID цикла',
  })
  cycle_id?: string;

  @Field(() => [String], {
    nullable: true,
    description: 'Фильтр по массиву хэшей создателей',
  })
  creators_hashs?: string[];
}
