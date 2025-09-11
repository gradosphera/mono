import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

/**
 * DTO для получения вкладчика
 */
@InputType('GetContributorInput')
export class GetContributorInputDTO {
  @Field(() => String, { description: 'ID вкладчика' })
  @IsString()
  _id!: string;
}
