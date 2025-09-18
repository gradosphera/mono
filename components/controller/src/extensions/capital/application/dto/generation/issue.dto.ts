import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IssuePriority } from '../../../domain/enums/issue-priority.enum';
import { IssueStatus } from '../../../domain/enums/issue-status.enum';
import GraphQLJSON from 'graphql-type-json';
import { BaseOutputDTO } from '../base.dto';

/**
 * GraphQL Output DTO для сущности Issue
 */
@ObjectType('CapitalIssue', {
  description: 'Задача в системе CAPITAL',
})
export class IssueOutputDTO extends BaseOutputDTO {
  @Field(() => String, {
    description: 'Хеш задачи',
  })
  issue_hash!: string;

  @Field(() => String, {
    description: 'Название задачи',
  })
  title!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Описание задачи',
  })
  description?: string;

  @Field(() => IssuePriority, {
    description: 'Приоритет задачи',
  })
  priority!: IssuePriority;

  @Field(() => IssueStatus, {
    description: 'Статус задачи',
  })
  status!: IssueStatus;

  @Field(() => Int, {
    description: 'Оценка в story points или часах',
  })
  estimate!: number;

  @Field(() => Int, {
    description: 'Порядок сортировки',
  })
  sort_order!: number;

  @Field(() => String, {
    description: 'ID создателя задачи (contributor)',
  })
  created_by!: string;

  @Field(() => String, {
    nullable: true,
    description: 'ID подмастерья (contributor)',
  })
  submaster_id?: string;

  @Field(() => [String], {
    description: 'Массив ID создателей (contributors)',
  })
  creators_ids!: string[];

  @Field(() => String, {
    description: 'Хеш проекта',
  })
  project_hash!: string;

  @Field(() => String, {
    nullable: true,
    description: 'ID цикла',
  })
  cycle_id?: string;

  @Field(() => GraphQLJSON, {
    description: 'Метаданные задачи',
  })
  metadata!: {
    labels: string[];
    attachments: string[];
  };
}
