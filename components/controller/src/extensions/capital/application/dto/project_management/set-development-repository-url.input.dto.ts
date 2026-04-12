import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType('SetCapitalProjectDevelopmentRepositoryUrlInput')
export class SetCapitalProjectDevelopmentRepositoryUrlInputDTO {
  @Field(() => String, { description: 'Хэш проекта или компонента' })
  @IsString()
  project_hash!: string;

  @Field(() => String, {
    nullable: true,
    description:
      'URL репозитория на github.com или формат owner/repo; пустая строка / null — сброс и отключение опроса для этого проекта',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  development_repository_url?: string | null;
}
