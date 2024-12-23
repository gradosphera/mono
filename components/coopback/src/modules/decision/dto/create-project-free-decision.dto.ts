import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { ProjectFreeDecisionDomainInterface } from '~/domain/common/interfaces/project-free-decision-domain.interface';

@InputType('CreateProjectFreeDecisionInput')
export class CreateProjectFreeDecisionInputDTO implements Omit<ProjectFreeDecisionDomainInterface, 'id'> {
  @Field(() => String, { description: 'Заголовок проекта свободного решения' })
  @IsNotEmpty({ message: 'Заголовок проекта свободного решения не должен быть пустым' })
  @IsString({ message: 'Заголовок проекта свободного решения должен быть строкой' })
  header!: string;

  @Field(() => String, { description: 'Вопрос, который выносится на повестку' })
  @IsNotEmpty({ message: 'Вопрос повестки не должен быть пустым' })
  question!: string;

  @Field(() => String, {
    description: 'Проект решения, которое предлагается принять',
  })
  @IsString({ message: 'Проект решения должен быть строкой' })
  decision!: string;
}
