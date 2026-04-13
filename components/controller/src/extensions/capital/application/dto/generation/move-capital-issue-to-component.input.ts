import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Перенос задачи между компонентами одного проекта (без участия в закоммиченной экономике).
 */
@InputType('MoveCapitalIssueToComponentInput')
export class MoveCapitalIssueToComponentInputDTO {
  @Field(() => String, { description: 'Хеш задачи' })
  @IsNotEmpty()
  @IsString()
  issue_hash!: string;

  @Field(() => String, { description: 'project_hash компонента, в который переносим задачу' })
  @IsNotEmpty()
  @IsString()
  target_project_hash!: string;
}
