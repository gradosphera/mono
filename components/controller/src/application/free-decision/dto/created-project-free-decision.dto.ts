import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ProjectFreeDecisionDomainInterface } from '~/domain/common/interfaces/project-free-decision-domain.interface';

@ObjectType('CreatedProjectFreeDecision')
export class CreatedProjectFreeDecisionDTO implements ProjectFreeDecisionDomainInterface {
  @Field(() => String, { description: 'Идентификатор проекта свободного решения' })
  @IsNotEmpty({ message: 'Идентификатор проекта свободного решения не должен быть пустым' })
  @IsString({ message: 'Идентификатор проекта свободного решения должен быть строкой' })
  id!: string;

  @Field(() => String, { description: 'Вопрос, который выносится на повестку' })
  @IsNotEmpty({ message: 'Вопрос повестки не должен быть пустым' })
  question!: string;

  @Field(() => String, {
    description: 'Пользовательский заголовок документа',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Заголовок документа должен быть строкой' })
  @MaxLength(200, { message: 'Заголовок документа должен быть не длиннее 200 символов' })
  title?: string;

  @Field(() => String, {
    description: 'Проект решения, которое предлагается принять',
  })
  @IsString({ message: 'Проект решения должен быть строкой' })
  decision!: string;

  constructor(data: CreatedProjectFreeDecisionDTO) {
    Object.assign(this, data);
  }
}
