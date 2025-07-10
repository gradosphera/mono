import { Field, ObjectType } from '@nestjs/graphql';
import { WebPushSubscriptionDto } from './web-push-subscription.dto';

@ObjectType()
export class CreateSubscriptionResponse {
  @Field(() => Boolean, { description: 'Успешно ли создана подписка' })
  success: boolean;

  @Field(() => String, { description: 'Сообщение о результате операции' })
  message: string;

  @Field(() => WebPushSubscriptionDto, { description: 'Данные созданной подписки' })
  subscription: WebPushSubscriptionDto;

  constructor(data: { success: boolean; message: string; subscription: WebPushSubscriptionDto }) {
    this.success = data.success;
    this.message = data.message;
    this.subscription = data.subscription;
  }
}
