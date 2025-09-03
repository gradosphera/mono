import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class GetUserSubscriptionsInput {
  @Field(() => String, { description: 'Username пользователя' })
  @IsString()
  @IsNotEmpty()
  username!: string;
}
