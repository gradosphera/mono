import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class DeactivateSubscriptionInput {
  @Field(() => String, { description: 'ID подписки для деактивации' })
  @IsString()
  @IsNotEmpty()
  subscriptionId!: string;
}
