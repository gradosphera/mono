import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

/**
 * DTO для получения проекта
 */
@InputType('GetProjectInput')
export class GetProjectInputDTO {
  @Field(() => String, { description: 'Хеш проекта' })
  @IsString()
  hash!: string;
}
