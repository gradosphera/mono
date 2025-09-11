import { ObjectType, Field } from '@nestjs/graphql';

/**
 * GraphQL Output DTO для сущности Comment
 */
@ObjectType('CapitalComment', {
  description: 'Комментарий в системе CAPITAL',
})
export class CommentOutputDTO {
  @Field(() => String, {
    description: 'Внутренний ID базы данных',
  })
  _id!: string;

  @Field(() => String, {
    description: 'Содержимое комментария',
  })
  content!: string;

  @Field(() => String, {
    description: 'ID комментатора (contributor)',
  })
  commentor_id!: string;

  @Field(() => String, {
    description: 'ID задачи',
  })
  issue_id!: string;

  @Field(() => String, {
    description: 'Реакции на комментарий',
  })
  reactions!: Record<string, string[]>;

  @Field(() => String, {
    nullable: true,
    description: 'Дата редактирования',
  })
  edited_at?: string;
}
