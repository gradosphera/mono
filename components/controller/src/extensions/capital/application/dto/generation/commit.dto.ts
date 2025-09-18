import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CommitStatus } from '../../../domain/enums/commit-status.enum';
import { BaseOutputDTO } from '../base.dto';

/**
 * GraphQL Output DTO для сущности Commit
 */
@ObjectType('CapitalCommit', {
  description: 'Коммит в системе CAPITAL',
})
export class CommitOutputDTO extends BaseOutputDTO {
  @Field(() => Int, {
    nullable: true,
    description: 'ID в блокчейне',
  })
  id?: number;

  @Field(() => CommitStatus, {
    description: 'Статус коммита',
  })
  status!: CommitStatus;

  @Field(() => String, {
    description: 'Хеш коммита',
  })
  commit_hash!: string;

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
    description: 'Хеш проекта',
  })
  project_hash?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Статус из блокчейна',
  })
  blockchain_status?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Дата создания',
  })
  created_at?: string;

  // TODO: Добавить поле amounts когда будет определена соответствующая структура данных
}
