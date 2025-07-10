import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { CreateSubscriptionInputDomainInterface } from '~/domain/notification/interfaces/create-subscription-input-domain.interface';

@InputType()
export class WebPushSubscriptionKeysInput {
  @Field(() => String, { description: 'P256DH ключ для шифрования' })
  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @Field(() => String, { description: 'Auth ключ для аутентификации' })
  @IsString()
  @IsNotEmpty()
  auth!: string;
}

@InputType()
export class WebPushSubscriptionDataInput {
  @Field(() => String, { description: 'Endpoint для отправки уведомлений' })
  @IsUrl()
  @IsNotEmpty()
  endpoint!: string;

  @Field(() => WebPushSubscriptionKeysInput, { description: 'Ключи для шифрования' })
  @ValidateNested()
  @Type(() => WebPushSubscriptionKeysInput)
  keys!: WebPushSubscriptionKeysInput;
}

@InputType()
export class CreateSubscriptionInput {
  @Field(() => String, { description: 'Username пользователя' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @Field(() => WebPushSubscriptionDataInput, { description: 'Данные подписки' })
  @ValidateNested()
  @Type(() => WebPushSubscriptionDataInput)
  subscription!: WebPushSubscriptionDataInput;

  @Field(() => String, { nullable: true, description: 'User Agent браузера' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  /**
   * Преобразует DTO в доменный интерфейс
   */
  toDomainInterface(): CreateSubscriptionInputDomainInterface {
    return {
      username: this.username,
      subscription: {
        endpoint: this.subscription.endpoint,
        keys: {
          p256dh: this.subscription.keys.p256dh,
          auth: this.subscription.keys.auth,
        },
      },
      userAgent: this.userAgent,
    };
  }
}
